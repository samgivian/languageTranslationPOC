import React, { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import { Link } from 'react-router-dom';

export default function SitewidePromoModal() {
  const KEY = 'promo_dismiss_v1';
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!sessionStorage.getItem(KEY)) setOpen(true);
  }, []);
  function close() { setOpen(false); sessionStorage.setItem(KEY, '1'); }
  return (
    <Modal open={open} onClose={close} title="Welcome offer">
      <p>Open both an eligible Checking and Savings account to earn a <strong>$200 bonus</strong> after qualifying activities. Terms apply.</p>
      <ul>
        <li>Set up direct deposit for Checking within 60 days.</li>
        <li>Maintain a qualifying balance in Savings for 90 days.</li>
        <li>Offer subject to change. Fees may reduce earnings.</li>
      </ul>
      <p>See account details on the <Link to="/checking">Checking</Link> and <Link to="/savings">Savings</Link> pages.</p>
    </Modal>
  );
}

