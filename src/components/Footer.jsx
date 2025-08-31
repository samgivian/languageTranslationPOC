import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <nav className="footer-links">
          <Link to="/about">About</Link>
          <Link to="/careers">Careers</Link>
          <Link to="/support">Support</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/services">Services</Link>
          <Link to="/investments">Investments</Link>
        </nav>
      </div>
      <div className="footer-bottom">
        <p>Member FDIC. Equal Housing Lender. © Example Bank</p>
      </div>
    </footer>
  );
}

