import Reveal from "../../components/Reveal";
import Mascot from "../../components/Mascot";
import { useOpenApp } from "../useOpenApp";

export default function FinalCta() {
  const openApp = useOpenApp();
  return (
    <section className="final-cta">
      <Mascot className="dablo-mascot mascot-cta" aria-hidden="true">
        <svg viewBox="0 0 140 150" role="presentation">
          <defs>
            <linearGradient id="ctaBody" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff"></stop>
              <stop offset=".55" stopColor="#dbe7fb"></stop>
              <stop offset="1" stopColor="#9eb9e9"></stop>
            </linearGradient>
          </defs>
          <ellipse
            cx="70"
            cy="137"
            rx="34"
            ry="6"
            fill="#31598c"
            opacity=".12"
          ></ellipse>
          <path
            d="M48 113 Q37 124 39 133 Q41 140 51 137 L62 123Z"
            fill="#91addd"
          ></path>
          <path
            d="M84 117 Q96 124 98 134 Q97 140 87 138 L78 127Z"
            fill="#91addd"
          ></path>
          <path
            d="M35 58 Q36 28 64 22 Q90 15 106 37 Q119 57 108 88 L100 109 Q88 125 68 124 Q45 124 36 105Z"
            fill="url(#ctaBody)"
            stroke="#fff"
            strokeWidth="2"
          ></path>
          <path
            d="M45 37 Q60 18 82 28 Q92 31 98 40 Q77 33 61 43 Q52 46 45 37Z"
            fill="#fff"
            opacity=".85"
          ></path>
          <path
            d="M40 70 Q22 65 22 81 Q22 91 34 96 L45 84Z"
            fill="url(#ctaBody)"
            stroke="#fff"
            strokeWidth="1.5"
          ></path>
          <path
            d="M101 73 Q116 63 123 77 Q126 87 113 96 L101 87Z"
            fill="url(#ctaBody)"
            stroke="#fff"
            strokeWidth="1.5"
          ></path>
          <ellipse cx="57" cy="70" rx="8" ry="11" fill="#203653"></ellipse>
          <ellipse cx="83" cy="70" rx="8" ry="11" fill="#203653"></ellipse>
          <ellipse cx="59" cy="67" rx="2.6" ry="3.7" fill="#fff"></ellipse>
          <ellipse cx="85" cy="67" rx="2.6" ry="3.7" fill="#fff"></ellipse>
          <ellipse
            cx="46"
            cy="85"
            rx="6"
            ry="3.5"
            fill="#f39db1"
            opacity=".75"
          ></ellipse>
          <ellipse
            cx="94"
            cy="85"
            rx="6"
            ry="3.5"
            fill="#f39db1"
            opacity=".75"
          ></ellipse>
          <path
            d="M64 88 Q70 95 77 88"
            fill="none"
            stroke="#203653"
            strokeWidth="3"
            strokeLinecap="round"
          ></path>
          <path
            d="M70 23 Q65 10 75 8 Q83 9 79 22"
            fill="none"
            stroke="#7d9fd9"
            strokeWidth="4"
            strokeLinecap="round"
          ></path>
          <circle cx="77" cy="7" r="5" fill="#d8ff54"></circle>
        </svg>
      </Mascot>
      <div className="cta-orbit" aria-hidden="true">
        <i></i>
        <i></i>
        <i></i>
      </div>
      <Reveal className="wrap final-inner" as="div" delay={210}>
        <div>
          <span className="eyebrow">Your work has a financial story</span>
          <h2>
            Know what earned.
            <br />
            Learn what to try next.
          </h2>
          <p>Then turn what you learn into a better next experiment.</p>
        </div>
        <button className="btn" onClick={openApp}>
          Get started <span className="arrow">↗</span>
        </button>
      </Reveal>
    </section>
  );
}
