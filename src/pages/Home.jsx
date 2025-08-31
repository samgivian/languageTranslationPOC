import React, { useState } from 'react';
import generateContent from '../utils/generateContent.jsx';
import PromoCard from '../components/PromoCard.jsx';
import AdBanner from '../components/AdBanner.jsx';
import Modal from '../components/Modal.jsx';
import { Link } from 'react-router-dom';

export default function Home() {
  const [open, setOpen] = useState(false);
  return (
    <section>
      <h1>Home</h1>
      <div className="grid cols-3" style={{marginBottom:'1rem'}}>
        <PromoCard title="Everyday Checking" subtitle="No minimum, mobile deposits, Zelle® transfers." to="/checking" badge="Popular" />
        <PromoCard title="High‑Yield Savings" subtitle="Grow faster with promotional APY tiers." to="/savings" />
        <PromoCard title="Personal Loans" subtitle="Fixed APR, same‑day funding for qualified borrowers." to="/loans" />
      </div>
      <AdBanner headline="Bundle and Save" body="Open Checking + Savings and get a $200 welcome bonus."
        to="/services" />
      <p>
        Explore our <Link to="/investments">Investments</Link> and
        {' '}<Link to="/wealth">Wealth Management</Link> services to plan for tomorrow.
      </p>
      <button className="btn" onClick={() => setOpen(true)}>See how we protect your money</button>
      <Modal open={open} onClose={() => setOpen(false)} title="Security & Protection">
        <ul>
          <li>FDIC‑insured deposits up to applicable limits.</li>
          <li>Real‑time fraud monitoring and card lock.</li>
          <li>Two‑factor authentication and biometric sign‑in.</li>
        </ul>
      </Modal>
      <div style={{marginTop:'1rem'}}>
        {generateContent('Home')}
      </div>
    </section>
  );
}
