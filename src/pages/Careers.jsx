import React, { useState } from 'react';
import generateContent from '../utils/generateContent.jsx';
import Modal from '../components/Modal.jsx';
import { Link } from 'react-router-dom';

export default function Careers() {
  const [open, setOpen] = useState(false);
  return (
    <section>
      <h1>Careers</h1>
      <ul>
        <li>Engineering — build modern, secure banking experiences</li>
        <li>Wealth Advisors — guide clients toward long‑term goals</li>
        <li>Branch & Operations — deliver great everyday service</li>
      </ul>
      <p>Learn about our culture on the <Link to="/about">About</Link> page and benefits under <Link to="/services">Services</Link>.</p>
      <button className="btn" onClick={() => setOpen(true)}>Benefits overview</button>
      <Modal open={open} onClose={() => setOpen(false)} title="Employee benefits">
        <ul>
          <li>Medical, dental, vision and 401(k) match</li>
          <li>Learning stipend and mentorship programs</li>
          <li>Annual volunteer days and community impact</li>
        </ul>
      </Modal>
      <div style={{marginTop:'1rem'}}>
        {generateContent('Careers')}
      </div>
    </section>
  );
}
