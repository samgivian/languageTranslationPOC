import React, { useEffect, useState } from 'react';

export default function Accordion({
  items = [],
  allowMultiple = false,
  defaultOpenIndices = [],
  openAllKey,
  closeAllKey,
}) {
  const [open, setOpen] = useState(() => {
    const initial = {};
    defaultOpenIndices.forEach((i) => { initial[i] = true; });
    return initial;
  });

  // Support external expand/collapse triggers without controlling each item.
  useEffect(() => {
    if (openAllKey === undefined) return;
    const all = {};
    for (let i = 0; i < items.length; i++) all[i] = true;
    setOpen(all);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openAllKey, items.length]);

  useEffect(() => {
    if (closeAllKey === undefined) return;
    setOpen({});
  }, [closeAllKey]);

  function toggle(i) {
    setOpen(prev => {
      const next = { ...prev, [i]: !prev[i] };
      if (!allowMultiple) {
        // close others
        Object.keys(next).forEach(k => { if (String(k) !== String(i)) next[k] = false; });
      }
      return next;
    });
  }

  return (
    <div className="accordion" role="tablist">
      {items.map((it, i) => {
        const expanded = !!open[i];
        const panelId = `acc-panel-${i}`;
        const btnId = `acc-btn-${i}`;
        return (
          <div key={i} className={`accordion-item${expanded ? ' open' : ''}`}>
            <button
              id={btnId}
              className="accordion-header"
              aria-expanded={expanded}
              aria-controls={panelId}
              onClick={() => toggle(i)}
            >
              {it.title}
              <span className="accordion-chevron" aria-hidden>▾</span>
            </button>
            <div
              id={panelId}
              className="accordion-panel"
              role="region"
              aria-labelledby={btnId}
              hidden={!expanded}
            >
              {typeof it.content === 'function' ? it.content() : it.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
