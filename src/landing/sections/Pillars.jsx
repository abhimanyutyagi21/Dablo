import Reveal from "../../components/Reveal";

export default function Pillars() {
  return (
    <section className="pillars">
      <div className="section-orb orb-pillar" aria-hidden="true">
        <span>✳</span>
      </div>
      <div className="wrap">
        <Reveal className="section-head" as="div">
          <div>
            <span className="eyebrow">From attention to evidence</span>
            <h2>
              From scattered numbers
              <br />
              to a smarter next move.
            </h2>
          </div>
          <p>
            Stop treating content performance and business performance like
            separate worlds. Dablo brings the useful pieces together.
          </p>
        </Reveal>
        <div className="pillar-grid">
          <Reveal className="pillar" as="article" delay={0}>
            <span className="num">01 / TRACK</span>
            <span className="pillar-mark">↘</span>
            <div>
              <h3>
                Know what
                <br />
                came in.
              </h3>
              <p>
                Record income, expenses, sponsorships, campaigns, and the
                content tied to them.
              </p>
            </div>
          </Reveal>
          <Reveal className="pillar" as="article" delay={70}>
            <span className="num">02 / UNDERSTAND</span>
            <span className="pillar-mark">◎</span>
            <div>
              <h3>
                Find the
                <br />
                real signal.
              </h3>
              <p>
                Compare revenue with views, clicks, offers, and content details.
                Separate facts from guesses.
              </p>
            </div>
          </Reveal>
          <Reveal className="pillar" as="article" delay={140}>
            <span className="num">03 / REPEAT</span>
            <span className="pillar-mark">↗</span>
            <div>
              <h3>
                Keep what
                <br />
                you learn.
              </h3>
              <p>
                Save the patterns behind strong results as frameworks for your
                next video or campaign.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
