(() => {
  const CONFIG = {
    API_KEY: "AIzaSyCUyJ4mnbK3HQ7nJOdljTwyXCqHBo8OGA0",
    MODELS_TRY: ["gemini-2.0-flash", "gemini-1.5-flash"],
    DEFAULT_LANG: "fr",
    BATCH_SIZE: 80,
    MAX_RETRIES: 1,
    VISIBLE_ONLY: false,
    SKIP_SELECTORS: ["[data-no-translate]", ".no-l10n"],
    PSEUDO_ATTRS: ["data-i18n-before", "data-i18n-after"]
  };

  let ACTIVE = false;
  let TARGET_LANG = CONFIG.DEFAULT_LANG;
  let WRITING = false;
  let OBSERVER = null;
  let UNPATCH = null;
  const seen = new WeakMap();
  let translateQueued = false;

  let TRANSLATIONS = {};
  const translationsReady = fetch('/translations.json')
    .then(r => r.ok ? r.json() : {})
    .then(data => { TRANSLATIONS = data || {}; })
    .catch(() => {});

  const sessionCache = {};
  function getSessionCache(lang) {
    if (!sessionCache[lang]) {
      try {
        sessionCache[lang] = JSON.parse(sessionStorage.getItem('translations_' + lang)) || {};
      } catch (e) {
        sessionCache[lang] = {};
      }
    }
    return sessionCache[lang];
  }

  function saveSessionCache(lang) {
    try {
      sessionStorage.setItem('translations_' + lang, JSON.stringify(sessionCache[lang]));
    } catch (e) {}
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

  function collectPseudoAttrItems(root, attrNames) {
    const items = [];
    for (const attr of attrNames) {
      root.querySelectorAll("[" + attr + "]").forEach(el => {
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
    console.log("[Translator] Sending to Gemini:", phrases);

    const prompt =
      "Translate all items to " + lang + ".\n" +
      "Return ONLY a JSON array of strings, same length and order.\n" +
      "Input JSON: " + JSON.stringify(phrases);

    const body = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    };

    // Log payload to server
    fetch('/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).catch(() => {});

    for (const model of CONFIG.MODELS_TRY) {
      for (let attempt = 0; attempt <= CONFIG.MAX_RETRIES; attempt++) {
        try {
          const url =
            "https://generativelanguage.googleapis.com/v1beta/models/" +
            encodeURIComponent(model) +
            ":generateContent?key=" +
            encodeURIComponent(CONFIG.API_KEY);

          const r = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
          });
          if (!r.ok) throw new Error(await r.text());
          const data = await r.json();
          const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
          const arr = JSON.parse(raw);
          if (Array.isArray(arr) && arr.length === phrases.length) {
            console.log("[Translator] Received from Gemini:", arr);
            return arr;
          }
        } catch (e) {
          console.warn("[Translator] Gemini error (" + model + "):", e);
        }
      }
    }
    return phrases;
  }

  async function translateBatch(phrases, lang) {
    await translationsReady;
    const out = new Array(phrases.length);
    const missing = [];
    const missingIdx = [];
    const sessionStore = getSessionCache(lang);
    let cache = TRANSLATIONS[lang];
    if (!cache) cache = TRANSLATIONS[lang] = {};

    for (let i = 0; i < phrases.length; i++) {
      const p = phrases[i];
      if (sessionStore[p] != null) {
        out[i] = sessionStore[p];
      } else if (cache[p] != null) {
        out[i] = cache[p];
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
      const translated = await geminiTranslate(uniqueMissing, lang);
      const map = new Map();
      for (let i = 0; i < uniqueMissing.length; i++) {
        map.set(uniqueMissing[i], translated[i]);
      }
      for (let i = 0; i < missing.length; i++) {
        const phrase = missing[i];
        const val = map.get(phrase);
        out[missingIdx[i]] = val;
        cache[phrase] = val;
        sessionStore[phrase] = val;
      }
      saveSessionCache(lang);
    }

    return out;
  }

  async function translateDocument() {
    if (!ACTIVE) return;

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
    const attrItems = collectPseudoAttrItems(document, CONFIG.PSEUDO_ATTRS);
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
              const translated = val.trim();
              ref.node.nodeValue = (ref.leading || "") + translated + (ref.trailing || "");
              seen.set(ref.node, ref.node.nodeValue);
            }
          } else if (ref.el && ref.el.setAttribute) {
            ref.el.setAttribute(ref.attr, val);
          }
        }
      } finally {
        WRITING = false;
      }
      offset += g.length;
    }
  }

  function scheduleTranslate() {
    if (!ACTIVE || translateQueued) return;
    translateQueued = true;
    setTimeout(() => { translateQueued = false; translateDocument(); }, 120);
  }

  async function enable(lang) {
    if (lang) TARGET_LANG = lang;
    await translationsReady;
    setHtmlLanguage(TARGET_LANG);
    ACTIVE = true;
    await translateDocument();
    setTimeout(() => { ACTIVE && translateDocument(); }, 250);
  }

  function disable() { ACTIVE = false; }

  async function setLanguage(lang) {
    TARGET_LANG = lang;
    await translationsReady;
    setHtmlLanguage(TARGET_LANG);
    if (ACTIVE) await translateDocument();
  }

  function startObservers() {
    if (!OBSERVER) {
      OBSERVER = new MutationObserver((muts) => {
        if (!ACTIVE || WRITING) return;
        const changed = muts.some(m => m.type === "characterData" || (m.addedNodes && m.addedNodes.length));
        if (changed) scheduleTranslate();
      });
      OBSERVER.observe(document.documentElement, { subtree: true, childList: true, characterData: true });
    }
    if (!UNPATCH) {
      const onChange = () => { if (ACTIVE) scheduleTranslate(); };
      const origPush = history.pushState, origReplace = history.replaceState;
      history.pushState = function(...a){ const r = origPush.apply(this, a); onChange(); return r; };
      history.replaceState = function(...a){ const r = origReplace.apply(this, a); onChange(); return r; };
      addEventListener("popstate", onChange);
      UNPATCH = () => {
        history.pushState = origPush;
        history.replaceState = origReplace;
        removeEventListener("popstate", onChange);
      };
    }
  }

  function boot() {
    startObservers();
    window.PageTranslator = { enable, disable, setLanguage };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
