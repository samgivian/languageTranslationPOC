import generateContent from '../utils/generateContent.js';

export default function About() {
  return (
    <section>
      <h1>About</h1>
      {generateContent('About')}
    </section>
  );
}
