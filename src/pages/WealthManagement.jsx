import React from 'react';
import generateContent from '../utils/generateContent.jsx';

export default function WealthManagement() {
  return (
    <section className="wealth-section">
      <h1>Wealth Management</h1>
      {generateContent('Wealth Management')}
    </section>
  );
}
