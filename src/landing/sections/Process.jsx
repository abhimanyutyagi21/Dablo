import Reveal from "../../components/Reveal";

export default function Process() {
  return (
    <section className="process-section" id="how">
      <div className="section-orb orb-process" aria-hidden="true">
        <span>↗</span>
      </div>
      <div className="wrap">
        <Reveal className="section-head" as="div">
          <div>
            <span className="eyebrow">A straightforward workflow</span>
            <h2>Make the next move with a clearer picture.</h2>
          </div>
          <p>
            Start with what you know. Add tracking links, campaign details, and
            reliable conversion data as your workflow grows.
          </p>
        </Reveal>
        <div className="process-grid">
          <Reveal className="process-card" as="article" tilt>
            <span className="process-no">STEP 01</span>
            <div className="process-visual">
              <span className="mini-chip">Income</span>
              <span className="mini-chip">Expenses</span>
              <span className="mini-chip">Content</span>
            </div>
            <h3>Organize</h3>
            <p>
              Add your content, income sources, expenses, sponsorships, and
              campaigns.
            </p>
          </Reveal>
          <Reveal className="process-card" as="article" tilt>
            <span className="process-no">STEP 02</span>
            <div className="process-visual">
              <span className="mini-chip">Video A</span>
              <span className="mini-chip">↗ Link</span>
              <span className="mini-chip">Campaign</span>
            </div>
            <h3>Track</h3>
            <p>
              Record revenue and create links for specific content or campaigns.
            </p>
          </Reveal>
          <Reveal className="process-card" as="article" tilt>
            <span className="process-no">STEP 03</span>
            <div className="process-visual">
              <span className="mini-chip">Views 8k</span>
              <span className="mini-chip">Revenue $240</span>
            </div>
            <h3>Understand</h3>
            <p>
              Compare results and write down likely reasons behind the
              differences.
            </p>
          </Reveal>
          <Reveal className="process-card" as="article" tilt>
            <span className="process-no">STEP 04</span>
            <div className="process-visual">
              <span className="mini-chip">Framework saved ✓</span>
            </div>
            <h3>Repeat</h3>
            <p>
              Save useful patterns as a framework and test them in your next
              campaign.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
