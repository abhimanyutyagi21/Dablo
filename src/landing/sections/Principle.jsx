import Reveal from "../../components/Reveal";

export default function Principle() {
  return (
    <section className="principle-section">
      <div className="section-orb orb-principle" aria-hidden="true">
        <span>d.</span>
      </div>
      <Reveal className="wrap principle-grid" as="div">
        <div>
          <div className="principle-mark">d.</div>
          <span className="eyebrow">The Dablo principle</span>
          <p className="principle-note">
            A product belief, not a customer testimonial. Real user stories
            belong here once they exist.
          </p>
        </div>
        <div>
          <p className="quote">
            “A view is attention. A click is intent. A sale is evidence.{" "}
            <em>Know which one you are looking at.</em>”
          </p>
          <p className="source">Track honestly · Learn from your own data</p>
        </div>
      </Reveal>
    </section>
  );
}
