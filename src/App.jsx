import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Home from './pages/Home.jsx';
import Checking from './pages/Checking.jsx';
import Savings from './pages/Savings.jsx';
import Loans from './pages/Loans.jsx';
import Contact from './pages/Contact.jsx';
import About from './pages/About.jsx';
import Services from './pages/Services.jsx';
import Investments from './pages/Investments.jsx';
import Support from './pages/Support.jsx';
import Careers from './pages/Careers.jsx';

export default function App() {
  return (
    <Router>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/checking" element={<Checking />} />
          <Route path="/savings" element={<Savings />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/support" element={<Support />} />
          <Route path="/careers" element={<Careers />} />
        </Routes>
      </main>
    </Router>
  );
}
