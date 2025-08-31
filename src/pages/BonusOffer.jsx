import React, { useMemo, useState } from 'react';
import Modal from '../components/Modal.jsx';
import Accordion from '../components/Accordion.jsx';

export default function BonusOffer() {
  const [applyOpen, setApplyOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [expandKey, setExpandKey] = useState(0);
  const [collapseKey, setCollapseKey] = useState(0);

  const faqItems = useMemo(
    () => [
      {
        title: 'What documentation is required to open a business checking account?',
        content: (
          <div>
            <p>
              We accept common formation documents (e.g., Articles of Organization), personal
              identification, and your business tax ID. Requirements vary by entity type and state.
              Speak with a banker for full details.
            </p>
          </div>
        ),
      },
      {
        title: 'When will I receive the business checking bonus offer?',
        content: (
          <div>
            <p>
              After meeting all offer requirements, we deposit the bonus into your new business
              checking account within 30 days. Tracking may take up to one statement cycle.
            </p>
          </div>
        ),
      },
      {
        title: 'How to qualify for this offer',
        content: (
          <div>
            <ul>
              <li>This offer is for new business checking customers only. One bonus per business entity.</li>
              <li>Use the bonus code at account opening by the posted deadline.</li>
              <li>Eligible accounts include Initiate, Navigate, or Optimize Business Checking.</li>
            </ul>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <section className="bonus">
      {/* Hero */}
      <div className="hero">
        <div className="container">
          <h1>Get a $400 new business checking customer bonus*</h1>
          <p className="subtitle">This offer is for new business checking customers only and ends September 2, 2025.</p>
          <div className="grid cols-2" style={{ alignItems: 'start' }}>
            <div>
              <h3>Open an account online</h3>
              <p>Your bonus offer code will be automatically applied to your application when you open from this page.</p>
              <button className="btn btn-light" onClick={() => setApplyOpen(true)}>Apply online &gt;&gt;</button>
            </div>
            <div>
              <h3>Open your account in a branch</h3>
              <p>Enter an email to receive the bonus code to show a banker at account opening.</p>
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ flex: 1, padding: '.5rem' }}
                />
                <button className="btn btn-light" onClick={() => setEmailOpen(true)}>Email my code &gt;&gt;</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Three steps */}
      <div className="container" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ textAlign: 'center', color: 'var(--color-primary)' }}>
          Get your $400 bonus in just three steps:
        </h2>
        <div className="grid cols-3" style={{ marginTop: '1rem' }}>
          <div className="promo-card">
            <div className="promo-badge">1</div>
            <h3>Open</h3>
            <p>Open a new eligible business checking account from this offer page by the deadline.</p>
          </div>
          <div className="promo-card">
            <div className="promo-badge">2</div>
            <h3>Deposit</h3>
            <p>Deposit $2,500 or more by day 30 and maintain a $2,500 minimum daily collected balance through day 60.</p>
          </div>
          <div className="promo-card">
            <div className="promo-badge">3</div>
            <h3>Enjoy</h3>
            <p>We deposit your $400 bonus within 30 days after you meet all requirements.</p>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="container" style={{ marginTop: '2rem' }}>
        <h2 style={{ color: 'var(--color-primary)' }}>Your account benefits</h2>
        <p style={{ textAlign: 'center', marginTop: '.25rem', color: '#a00' }}>
          Take advantage of these business checking benefits:
        </p>
        <div className="grid cols-2" style={{ marginTop: '1rem' }}>
          <div className="promo-card"><h3>Experienced support you can count on</h3><p>Our business bankers are here to help you reach your goals.</p></div>
          <div className="promo-card"><h3>A full suite of products and services</h3><p>Solutions and support that can help your business thrive.</p></div>
          <div className="promo-card"><h3>Digital tools and security</h3><p>Manage cash flow, set alerts, and control cards from anywhere.</p></div>
          <div className="promo-card"><h3>Convenient payment options</h3><p>Accept payments onsite, online, and on the go.</p></div>
        </div>
      </div>

      {/* FAQs (expand/collapse) */}
      <div className="container" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', gap: '.75rem' }}>
            <button className="btn btn-light" onClick={() => setExpandKey((n) => n + 1)}>Expand all</button>
            <button className="btn btn-light" onClick={() => setCollapseKey((n) => n + 1)}>Collapse all</button>
          </div>
        </div>
        <Accordion items={faqItems} allowMultiple defaultOpenIndices={[0]}
          openAllKey={expandKey} closeAllKey={collapseKey}
        />
      </div>

      {/* Sticky CTA */}
      <div className="bonus-cta">
        <div className="bonus-cta-inner container">
          <div>
            <strong>Get a $400 new business checking customer bonus</strong>
            <div style={{ fontSize: '.9rem' }}>This offer is for new business checking customers only. <button className="link-like" onClick={() => setApplyOpen(true)}>See offer requirements</button></div>
          </div>
          <div>
            <button className="btn btn-light" onClick={() => setApplyOpen(true)}>Apply online &gt;&gt;</button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal open={applyOpen} onClose={() => setApplyOpen(false)} title="$400 Business Checking Bonus – Offer Details">
        <ul>
          <li>Open an eligible business checking account from this page by the offer end date.</li>
          <li>Deposit $2,500 or more by day 30 and maintain $2,500 minimum daily collected balance through day 60.</li>
          <li>We will deposit your $400 bonus within 30 days once requirements are met.</li>
          <li>Limit one bonus per business entity; additional terms apply.</li>
        </ul>
        <p><em>For illustration only; not a real offer.</em></p>
      </Modal>

      <Modal open={emailOpen} onClose={() => setEmailOpen(false)} title="Your bonus code">
        <p>
          {email ? (
            <>We will send a sample bonus code to <strong>{email}</strong> (demo only).</>
          ) : (
            <>Enter an email on the page to receive the sample code.</>
          )}
        </p>
        <div style={{ background: '#f6f6f6', padding: '.75rem', border: '1px dashed #ccc', display: 'inline-block' }}>
          Bonus code: <strong>WF-NEW400</strong>
        </div>
      </Modal>
    </section>
  );
}

