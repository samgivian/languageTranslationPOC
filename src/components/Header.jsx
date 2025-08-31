import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header>
      <div className="container header-inner">
      <nav>
        <Link to="/">Home</Link>
        <Link to="/checking">Checking</Link>
        <Link to="/savings">Savings</Link>
        <Link to="/loans">Loans</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/about">About</Link>
        <Link to="/services">Services</Link>
        <Link to="/investments">Investments</Link>
        <Link to="/wealth">Wealth Management</Link>
        <Link to="/support">Support</Link>
        <Link to="/bonus">Bonus Offer</Link>
        <Link to="/open-account">Open Account</Link>
        <Link to="/careers">Careers</Link>
        <Link to="/login">Login</Link>
        <Link to="/signup">Sign Up</Link>
      </nav>
      {/* Translation UI moved into public/translator.js control */}
      </div>
    </header>
  );
}
