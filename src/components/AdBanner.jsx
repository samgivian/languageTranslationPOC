import React from 'react';
import { Link } from 'react-router-dom';

export default function AdBanner({ headline, body, to, cta = 'See details' }) {
  return (
    <aside className="ad-banner" role="complementary">
      <h4>{headline}</h4>
      <p>{body}</p>
      {to ? <Link className="btn btn-light" to={to}>{cta}</Link> : null}
    </aside>
  );
}

