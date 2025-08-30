export default function generateContent(name) {
  return Array.from({ length: 300 }, (_, i) => (
    <p key={i}>
      {name} page detailed banking information line {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    </p>
  ));
}
