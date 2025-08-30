export default function generateContent(name) {
  return Array.from({ length: 50 }, (_, i) => (
    <p key={i}>
      Wells Fargo {name} page informative content line {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    </p>
  ));
}
