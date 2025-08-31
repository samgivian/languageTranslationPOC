import React from 'react';
import generateContent from '../utils/generateContent.jsx';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <section>
      <h1>About</h1>
      <p>We’ve served families and businesses for over a century. Our mission is simple: transparent products that help you thrive.</p>
      <p>Explore our <Link to="/services">Services</Link> and meet our <Link to="/careers">Careers</Link> teams.</p>
      <div style={{marginTop:'1rem'}}>
        {generateContent('About')}
      </div>
    </section>
  );
}
