import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function AnnouncementBar() {
  const KEY = 'announce_dismiss_v1';
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(!localStorage.getItem(KEY)); }, []);
  if (!open) return null;
  return (
    <div className="announcement-bar" role="region" aria-label="Announcement">
      <div className="container">
        <span>Limited‑time $200 bonus when you bundle Checking + Savings.</span>
        <Link to="/services" className="link">Learn more</Link>
        <button className="close" aria-label="Dismiss" onClick={() => { localStorage.setItem(KEY, '1'); setOpen(false); }}>×</button>
      </div>
    </div>
  );
}

