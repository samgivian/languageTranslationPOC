import React, { useState } from 'react';
import generateContent from '../utils/generateContent.jsx';
import AdBanner from '../components/AdBanner.jsx';
import Modal from '../components/Modal.jsx';
import { Link } from 'react-router-dom';

export default function Services() {
  const [open, setOpen] = useState(false);
  return (
    <section>
      <h1>Services</h1>
      <ul>
        <li>Digital wallet and contactless payments</li>
        <li>Wire transfers and international banking</li>
        <li>Safe deposit boxes and cashier’s checks</li>
        <li>Bill pay and automatic transfers</li>
      </ul>
      <AdBanner headline="Upgrade to Premier Checking" body="Get fee rebates and dedicated service." to="/checking" />
      <p>Need help? Visit <Link to="/support">Support</Link> or contact us on the <Link to="/contact">Contact</Link> page.</p>
      <button className="btn" onClick={() => setOpen(true)}>Service limits</button>
      <Modal open={open} onClose={() => setOpen(false)} title="Service limits">
        <p>Daily mobile deposit and transfer limits vary by account standing and tenure.</p>
      </Modal>
      <div style={{marginTop:'1rem'}}>
        {generateContent('Services')}
      </div>
    </section>
  );
}
