import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import AnnouncementBar from './components/AnnouncementBar.jsx';
import SitewidePromoModal from './components/SitewidePromoModal.jsx';
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
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import WealthManagement from './pages/WealthManagement.jsx';
import BonusOffer from './pages/BonusOffer.jsx';

export default function App() {
  return (
    <Router>
      <AnnouncementBar />
      <SitewidePromoModal />
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
          <Route path="/wealth" element={<WealthManagement />} />
          <Route path="/support" element={<Support />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/bonus" element={<BonusOffer />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}
