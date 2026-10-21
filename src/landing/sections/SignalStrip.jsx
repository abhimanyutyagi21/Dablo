import Reveal from "../../components/Reveal";

export default function SignalStrip() {
  return (
    <Reveal
      className="signal-strip"
      aria-label="How Dablo connects content to revenue"
      as="section"
      delay={0}
    >
      <div className="signal-topline">
        <span className="eyebrow">THE SIGNAL, NOT THE NOISE</span>
        <span className="signal-live">
          <i></i> ILLUSTRATIVE WORKFLOW
        </span>
      </div>
      <div className="signal-flow">
        <Reveal
          className="signal-node signal-content"
          as="article"
          tilt
          delay={70}
        >
          <div className="signal-icon icon-video">
            <span>▶</span>
          </div>
          <div>
            <small>01 / CONTENT</small>
            <b>One post</b>
            <p>The thing you published</p>
          </div>
          <span className="signal-node-orb"></span>
        </Reveal>
        <span className="signal-connector">
          <i></i>
        </span>
        <Reveal
          className="signal-node signal-clicks"
          as="article"
          tilt
          delay={140}
        >
          <div className="signal-icon icon-link">
            <span>↗</span>
          </div>
          <div>
            <small>02 / INTENT</small>
            <b>Tracked clicks</b>
            <p>The next step they took</p>
          </div>
          <span className="signal-node-orb"></span>
        </Reveal>
        <span className="signal-connector">
          <i></i>
        </span>
        <Reveal
          className="signal-node signal-revenue"
          as="article"
          tilt
          delay={210}
        >
          <div className="signal-icon icon-money">
            <span>✳</span>
          </div>
          <div>
            <small>03 / OUTCOME</small>
            <b>Attributed revenue</b>
            <p>When evidence is available</p>
          </div>
          <span className="signal-node-orb"></span>
        </Reveal>
      </div>
      <p className="signal-footnote">
        Each step needs its own evidence. Dablo does not treat views or clicks
        as proof of a sale.
      </p>
    </Reveal>
  );
}
