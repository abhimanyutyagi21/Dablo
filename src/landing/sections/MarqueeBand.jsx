import Reveal from "../../components/Reveal";

export default function MarqueeBand() {
  return (
    <Reveal
      className="marquee-band"
      aria-label="Dablo principles"
      as="div"
      delay={70}
    >
      <div className="marquee-track" aria-hidden="true">
        <span>
          CONTENT WITH CONTEXT <b>✳</b>
        </span>
        <span>
          REVENUE YOU CAN TRACE <b>↗</b>
        </span>
        <span>
          LESS GUESSING <b>✳</b>
        </span>
        <span>
          BETTER NEXT EXPERIMENTS <b>↗</b>
        </span>
        <span>
          CONTENT WITH CONTEXT <b>✳</b>
        </span>
        <span>
          REVENUE YOU CAN TRACE <b>↗</b>
        </span>
        <span>
          LESS GUESSING <b>✳</b>
        </span>
        <span>
          BETTER NEXT EXPERIMENTS <b>↗</b>
        </span>
      </div>
    </Reveal>
  );
}
