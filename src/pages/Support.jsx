import React, { useState } from 'react';
import generateContent from '../utils/generateContent.jsx';
import Modal from '../components/Modal.jsx';
import { Link } from 'react-router-dom';

export default function Support() {
  const [open, setOpen] = useState(false);
  return (
    <section>
      <h1>Support</h1>
      <p>Get answers fast with our help center and 24/7 virtual assistant.</p>
      <div>
        <button className="btn" onClick={() => setOpen(true)}>Open chat</button>
        <Modal open={open} onClose={() => setOpen(false)} title="Virtual Assistant">
          <p>Hi! Ask me about transfers, cards, or account features. A human agent can join if needed.</p>
          <p><strong>Tip:</strong> See <Link to="/services">Services</Link> for capabilities and <Link to="/contact">Contact</Link> for phone/branch options.</p>
        </Modal>
      </div>
      <div style={{marginTop:'1rem'}}>
        {generateContent('Support')}
      </div>
    </section>
  );
}
