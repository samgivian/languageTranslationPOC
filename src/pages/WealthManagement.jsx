import React, { useState } from 'react';
import generateContent from '../utils/generateContent.jsx';
import PricingTable from '../components/PricingTable.jsx';
import Modal from '../components/Modal.jsx';
import { Link } from 'react-router-dom';

export default function WealthManagement() {
  const [open, setOpen] = useState(false);
  return (
    <section className="wealth-section">
      <h1>Wealth Management</h1>
      <PricingTable
        plans={[
          { plan: 'Digital Advice', price: '0.25% AUM', features: ['Goal planning', 'Automated rebalancing', 'ETF portfolios'] },
          { plan: 'Advisory', price: '0.75% AUM', features: ['Dedicated advisor', 'Tax‑aware strategies', 'Custom portfolios'] },
          { plan: 'Private Client', price: 'Custom', features: ['Team of specialists', 'Estate & trust', 'Alternative investments'] },
        ]}
      />
      <p>Coordinate your <Link to="/investments">Investments</Link>, <Link to="/checking">Checking</Link> and <Link to="/savings">Savings</Link> for a complete plan.</p>
      <button className="btn" onClick={() => setOpen(true)}>Schedule a free consultation</button>
      <Modal open={open} onClose={() => setOpen(false)} title="Request a consultation">
        <p>Share a few details and a licensed advisor will reach out within 1–2 business days.</p>
      </Modal>
      <div style={{marginTop:'1rem'}}>
        {generateContent('Wealth Management')}
      </div>
    </section>
  );
}
