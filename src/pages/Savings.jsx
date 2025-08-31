import React, { useState } from 'react';
import generateContent from '../utils/generateContent.jsx';
import PricingTable from '../components/PricingTable.jsx';
import Modal from '../components/Modal.jsx';
import AdBanner from '../components/AdBanner.jsx';
import { Link } from 'react-router-dom';
import ShowMore from '../components/ShowMore.jsx';

export default function Savings() {
  const [open, setOpen] = useState(false);
  return (
    <section>
      <h1>Savings</h1>
      <PricingTable
        plans={[
          { plan: 'High‑Yield Savings', price: '4.50% APY', features: ['No monthly fee', 'Automatic round‑ups', 'Goal trackers'] },
          { plan: 'Standard Savings', price: '0.50% APY', features: ['ATM access', 'Mobile check deposit', 'Savings vaults'] },
          { plan: 'Youth Savings', price: '$0/mo', features: ['Parent‑controlled transfers', 'Spending insights', 'Financial literacy tips'] },
        ]}
      />
      <AdBanner headline="Save More with Bundles" body="Pair Checking + Savings for a welcome bonus." to="/checking" />
      <p>Planning long‑term? Explore <Link to="/investments">Investments</Link> for diversified growth.</p>
      <button className="btn" onClick={() => setOpen(true)}>How APY works</button>
      <Modal open={open} onClose={() => setOpen(false)} title="About APY">
        <p>APY assumes interest remains on deposit for a full year with no withdrawals. Rates subject to change.</p>
      </Modal>
      <h2>Featured offers</h2>
      <ShowMore
        initial={3}
        items={[
          { title: 'Round‑up Savings', body: 'Automatically round card purchases to the nearest dollar and save the change.' },
          { title: 'Goal Vaults', body: 'Create named goals like Vacation or Emergency and track progress.' },
          { title: 'Family Transfers', body: 'Send recurring allowances to linked youth accounts with controls.' },
          { title: 'New Saver Bonus', body: 'Earn a $50 bonus when you save $500 in your first 60 days.' },
          { title: 'Rainy‑Day Alerts', body: 'Smart nudges to set aside funds based on upcoming bills.' },
          { title: 'CD Ladder Helper', body: 'Build staggered CDs to balance liquidity and yield.' },
        ]}
        renderItem={(it) => (
          <div>
            <strong>{it.title}</strong>
            <p>{it.body}</p>
          </div>
        )}
      />
      <div style={{marginTop:'1rem'}}>
        {generateContent('Savings')}
      </div>
    </section>
  );
}
