import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Header() {
  const [active, setActive] = useState(false);

  function toggleTranslate() {
    if (active) {
      window.PageTranslator?.disable();
    } else {
      window.PageTranslator?.enable('fr');
    }
    setActive(!active);
  }

  return (
    <header>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/checking">Checking</Link>
        <Link to="/savings">Savings</Link>
        <Link to="/loans">Loans</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/about">About</Link>
        <Link to="/services">Services</Link>
        <Link to="/investments">Investments</Link>
        <Link to="/support">Support</Link>
        <Link to="/careers">Careers</Link>
      </nav>
      <button onClick={toggleTranslate}>
        {active ? 'Disable Translate' : 'Enable Translate'}
      </button>
    </header>
  );
}
