import React, { useState } from 'react';
import generateContent from '../utils/generateContent.jsx';
import PromoCard from '../components/PromoCard.jsx';
import Modal from '../components/Modal.jsx';
import { Link } from 'react-router-dom';
import LightboxGallery from '../components/LightboxGallery.jsx';

export default function Investments() {
  const [open, setOpen] = useState(false);
  return (
    <section>
      <h1>Investments</h1>
      <div className="grid cols-3" style={{marginBottom:'1rem'}}>
        <PromoCard title="Automated Portfolios" subtitle="Low‑cost diversified ETFs with rebalancing."
          to="/wealth" cta="Talk to an advisor" />
        <PromoCard title="Active Trading" subtitle="$0 online stock commissions and advanced tools." to="/investments" />
        <PromoCard title="Retirement" subtitle="Traditional & Roth IRAs with guidance." to="/wealth" />
      </div>
      <p>New to investing? Start with our <Link to="/support">learning center</Link> or chat with a <Link to="/wealth">Wealth Advisor</Link>.</p>
      <button className="btn" onClick={() => setOpen(true)}>Risk disclosure</button>
      <Modal open={open} onClose={() => setOpen(false)} title="Investment risk">
        <p>Investments involve risk, including the possible loss of principal. Diversification does not ensure a profit or protect against loss.</p>
      </Modal>
      <h2>Strategy spotlights</h2>
      <LightboxGallery
        items={[
          {
            title: 'Core ETF Portfolio',
            caption: 'Low‑cost global diversification built with broad‑market ETFs.',
            content: <p>A straightforward 60/40 stock‑bond mix using ETFs. Rebalanced quarterly to maintain risk targets and tax‑loss harvested in taxable accounts.</p>
          },
          {
            title: 'Dividend Growth',
            caption: 'Focus on companies with rising dividends and strong cash flows.',
            content: <p>Emphasizes dividend aristocrats and quality balance sheets. Aims to grow income while pursuing competitive total return.</p>
          },
          {
            title: 'Thematic Tilt: AI & Cloud',
            caption: 'Tactical sleeve targeting secular tech trends.',
            content: <p>5–10% satellite allocation for clients seeking higher growth and volatility. Reviewed monthly and constrained by risk budgets.</p>
          },
        ]}
      />
      <div style={{marginTop:'1rem'}}>
        {generateContent('Investments')}
      </div>
    </section>
  );
}
