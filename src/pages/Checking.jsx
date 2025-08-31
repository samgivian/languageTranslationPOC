import React, { useState } from 'react';
import generateContent from '../utils/generateContent.jsx';
import PricingTable from '../components/PricingTable.jsx';
import AdBanner from '../components/AdBanner.jsx';
import Modal from '../components/Modal.jsx';
import { Link } from 'react-router-dom';
import Accordion from '../components/Accordion.jsx';

export default function Checking() {
  const [open, setOpen] = useState(false);
  return (
    <section>
      <h1>Checking</h1>
      <PricingTable
        plans={[
          { plan: 'Everyday Checking', price: '$0/mo', features: ['No minimum balance', 'Free online bill pay', 'Contactless debit card'] },
          { plan: 'Premier Checking', price: '$15/mo', features: ['ATM fee rebates', 'Priority customer service', 'Free official checks'] },
          { plan: 'Student Checking', price: '$0/mo', features: ['No overdraft fee', 'Cash‑back offers', 'Financial education hub'] },
        ]}
      />
      <div style={{margin:'1rem 0'}}>Looking to grow your money? Try our <Link to="/savings">High‑Yield Savings</Link> or add an <Link to="/investments">Investment</Link> account.</div>
      <AdBanner headline="Mobile Banking App" body="Deposit checks, track spending, and send money with Zelle®." to="/services" />
      <button className="btn" onClick={() => setOpen(true)}>Account benefits</button>
      <Modal open={open} onClose={() => setOpen(false)} title="Checking Benefits">
        <ul>
          <li>Early paycheck up to 2 days with direct deposit.</li>
          <li>Real‑time alerts and budget insights.</li>
          <li>24/7 support and card replacement at branches.</li>
        </ul>
      </Modal>
      <h2>Frequently asked questions</h2>
      <Accordion
        items={[
          { title: 'How do I avoid monthly fees?', content: <p>Maintain the required minimum balance or set up qualifying direct deposits to waive monthly maintenance fees on eligible accounts.</p> },
          { title: 'What overdraft options are available?', content: <p>Choose overdraft protection using a linked Savings account or opt into coverage for ATM and one‑time debit transactions. Fees and terms apply.</p> },
          { title: 'Do you support mobile wallet?', content: <p>Yes. Add your debit card to Apple Pay, Google Pay, or Samsung Pay for contactless payments.</p> },
        ]}
      />
      <div style={{marginTop:'1rem'}}>
        {generateContent('Checking')}
      </div>
    </section>
  );
}
