import Reveal from "../../components/Reveal";

export default function Why() {
  return (
    <section className="why-section" id="why">
      <div className="section-orb orb-why" aria-hidden="true">
        <span>↗</span>
      </div>
      <div className="wrap compare-wrap">
        <div className="compare-copy">
          <span className="eyebrow">The difference is context</span>
          <h2>Numbers are easy. Knowing what they mean is the work.</h2>
          <p>
            Spreadsheets can hold the facts. Dablo is being built to help you
            connect them, question them, and turn what you learn into your next
            move.
          </p>
          <a className="btn" href="#how">
            See how it works <span className="arrow">↘</span>
          </a>
        </div>
        <div className="orbit-data-art" aria-hidden="true">
          <div className="data-art-ring ring-a"></div>
          <div className="data-art-ring ring-b"></div>
          <div className="data-art-core">
            <span>↗</span>
            <small>THE SIGNAL</small>
          </div>
          <span className="data-art-chip chip-a">Views ≠ revenue</span>
          <span className="data-art-chip chip-b">Context matters</span>
          <span className="data-art-chip chip-c">Test · Learn · Repeat</span>
        </div>
        <Reveal className="compare-board" as="div">
          <Reveal className="compare-card" as="div" delay={210}>
            <h3>Without Dablo</h3>
            <ul>
              <li>
                <i>×</i> Revenue split across tools
              </li>
              <li>
                <i>×</i> Views treated like results
              </li>
              <li>
                <i>×</i> Hard to find unpaid deals
              </li>
              <li>
                <i>×</i> Winning patterns forgotten
              </li>
              <li>
                <i>×</i> Clicks confused with sales
              </li>
            </ul>
          </Reveal>
          <Reveal className="compare-card after" as="div" delay={0}>
            <h3>With Dablo</h3>
            <ul>
              <li>
                <i>✓</i> Income and expenses together
              </li>
              <li>
                <i>✓</i> Content and revenue compared
              </li>
              <li>
                <i>✓</i> Campaign payment status visible
              </li>
              <li>
                <i>✓</i> Reusable content frameworks
              </li>
              <li>
                <i>✓</i> Clear labels for facts and estimates
              </li>
            </ul>
          </Reveal>
        </Reveal>
      </div>
    </section>
  );
}
