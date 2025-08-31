import React, { useState } from 'react';
import generateContent from '../utils/generateContent.jsx';
import Modal from '../components/Modal.jsx';

export default function Contact() {
  const [open, setOpen] = useState(false);
  return (
    <section>
      <h1>Contact</h1>
      <ul>
        <li>Call us: 1‑800‑555‑0100 (24/7)</li>
        <li>Email: support@examplebank.com</li>
        <li>Find a branch: use our locator in the app</li>
      </ul>
      <button className="btn" onClick={() => setOpen(true)}>Holiday hours</button>
      <Modal open={open} onClose={() => setOpen(false)} title="Holiday hours">
        <p>Most branches are closed on federal holidays. ATMs and digital banking are available 24/7.</p>
      </Modal>
      <div style={{marginTop:'1rem'}}>
        {generateContent('Contact')}
      </div>
    </section>
  );
}
