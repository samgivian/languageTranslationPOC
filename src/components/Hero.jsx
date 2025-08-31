import React from 'react';
import { Link } from 'react-router-dom';

export default function Hero({ title, subtitle, ctaText, ctaTo }) {
  return (
    <section className="hero">
      <div className="container">
        <h1>{title}</h1>
        {subtitle ? <p className="subtitle">{subtitle}</p> : null}
        {ctaText && ctaTo ? (
          <Link className="btn btn-primary" to={ctaTo}>{ctaText}</Link>
        ) : null}
      </div>
    </section>
  );
}

