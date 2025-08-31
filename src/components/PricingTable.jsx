import React from 'react';

export default function PricingTable({ plans = [] }) {
  return (
    <div className="pricing-table">
      {plans.map((p, i) => (
        <div key={i} className="pricing-card">
          <div className="pricing-header">
            <h3>{p.plan}</h3>
            <div className="price">{p.price}</div>
          </div>
          <ul className="features">
            {p.features?.map((f, j) => <li key={j}>{f}</li>)}
          </ul>
          {p.cta ? <button className="btn" onClick={p.onClick}>{p.cta}</button> : null}
        </div>
      ))}
    </div>
  );
}

