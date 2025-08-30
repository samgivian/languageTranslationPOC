import generateContent from '../utils/generateContent.jsx';

export default function Home() {
  return (
    <section>
      <h1>Home</h1>
      {generateContent('Home')}
    </section>
  );
}
