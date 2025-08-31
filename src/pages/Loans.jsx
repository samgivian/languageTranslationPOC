import React, { useState } from 'react';
import generateContent from '../utils/generateContent.jsx';
import PricingTable from '../components/PricingTable.jsx';
import Modal from '../components/Modal.jsx';
import AdBanner from '../components/AdBanner.jsx';
import { Link } from 'react-router-dom';

export default function Loans() {
  const [open, setOpen] = useState(false);
  return (
    <section>
      <h1>Loans</h1>
      <PricingTable
        plans={[
          { plan: 'Personal Loan', price: 'From 8.99% APR', features: ['No origination fee', 'Terms up to 72 months', 'Same‑day funding for qualified borrowers'] },
          { plan: 'Auto Loan', price: 'From 5.49% APR', features: ['New & used vehicles', 'Pre‑qualification in minutes', 'Rate discount with autopay'] },
          { plan: 'Home Mortgage', price: 'Custom Rates', features: ['Fixed & ARM options', 'Low down payment programs', 'Dedicated mortgage advisor'] },
        ]}
      />
      <AdBanner headline="Check your rate" body="Won’t impact your credit score" to="/loans" />
      <p>Build credit with on‑time payments. Consider pairing with a <Link to="/checking">Checking</Link> account for autopay discounts.</p>
      <button className="btn" onClick={() => setOpen(true)}>Loan disclosures</button>
      <Modal open={open} onClose={() => setOpen(false)} title="Important disclosures">
        <ul>
          <li>APR based on creditworthiness and term length.</li>
          <li>Autopay rate discount requires eligible checking account.</li>
          <li>Additional terms apply; subject to credit approval.</li>
        </ul>
      </Modal>
      <div style={{marginTop:'1rem'}}>
        {generateContent('Loans')}
      </div>
    </section>
  );
}
