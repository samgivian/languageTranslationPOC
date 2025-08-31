(() => {
  const CONFIG = {
    DEFAULT_LANG: "fr",
    BATCH_SIZE: 80,
    MAX_RETRIES: 1,
    VISIBLE_ONLY: false,
    SKIP_SELECTORS: ["[data-no-translate]", ".no-l10n", ".p-mask"],
    PSEUDO_ATTRS: ["data-i18n-before", "data-i18n-after"],
    LOG_ENDPOINT: null, // set to '/log' on a server that supports it
    SHOW_UI: true // show built-in language control (button + selector)
  };

  let ACTIVE = false;
  let TARGET_LANG = CONFIG.DEFAULT_LANG;
  let WRITING = false;
  let OBSERVER = null;
  let UNPATCH = null;
  const seen = new WeakMap();
  // Keep originals so we can restore English text/attrs when disabled or switching to 'en'
  const originalsText = new WeakMap(); // Node -> original nodeValue
  const originalsAttr = new WeakMap(); // Element -> { attr: originalValue }
  let translateQueued = false;
  let CONTROL = null; // script-driven UI (button + selector)

  let TRANSLATIONS = {};
  const translationsReady = fetch('/translations.json')
    .then(r => r.ok ? r.json() : {})
    .then(data => { TRANSLATIONS = data || {}; })
    .catch(() => {});

  // Track in-flight translation calls by payload key to avoid duplicate requests.
  const INFLIGHT = new Map(); // key -> Promise<Map<string,string>>
  let BACKOFF_UNTIL = 0; // epoch ms until which no requests should be sent
  let LOADING_COUNT = 0; // active translate requests

  function showOverlay() {
    if (document.getElementById('translator-loading-overlay')) return;
    const el = document.createElement('div');
    el.id = 'translator-loading-overlay';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    Object.assign(el.style, {
      position: 'fixed', inset: '0', background: 'rgba(0,0,0,.4)', zIndex: '2147483647',
      display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'all'
    });
    const box = document.createElement('div');
    Object.assign(box.style, {
      background: '#fff', padding: '16px 20px', borderRadius: '8px', minWidth: '260px', textAlign: 'center',
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
    });
    const title = document.createElement('div'); title.textContent = 'Translating…'; title.style.fontWeight = '600'; title.style.marginBottom = '6px';
    const msg = document.createElement('div'); msg.textContent = 'Please wait while we fetch translations.'; msg.style.fontSize = '14px';
    box.appendChild(title); box.appendChild(msg); el.appendChild(box);
    document.body.appendChild(el);
    try { document.body.dataset._overflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; } catch (_) {}
  }

  function hideOverlay() {
    const el = document.getElementById('translator-loading-overlay');
    if (el) el.remove();
    try { if ('_overflow' in document.body.dataset) { document.body.style.overflow = document.body.dataset._overflow || ''; delete document.body.dataset._overflow; } } catch (_) {}
  }

  function incLoading() { LOADING_COUNT++; if (LOADING_COUNT === 1) showOverlay(); }
  function decLoading() { if (LOADING_COUNT > 0) LOADING_COUNT--; if (LOADING_COUNT === 0) hideOverlay(); }

  function delay(ms){ return new Promise(r => setTimeout(r, ms)); }
  async function honorBackoff(){
    const wait = Math.max(0, BACKOFF_UNTIL - Date.now());
    if (wait > 0) await delay(wait);
  }
  function applyBackoffFromErrorMessage(msg){
    try {
      const data = JSON.parse(msg);
      const details = data?.error?.details || [];
      // Try RetryInfo retryDelay like "12s"
      let ms = 0;
      for (const d of details) {
        const rd = d?.retryDelay;
        if (rd && typeof rd === 'string') {
          const m = rd.match(/(\d+)(ms|s)/);
          if (m) ms = Math.max(ms, parseInt(m[1], 10) * (m[2] === 's' ? 1000 : 1));
        }
      }
      if (!ms) ms = 10_000; // default 10s
      BACKOFF_UNTIL = Date.now() + ms;
      console.warn('[Translator] Rate limited. Backing off for', ms, 'ms');
      setTimeout(() => { if (ACTIVE) scheduleTranslate(); }, ms + 100);
    } catch (_) {}
  }

  function applyBackoffFromHeaders(r){
    try {
      const ra = r.headers.get('retry-after');
      let ms = 0;
      if (ra) {
        const sec = parseInt(ra, 10);
        if (!Number.isNaN(sec)) ms = Math.max(ms, sec * 1000);
      }
      if (!ms) ms = 10_000;
      BACKOFF_UNTIL = Date.now() + ms;
      console.warn('[Translator] Rate limited (header). Backing off for', ms, 'ms');
      setTimeout(() => { if (ACTIVE) scheduleTranslate(); }, ms + 100);
    } catch (_) {}
  }

  // Frontend cache: prefer localStorage (persists across sessions),
  // fall back to sessionStorage if localStorage is unavailable.
  // Client caches
  // - Static cache: developer-provided /public/translations.json (read-only)
  // - Session cache: per-tab cache of values returned by the backend (write-only for responses)
  //   This avoids re-requesting the same phrases during a session while keeping
  //   developer-provided translations authoritative.
  const sessionCache = {};
  function getSessionCache(lang) {
    if (!sessionCache[lang]) {
      try {
        sessionCache[lang] = JSON.parse(sessionStorage.getItem('translations_' + lang)) || {};
      } catch (_) { sessionCache[lang] = {}; }
    }
    return sessionCache[lang];
  }
  function saveSessionCache(lang) {
    try { sessionStorage.setItem('translations_' + lang, JSON.stringify(sessionCache[lang])); } catch (_) {}
  }

  function ensureSessionCacheInitialized(lang) {
    try {
      const k = 'translations_' + lang;
      if (sessionStorage.getItem(k) == null) {
        sessionStorage.setItem(k, '{}');
      }
    } catch (_) {}
  }

  // No purge needed since we don't store dynamic entries on the client.

  // Emit a lightweight event when we detect SPA navigation or major DOM changes.
  function emitSoftNavigation(reason) {
    try {
      const detail = { href: location.href, reason: String(reason || '') };
      window.dispatchEvent(new CustomEvent('soft-navigation', { detail }));
    } catch (_) {}
  }

  function setHtmlLanguage(code) {
    const rtl = ["ar","he","fa","ur"].includes(code);
    const html = document.documentElement;
    html.setAttribute("lang", code);
    html.setAttribute("dir", rtl ? "rtl" : "ltr");
    html.style.direction = rtl ? "rtl" : "ltr";
  }

  function isVisible(el) {
    if (!el || !el.getClientRects) return true;
    const r = el.getClientRects()[0];
    if (!r) return false;
    const vw = innerWidth || document.documentElement.clientWidth;
    const vh = innerHeight || document.documentElement.clientHeight;
    return r.bottom >= 0 && r.right >= 0 && r.top <= vh && r.left <= vw;
  }

  function isSkippable(node) {
    for (let n = node; n; n = n.parentNode) {
      if (n instanceof HTMLElement) {
        const t = n.tagName;
        if (t === "SCRIPT" || t === "STYLE" || t === "CODE" || t === "PRE") return true;
        if (n.closest("[data-no-translate]")) return true;
      }
    }
    return false;
  }

  function collectTextNodes(root, skipSelectors) {
    const out = [];
    const skipIslands = (skipSelectors && skipSelectors.length)
      ? root.querySelectorAll(skipSelectors.join(","))
      : [];
    const skipSet = new Set(skipIslands);

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const txt = node.nodeValue;
        if (!txt || !txt.trim()) return NodeFilter.FILTER_REJECT;
        if (isSkippable(node)) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement; if (!parent) return NodeFilter.FILTER_REJECT;
        for (const el of skipSet) { if (el.contains(parent)) return NodeFilter.FILTER_REJECT; }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    for (let cur = walker.nextNode(); cur; cur = walker.nextNode()) out.push(cur);
    return out;
  }

  function collectPseudoAttrItems(root, attrNames, skipSelectors) {
    const items = [];
    let skipSet = null;
    if (skipSelectors && skipSelectors.length) {
      skipSet = new Set(root.querySelectorAll(skipSelectors.join(",")));
    }
    for (const attr of attrNames) {
      root.querySelectorAll("[" + attr + "]").forEach(el => {
        if (skipSet) {
          // Skip if this element is inside any skip island
          for (const island of skipSet) { if (island.contains(el)) return; }
        }
        const v = el.getAttribute(attr);
        if (v && v.trim()) items.push({ kind: "attr", el, attr, value: v });
      });
    }
    return items;
  }

  const chunk = (arr, size) => {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  };

  async function geminiTranslate(phrases, lang) {

    const prompt =
      "Translate each item to " + lang + ".\n" +
      "Return ONLY JSON in one of these forms (no extra text):\n" +
      "1) An object mapping exact input strings to translated strings.\n" +
      "2) A JSON array of translated strings of the same length and order as the input array.\n" +
      "Input: " + JSON.stringify(phrases);

    const body = { phrases, lang };

    // Optional: log payload to server
    if (CONFIG.LOG_ENDPOINT) {
      fetch(CONFIG.LOG_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }).catch(() => {});
    }

    function parseGeminiMapping(rawText, inputs) {
      // Returns Map<input,string>
      try {
        const parsed = JSON.parse(rawText);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          const m = new Map();
          for (const k of Object.keys(parsed)) m.set(k, parsed[k]);
          return m;
        }
        if (Array.isArray(parsed)) {
          const m = new Map();
          for (let i = 0; i < Math.min(parsed.length, inputs.length); i++) m.set(inputs[i], parsed[i]);
          return m;
        }
      } catch (_) {
        // Try to extract JSON from code fences or raw text
        try {
          const s = String(rawText || '');
          let t = s.replace(/```(?:json)?\s*([\s\S]*?)\s*```/gi, '$1');
          // Try object first
          const objStart = t.indexOf('{'); const objEnd = t.lastIndexOf('}');
          if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
            const inner = t.slice(objStart, objEnd + 1);
            const o = JSON.parse(inner);
            if (o && typeof o === 'object' && !Array.isArray(o)) {
              const m = new Map();
              for (const k of Object.keys(o)) m.set(k, o[k]);
              return m;
            }
          }
          const arrStart = t.indexOf('['); const arrEnd = t.lastIndexOf(']');
          if (arrStart !== -1 && arrEnd !== -1 && arrEnd > arrStart) {
            const a = JSON.parse(t.slice(arrStart, arrEnd + 1));
            if (Array.isArray(a)) {
              const m = new Map();
              for (let i = 0; i < Math.min(a.length, inputs.length); i++) m.set(inputs[i], a[i]);
              return m;
            }
          }
        } catch (_) {}
      }
      return new Map();
    }

    const payloadKey = 'api|' + lang + '|' + JSON.stringify(phrases);
    if (INFLIGHT.has(payloadKey)) return INFLIGHT.get(payloadKey);

    const run = (async () => {
      incLoading();
      try {
      for (let attempt = 0; attempt <= CONFIG.MAX_RETRIES; attempt++) {
          try {
            await honorBackoff();
            console.log("[Translator] Sending to API:", phrases);
            const r = await fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body)
            });
            if (!r.ok) {
              const text = await r.text();
              if (r.status === 429) applyBackoffFromHeaders(r);
              throw new Error(text);
            }
            const data = await r.json();
            const mapping = data?.mapping || {};
            const raw = JSON.stringify(mapping);
            const map = parseGeminiMapping(raw, phrases);
            if (map.size) {
              if (map.size !== phrases.length) console.warn('[Translator] API returned size', map.size, 'expected', phrases.length);
              else console.log("[Translator] Received from API (map)", Object.fromEntries(map));
              return map;
            }
          } catch (e) {
            console.warn("[Translator] API error:", e);
          }
      }
      // Fallback: identity mappings
      const id = new Map();
      for (const p of phrases) id.set(p, p);
      return id;
      } finally { decLoading(); }
    })();

    INFLIGHT.set(payloadKey, run);
    try {
      return await run;
    } finally {
      INFLIGHT.delete(payloadKey);
    }
  }

  async function translateBatch(phrases, lang) {
    await translationsReady;
    const out = new Array(phrases.length);
    const missing = [];
    const missingIdx = [];
    const staticCache = TRANSLATIONS[lang] || {};
    const sessionStore = getSessionCache(lang);

    for (let i = 0; i < phrases.length; i++) {
      const p = phrases[i];
      // Prefer developer-provided static translations
      if (staticCache[p] != null) {
        out[i] = staticCache[p];
      } else if (sessionStore[p] != null) {
        // Then use per-session cache of server responses
        out[i] = sessionStore[p];
      } else {
        missing.push(p);
        missingIdx.push(i);
      }
    }

    if (missing.length) {
      const uniqueMissing = [];
      const seenMissing = new Set();
      for (const phrase of missing) {
        if (!seenMissing.has(phrase)) {
          seenMissing.add(phrase);
          uniqueMissing.push(phrase);
        }
      }
      let map = await geminiTranslate(uniqueMissing, lang);
      // If some items are missing from the map, translate those per-item sequentially.
      if (!(map instanceof Map)) map = new Map(map);
      const unresolved = uniqueMissing.filter(p => !map.has(p) || typeof map.get(p) !== 'string');
      if (unresolved.length) {
        console.warn('[Translator] Resolving', unresolved.length, 'items per-item');
        for (const phrase of unresolved) {
          try {
            const single = await geminiTranslate([phrase], lang);
            if (single instanceof Map) map.set(phrase, single.get(phrase));
          } catch (_) {}
        }
      }
      for (let i = 0; i < missing.length; i++) {
        const phrase = missing[i];
        const val = map.get(phrase);
        const effective = (typeof val === 'string') ? val : phrase;
        out[missingIdx[i]] = effective;
        // Store all string responses (including identity) in the session cache
        if (typeof val === 'string') {
          sessionStore[phrase] = val;
        }
      }
      saveSessionCache(lang);
    }

    return out;
  }

  async function translateDocument() {
    if (!ACTIVE) return;
    if (TARGET_LANG === 'en') { restoreDocument(); return; }

    let textNodes = collectTextNodes(document.body, CONFIG.SKIP_SELECTORS);
    if (CONFIG.VISIBLE_ONLY) textNodes = textNodes.filter(n => isVisible(n.parentElement));

    const textItems = textNodes.map(node => {
      const raw = node.nodeValue;
      return {
        kind: "text",
        node,
        value: raw.trim(),
        leading: raw.match(/^\s*/)[0],
        trailing: raw.match(/\s*$/)[0]
      };
    });
    const attrItems = collectPseudoAttrItems(document, CONFIG.PSEUDO_ATTRS, CONFIG.SKIP_SELECTORS);
    const allItems = [...textItems, ...attrItems];
    if (!allItems.length) return;

    const inputs = [], refs = [];
    for (const it of allItems) {
      const src = it.kind === "text" ? it.node.nodeValue : it.value;
      if (it.kind === "text" && seen.get(it.node) === src) continue;
      // Skip items that are purely numeric so they are not sent for translation
      if (/^\s*[\d.,]+\s*$/.test(it.value)) continue;
      inputs.push(it.value);
      refs.push(it);
    }
    if (!inputs.length) return;

    const groups = chunk(inputs, CONFIG.BATCH_SIZE);
    let offset = 0;
    for (const g of groups) {
      const out = await translateBatch(g, TARGET_LANG);
      WRITING = true;
      try {
        for (let i = 0; i < g.length; i++) {
          const ref = refs[offset + i];
          const val = out[i];
          if (val == null) continue;
          if (ref.kind === "text") {
            if (ref.node && ref.node.isConnected) {
              if (!originalsText.has(ref.node)) originalsText.set(ref.node, ref.node.nodeValue);
              const translated = val.trim();
              ref.node.nodeValue = (ref.leading || "") + translated + (ref.trailing || "");
              seen.set(ref.node, ref.node.nodeValue);
            }
          } else if (ref.el && ref.el.setAttribute) {
            let pack = originalsAttr.get(ref.el);
            if (!pack) { pack = {}; originalsAttr.set(ref.el, pack); }
            if (!(ref.attr in pack)) pack[ref.attr] = ref.el.getAttribute(ref.attr);
            ref.el.setAttribute(ref.attr, val);
          }
        }
      } finally {
        WRITING = false;
      }
      offset += g.length;
    }
  }

  function restoreDocument() {
    // Restore text nodes
    let textNodes = collectTextNodes(document.body, CONFIG.SKIP_SELECTORS);
    for (const node of textNodes) {
      const orig = originalsText.get(node);
      if (typeof orig === 'string' && node.nodeValue !== orig) {
        node.nodeValue = orig;
      }
      // Clear seen so future translations re-process
      seen.delete(node);
    }
    // Restore pseudo-attributes
    for (const attr of CONFIG.PSEUDO_ATTRS) {
      const els = document.querySelectorAll('[' + attr + ']');
      els.forEach(el => {
        const pack = originalsAttr.get(el);
        if (pack && Object.prototype.hasOwnProperty.call(pack, attr)) {
          const orig = pack[attr];
          if (orig == null) el.removeAttribute(attr); else el.setAttribute(attr, orig);
        }
      });
    }
    // Ensure loading overlay is not visible when restoring
    try { LOADING_COUNT = 0; } catch (_) {}
    hideOverlay();
  }

  function scheduleTranslate() {
    if (!ACTIVE || translateQueued) return;
    translateQueued = true;
    setTimeout(() => { translateQueued = false; translateDocument(); }, 120);
  }

  function updateControlUI() {
    if (!CONTROL) return;
    const sel = CONTROL.querySelector('select');
    const btn = CONTROL.querySelector('button');
    if (sel) {
      sel.value = ACTIVE ? (TARGET_LANG || 'en') : 'off';
    }
    if (btn) btn.textContent = ACTIVE ? 'Disable Translate' : 'Enable Translate';
  }

  function ensureControlUI() {
    if (!CONFIG.SHOW_UI || CONTROL) return;
    const el = document.createElement('div');
    el.id = 'translator-control';
    el.setAttribute('data-no-translate', 'true');
    Object.assign(el.style, {
      position: 'fixed', right: '16px', bottom: '16px', background: '#ffffff', color: '#222',
      border: '1px solid #ddd', borderRadius: '8px', padding: '8px 10px', boxShadow: '0 6px 18px rgba(0,0,0,.18)',
      display: 'flex', gap: '8px', alignItems: 'center', zIndex: '2147483647', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
    });
    const label = document.createElement('label');
    label.textContent = 'Language:';
    label.style.fontSize = '13px';
    const sel = document.createElement('select');
    Object.assign(sel.style, { fontSize: '13px', padding: '2px 4px' });
    sel.innerHTML = [
      { v:'off', t:'Off' },
      { v:'en', t:'English (en)' },
      { v:'fr', t:'Français (fr)' },
      { v:'es', t:'Español (es)' },
      { v:'de', t:'Deutsch (de)' },
      { v:'it', t:'Italiano (it)' },
      { v:'pt', t:'Português (pt)' },
      { v:'zh', t:'中文 (zh)' },
      { v:'ja', t:'日本語 (ja)' },
      { v:'ko', t:'한국어 (ko)' },
      { v:'ru', t:'Русский (ru)' },
      { v:'hi', t:'हिन्दी (hi)' },
      { v:'ar', t:'العربية (ar)' },
      { v:'fa', t:'فارسی (fa)' }
    ].map(o => `<option value="${o.v}">${o.t}</option>`).join('');
    const btn = document.createElement('button');
    btn.textContent = 'Enable Translate';
    Object.assign(btn.style, { fontSize: '13px', background: '#b30000', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' });

    sel.addEventListener('change', (e) => {
      const v = e.target.value;
      if (!ACTIVE) return; // wait until enabled
      if (!v || v === 'off') { disable(); }
      else if (v === 'en') { setLanguage('en'); }
      else { setLanguage(v); }
      updateControlUI();
    });
    btn.addEventListener('click', () => {
      if (ACTIVE) { disable(); }
      else {
        const v = sel.value;
        if (!v || v === 'off') { setLanguage('en'); enable('en'); }
        else { enable(v); }
      }
      updateControlUI();
    });

    el.appendChild(label); el.appendChild(sel); el.appendChild(btn);
    document.body.appendChild(el);
    CONTROL = el;
    updateControlUI();
  }

  async function enable(lang) {
    if (lang) TARGET_LANG = lang;
    await translationsReady;
    setHtmlLanguage(TARGET_LANG);
    ACTIVE = true;
    ensureSessionCacheInitialized(TARGET_LANG);
    await translateDocument();
    setTimeout(() => { ACTIVE && translateDocument(); }, 250);
    updateControlUI();
  }

  function disable() { ACTIVE = false; setHtmlLanguage('en'); restoreDocument(); updateControlUI(); }

  async function setLanguage(lang) {
    TARGET_LANG = lang;
    await translationsReady;
    setHtmlLanguage(TARGET_LANG);
    if (lang === 'en') {
      restoreDocument();
      updateControlUI();
      return;
    }
    if (ACTIVE) await translateDocument();
    updateControlUI();
  }

  function startObservers() {
    if (!OBSERVER) {
      OBSERVER = new MutationObserver((muts) => {
        if (!ACTIVE || WRITING) return;
        const changed = muts.some(m => m.type === "characterData" || (m.addedNodes && m.addedNodes.length) || (m.removedNodes && m.removedNodes.length));
        if (changed) {
          emitSoftNavigation('mutation');
          scheduleTranslate();
        }
      });
      OBSERVER.observe(document.documentElement, { subtree: true, childList: true, characterData: true });
    }
    if (!UNPATCH) {
      const onChange = () => {
        emitSoftNavigation('history');
        if (ACTIVE) scheduleTranslate();
      };
      const origPush = history.pushState, origReplace = history.replaceState;
      history.pushState = function(...a){ const r = origPush.apply(this, a); onChange(); return r; };
      history.replaceState = function(...a){ const r = origReplace.apply(this, a); onChange(); return r; };
      addEventListener("popstate", onChange);
      addEventListener("hashchange", onChange);
      UNPATCH = () => {
        history.pushState = origPush;
        history.replaceState = origReplace;
        removeEventListener("popstate", onChange);
        removeEventListener("hashchange", onChange);
      };
    }
  }

  function boot() {
    startObservers();
    ensureControlUI();
    window.PageTranslator = { enable, disable, setLanguage };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
