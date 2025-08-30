import generateContent from '../utils/generateContent.js';

export default function Services() {
  return (
    <section>
      <h1>Services</h1>
      {generateContent('Services')}
    </section>
  );
}
