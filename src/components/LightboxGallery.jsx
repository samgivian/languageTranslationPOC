import React, { useEffect, useState } from 'react';
import Modal from './Modal.jsx';

// items: [{ title, caption, content }]
export default function LightboxGallery({ items = [] }) {
  const [openIdx, setOpenIdx] = useState(-1);
  const open = openIdx >= 0;

  function next() { setOpenIdx(i => (i + 1) % items.length); }
  function prev() { setOpenIdx(i => (i - 1 + items.length) % items.length); }

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'Escape') setOpenIdx(-1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, items.length]);

  return (
    <div className="lightbox">
      <div className="lightbox-grid">
        {items.map((it, i) => (
          <button
            key={i}
            className="lightbox-thumb"
            onClick={() => setOpenIdx(i)}
            aria-label={`Open ${it.title}`}
          >
            <div className="lightbox-thumb-inner">
              <div className="lightbox-thumb-art" aria-hidden>
                {it.thumb || <div className="lightbox-placeholder" />}
              </div>
              <div className="lightbox-thumb-title">{it.title}</div>
            </div>
          </button>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpenIdx(-1)} title={items[openIdx]?.title || ''}>
        {items[openIdx] && (
          <div className="lightbox-body">
            {items[openIdx].content || <p>{items[openIdx].caption}</p>}
            {items.length > 1 && (
              <div className="lightbox-nav">
                <button className="btn" onClick={prev} aria-label="Previous">‹ Prev</button>
                <button className="btn" onClick={next} aria-label="Next">Next ›</button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

