import React from 'react';
import { Link } from 'react-router-dom';

export default function PromoCard({ title, subtitle, to, cta = 'Learn more', badge }) {
  return (
    <div className="promo-card">
      {badge ? <span className="promo-badge">{badge}</span> : null}
      <h3>{title}</h3>
      <p>{subtitle}</p>
      <Link className="btn" to={to}>{cta}</Link>
    </div>
  );
}

