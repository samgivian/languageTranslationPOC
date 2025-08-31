import express from 'express';
import fs from 'fs/promises';
import path from 'path';

// Best-effort load of .env without hard dependency during dev
try {
  const { config } = await import('dotenv');
  config();
} catch (e) {
  // If dotenv isn't installed, continue; env may come from the host
}

const app = express();
const PORT = process.env.PORT || 3001;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// File-backed cache: { [lang]: { [source]: translation } }
const CACHE_DIR = process.env.CACHE_DIR || path.join(process.cwd(), 'data');
const CACHE_FILE = path.join(CACHE_DIR, 'translations.json');
const CLIENT_CACHE_FILE = path.join(process.cwd(), 'public', 'translations.json');
let CACHE = {};
let saveTimer = null;
let BACKOFF_UNTIL = 0; // epoch ms; do not call provider before this

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function ensureCacheLoaded() {
  try { await fs.mkdir(CACHE_DIR, { recursive: true }); } catch (_) {}
  try {
    const raw = await fs.readFile(CACHE_FILE, 'utf8');
    CACHE = JSON.parse(raw) || {};
  } catch (_) {
    CACHE = {};
  }
  // Seed from public/translations.json if present
  try {
    const seed = JSON.parse(await fs.readFile(CLIENT_CACHE_FILE, 'utf8'));
    if (seed && typeof seed === 'object') {
      for (const lang of Object.keys(seed)) {
        CACHE[lang] = CACHE[lang] || {};
        Object.assign(CACHE[lang], seed[lang] || {});
      }
    }
  } catch (_) {}

  // Ensure server cache file exists on first boot (client file is developer-managed and read-only)
  const payload = JSON.stringify(CACHE, null, 2);
  if (!(await exists(CACHE_FILE))) {
    try { await fs.writeFile(CACHE_FILE, payload); console.log('[server] Created cache file:', CACHE_FILE); } catch (_) {}
  }
}

function scheduleSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(async () => {
    saveTimer = null;
    const payload = JSON.stringify(CACHE, null, 2);
    try { await fs.writeFile(CACHE_FILE, payload); }
    catch (e) { console.warn('[server] Failed to save server cache', e); }
  }, 200);
}

function nowMs() { return Date.now(); }
async function honorBackoff() {
  const wait = Math.max(0, BACKOFF_UNTIL - nowMs());
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
}

if (!OPENAI_API_KEY) {
  console.warn('[server] OPENAI_API_KEY is not set. /api/translate will return 503.');
}

app.use(express.json({ limit: '1mb' }));

// Simple CORS for local dev. In production, scope this to your origin.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

await ensureCacheLoaded();

app.post('/api/translate', async (req, res) => {
  try {
    const { phrases, lang } = req.body || {};
    if (!Array.isArray(phrases) || !lang) return res.status(400).json({ error: 'Invalid payload' });
    // Prepare response with cached values
    const langStore = (CACHE[lang] = CACHE[lang] || {});
    const mapping = {};
    const missing = [];
    for (const p of phrases) {
      if (langStore[p] != null) mapping[p] = langStore[p];
      else missing.push(p);
    }

    // If nothing to fetch or server not configured with key, return what we have
    console.log(`[server] /api/translate lang=${lang} total=${phrases.length} cached=${phrases.length - missing.length} missing=${missing.length}${OPENAI_API_KEY ? '' : ' (NO_API_KEY)'}`);
    if (!missing.length || !OPENAI_API_KEY) {
      if (!OPENAI_API_KEY && missing.length) {
        console.warn('[server] Missing OPENAI_API_KEY; returning only cached results');
      }
      return res.json({ mapping });
    }

    // Respect rate-limit backoff window if present
    await honorBackoff();

    // Request translations for missing items as a single batch
    const prompt = [
      `Translate each item to ${lang}.`,
      'Return ONLY JSON as either:',
      '1) { "<source>": "<translation>", ... }',
      '2) ["<translation>", ...] same length/order as input array.',
      'Input: ' + JSON.stringify(missing)
    ].join('\n');

    const body = {
      model: OPENAI_MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are a translation engine. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ]
    };

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!r.ok) {
      const retryAfter = r.headers.get('retry-after');
      if (r.status === 429) {
        const sec = retryAfter ? parseInt(retryAfter, 10) : 10;
        const ms = Number.isNaN(sec) ? 10_000 : sec * 1000;
        BACKOFF_UNTIL = Date.now() + ms;
        res.setHeader('Retry-After', retryAfter || String(Math.ceil(ms / 1000)));
      }
      const text = await r.text();
      try { JSON.parse(text); } catch { res.type('application/json'); }
      console.warn('[server] provider error', r.status, text.slice(0, 200));
      // Return only cached mapping; client will retry later
      return res.status(r.status).send(text);
    }

    const data = await r.json();
    const raw = data?.choices?.[0]?.message?.content ?? '{}';

    let translated = {};
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        translated = parsed;
      } else if (Array.isArray(parsed)) {
        const out = {};
        for (let i = 0; i < Math.min(parsed.length, missing.length); i++) out[missing[i]] = parsed[i];
        translated = out;
      }
    } catch (_) {
      // Attempt to extract JSON content
      const s = String(raw || '');
      const objStart = s.indexOf('{'); const objEnd = s.lastIndexOf('}');
      if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) translated = JSON.parse(s.slice(objStart, objEnd + 1));
      else {
        const arrStart = s.indexOf('['); const arrEnd = s.lastIndexOf(']');
        if (arrStart !== -1 && arrEnd !== -1 && arrEnd > arrStart) {
          const a = JSON.parse(s.slice(arrStart, arrEnd + 1));
          const out = {};
          for (let i = 0; i < Math.min(a.length, missing.length); i++) out[missing[i]] = a[i];
          translated = out;
        }
      }
    }

    // Merge into cache. Cache identity results too so we don't re-request, but skip empty strings.
    let changed = false;
    for (const [src, dst] of Object.entries(translated || {})) {
      if (typeof dst === 'string' && dst.trim()) {
        if (langStore[src] !== dst) { langStore[src] = dst; changed = true; }
        mapping[src] = dst; // include in response even if identity
      }
    }
    if (changed) scheduleSave();

    return res.json({ mapping });
  } catch (e) {
    console.error('[server] /api/translate error', e);
    return res.status(500).json({ error: 'translate_failed' });
  }
});

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});

// Diagnostics
app.get('/api/cache/stats', async (_req, res) => {
  const stats = {};
  for (const [lang, map] of Object.entries(CACHE)) stats[lang] = Object.keys(map || {}).length;
  res.json({ stats, files: { server: CACHE_FILE, client: CLIENT_CACHE_FILE } });
});

app.get('/api/health', async (_req, res) => {
  res.json({
    openaiConfigured: !!OPENAI_API_KEY,
    backoffUntil: BACKOFF_UNTIL,
    cacheDir: CACHE_DIR
  });
});
