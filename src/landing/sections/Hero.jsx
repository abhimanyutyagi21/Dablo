import Mascot from "../../components/Mascot";
import TrackballToken from "../../components/TrackballToken";
import WordTile from "../../components/WordTile";
import { useOpenApp } from "../useOpenApp";
import useHeroParallax from "../../hooks/useHeroParallax";

export default function Hero() {
  const openApp = useOpenApp();
  const { heroProps, sceneRef, dashRef } = useHeroParallax();
  return (
    <header className="hero" id="top" {...heroProps}>
      <div className="sky-grid" aria-hidden="true"></div>
      <div className="cloud c1" aria-hidden="true"></div>
      <div className="cloud c2" aria-hidden="true"></div>
      <div className="cloud c3" aria-hidden="true"></div>
      <Mascot className="dablo-mascot mascot-scout" aria-hidden="true">
        <svg viewBox="0 0 140 150" role="presentation">
          <defs>
            <linearGradient id="scoutBody" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#e9f2ff"></stop>
              <stop offset=".58" stopColor="#9fc2f4"></stop>
              <stop offset="1" stopColor="#628bd0"></stop>
            </linearGradient>
            <linearGradient id="scoutFin" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#d8ff54"></stop>
              <stop offset="1" stopColor="#9dbd36"></stop>
            </linearGradient>
            <linearGradient id="scoutFoot" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#a8c8f5"></stop>
              <stop offset="1" stopColor="#7197d9"></stop>
            </linearGradient>
          </defs>
          <ellipse
            cx="70"
            cy="137"
            rx="36"
            ry="7"
            fill="#31598c"
            opacity=".12"
          ></ellipse>
          <path
            d="M47 111 Q35 123 34 132 Q35 140 45 138 L59 124Z"
            fill="url(#scoutFoot)"
          ></path>
          <path
            d="M87 117 Q102 123 105 133 Q105 141 95 139 L79 128Z"
            fill="url(#scoutFoot)"
          ></path>
          <path
            d="M32 65 Q23 43 38 28 Q48 15 70 17 Q93 16 106 34 Q120 54 108 83 L101 110 Q91 126 69 125 Q45 125 37 108Z"
            fill="url(#scoutBody)"
            stroke="#fff"
            strokeOpacity=".78"
            strokeWidth="2"
          ></path>
          <path
            d="M43 31 Q58 11 80 20 Q92 23 97 33 Q78 27 62 36 Q52 40 43 31Z"
            fill="#fff"
            opacity=".7"
          ></path>
          <path
            d="M40 69 Q23 67 22 84 Q23 94 34 94 L45 83Z"
            fill="url(#scoutBody)"
            stroke="#fff"
            strokeOpacity=".65"
            strokeWidth="1.5"
          ></path>
          <path
            d="M101 71 Q119 60 124 76 Q126 87 113 94 L101 87Z"
            fill="url(#scoutBody)"
            stroke="#fff"
            strokeOpacity=".65"
            strokeWidth="1.5"
          ></path>
          <path
            d="M70 17 Q65 5 75 4 Q83 5 79 16"
            fill="none"
            stroke="#6f94d0"
            strokeWidth="4"
            strokeLinecap="round"
          ></path>
          <circle cx="77" cy="5" r="5" fill="url(#scoutFin)"></circle>
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
            d="M47 48 Q54 43 61 47 M80 47 Q87 43 94 48"
            fill="none"
            stroke="#628bd0"
            strokeWidth="2.5"
            strokeLinecap="round"
          ></path>
          <path
            d="M53 107 Q70 115 88 106"
            fill="none"
            stroke="#fff"
            strokeOpacity=".65"
            strokeWidth="2"
            strokeLinecap="round"
          ></path>
        </svg>
        <span className="mascot-spark spark-a">✦</span>
        <span className="mascot-spark spark-b">·</span>
      </Mascot>
      <Mascot className="dablo-mascot mascot-hero-right" aria-hidden="true">
        <svg viewBox="0 0 140 150" role="presentation">
          <defs>
            <linearGradient id="heroBuddyBody" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#e8fff8"></stop>
              <stop offset=".55" stopColor="#9ee7d6"></stop>
              <stop offset="1" stopColor="#55bca9"></stop>
            </linearGradient>
            <linearGradient id="heroBuddyTip" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff"></stop>
              <stop offset="1" stopColor="#d8ff54"></stop>
            </linearGradient>
          </defs>
          <ellipse
            cx="70"
            cy="137"
            rx="35"
            ry="7"
            fill="#286e64"
            opacity=".14"
          ></ellipse>
          <path
            d="M48 113 Q37 123 39 133 Q42 140 51 136 L62 123Z"
            fill="#65c6b2"
          ></path>
          <path
            d="M84 117 Q96 124 98 134 Q97 140 87 138 L78 127Z"
            fill="#65c6b2"
          ></path>
          <path
            d="M35 58 Q36 28 64 22 Q90 15 106 37 Q119 57 108 88 L100 109 Q88 125 68 124 Q45 124 36 105Z"
            fill="url(#heroBuddyBody)"
            stroke="#fff"
            strokeOpacity=".9"
            strokeWidth="2"
          ></path>
          <path
            d="M47 37 Q59 18 82 28 Q91 31 98 40 Q76 33 61 43 Q53 46 47 37Z"
            fill="#fff"
            opacity=".8"
          ></path>
          <path
            d="M40 70 Q22 65 22 81 Q22 91 34 96 L45 84Z"
            fill="url(#heroBuddyBody)"
            stroke="#fff"
            strokeOpacity=".7"
            strokeWidth="1.5"
          ></path>
          <path
            d="M101 73 Q116 63 123 77 Q126 87 113 96 L101 87Z"
            fill="url(#heroBuddyBody)"
            stroke="#fff"
            strokeOpacity=".7"
            strokeWidth="1.5"
          ></path>
          <path
            d="M71 24 Q64 10 74 8 Q83 7 80 22"
            fill="none"
            stroke="#4cae9b"
            strokeWidth="4"
            strokeLinecap="round"
          ></path>
          <path d="M74 5 L80 1 L85 7 L80 12Z" fill="url(#heroBuddyTip)"></path>
          <ellipse cx="57" cy="70" rx="8" ry="11" fill="#173e3a"></ellipse>
          <ellipse cx="83" cy="70" rx="8" ry="11" fill="#173e3a"></ellipse>
          <ellipse cx="59" cy="67" rx="2.6" ry="3.7" fill="#fff"></ellipse>
          <ellipse cx="85" cy="67" rx="2.6" ry="3.7" fill="#fff"></ellipse>
          <ellipse
            cx="46"
            cy="85"
            rx="6"
            ry="3.5"
            fill="#f39db1"
            opacity=".72"
          ></ellipse>
          <ellipse
            cx="94"
            cy="85"
            rx="6"
            ry="3.5"
            fill="#f39db1"
            opacity=".72"
          ></ellipse>
          <path
            d="M63 88 Q70 96 78 88"
            fill="none"
            stroke="#173e3a"
            strokeWidth="3"
            strokeLinecap="round"
          ></path>
          <path
            d="M57 105 Q70 111 83 104"
            fill="none"
            stroke="#fff"
            strokeOpacity=".8"
            strokeWidth="2.5"
            strokeLinecap="round"
          ></path>
        </svg>
        <span className="mascot-spark spark-a">✦</span>
        <span className="mascot-spark spark-b">·</span>
      </Mascot>
      <div
        className="dablo-orbit-scene"
        aria-label="Floating social platform links"
        ref={sceneRef}
      >
        <div className="orbit orbit-one"></div>
        <div className="orbit orbit-two"></div>
        <div className="orbit orbit-three"></div>
        <div className="orbital-core">
          <span>d.</span>
          <i>↗</i>
        </div>
        <TrackballToken
          className="float-token platform-token token-instagram"
          href="https://www.instagram.com/"
          aria-label="Open Instagram"
          title="Instagram"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect
              x="3.2"
              y="3.2"
              width="17.6"
              height="17.6"
              rx="5.2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            ></rect>
            <circle
              cx="12"
              cy="12"
              r="4.1"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            ></circle>
            <circle cx="17.7" cy="6.5" r="1.25" fill="currentColor"></circle>
          </svg>
        </TrackballToken>
        <TrackballToken
          className="float-token platform-token token-youtube"
          href="https://www.youtube.com/"
          aria-label="Open YouTube"
          title="YouTube"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M21.3 7.1a2.7 2.7 0 0 0-1.9-1.9C17.7 4.7 12 4.7 12 4.7s-5.7 0-7.4.5a2.7 2.7 0 0 0-1.9 1.9A28 28 0 0 0 2.2 12a28 28 0 0 0 .5 4.9 2.7 2.7 0 0 0 1.9 1.9c1.7.5 7.4.5 7.4.5s5.7 0 7.4-.5a2.7 2.7 0 0 0 1.9-1.9 28 28 0 0 0 .5-4.9 28 28 0 0 0-.5-4.9Z"
              fill="currentColor"
            ></path>
            <path d="m10 15.5 5.2-3.5L10 8.5v7Z" fill="#f5f9ff"></path>
          </svg>
        </TrackballToken>
        <TrackballToken
          className="float-token platform-token token-facebook"
          href="https://www.facebook.com/"
          aria-label="Open Facebook"
          title="Facebook"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M13.8 21v-8.2h2.8l.4-3.2h-3.2V7.5c0-.9.3-1.5 1.6-1.5h1.7V3.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7.6v3.2h2.8V21h3.4Z"
              fill="currentColor"
            ></path>
          </svg>
        </TrackballToken>
        <TrackballToken
          className="float-token platform-token token-threads"
          href="https://www.threads.net/"
          aria-label="Open Threads"
          title="Threads"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M17.9 10.9c-.3-3.9-2.5-6.1-6.1-6.1-3.9 0-6.5 2.8-6.5 7.2 0 4.5 2.5 7.3 6.6 7.3 3.2 0 5.2-1.7 5.2-4.3 0-2.1-1.4-3.5-3.6-3.5-2 0-3.3 1.1-3.3 2.8 0 1.3 1 2.2 2.4 2.2 1.9 0 3.2-1.6 3.2-4.1 0-3.2-1.6-5.1-4.3-5.1-2 0-3.3 1.1-3.3 2.8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
        </TrackballToken>
        <TrackballToken
          className="float-token platform-token token-x"
          href="https://x.com/"
          aria-label="Open X, formerly Twitter"
          title="X, formerly Twitter"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M4 3h4.7l11.4 18h-4.7L4 3Zm.6 18 6.6-7.7m1.7-2L19.4 3"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            ></path>
            <path
              d="M4 3h4.7l11.4 18h-4.7L4 3Z"
              fill="currentColor"
              opacity=".14"
            ></path>
          </svg>
        </TrackballToken>
        <TrackballToken
          className="float-token platform-token token-linkedin"
          href="https://www.linkedin.com/"
          aria-label="Open LinkedIn"
          title="LinkedIn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M5.2 8.8H2.4V21h2.8V8.8ZM3.8 7.1a1.65 1.65 0 1 0 0-3.3 1.65 1.65 0 0 0 0 3.3ZM21.6 14c0-3.7-2-5.4-4.7-5.4-2.2 0-3.2 1.2-3.7 2V8.8h-2.8V21h2.8v-6.1c0-1.6.3-3.2 2.3-3.2s2 1.9 2 3.3V21h2.8l1.3-7Z"
              fill="currentColor"
            ></path>
          </svg>
        </TrackballToken>
        <div className="scene-caption">
          <span className="scene-pulse"></span> CONTENT → REVENUE{" "}
          <b>LIVE MODEL</b>
        </div>
      </div>
      <div className="wrap hero-inner">
        <p className="eyebrow">The business side of creating</p>
        <h1>
          <span className="line">Your content</span>
          <span className="line">
            <span className="soft">should make</span>{" "}
            <WordTile
              className="word-tile"
              aria-label="money, impact, or growth"
              words={["✦", "↗", "◎"]}
            />
          </span>
          <span className="line">
            more <span className="serif">sense.</span>
          </span>
        </h1>
        <p className="hero-copy">
          You put real work into your content. Dablo helps connect that work to
          revenue, so you can see what paid off and what deserves another try.
        </p>
        <div className="hero-cta">
          <button className="btn" onClick={openApp}>
            Get started <span className="arrow">↗</span>
          </button>
          <a className="btn btn-light" href="#product">
            Explore the product <span className="arrow">↓</span>
          </a>
        </div>
        <p className="hero-note">
          In development · Built for creators and founders
        </p>
        <div className="hero-stage">
          <div className="stage-glow"></div>
          <div className="float-card left">
            <span className="float-icon float-icon-reach" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M3 12s3.2-6 9-6 9 6 9 6-3.2 6-9 6-9-6-9-6Z"></path>
                <circle cx="12" cy="12" r="2.8"></circle>
              </svg>
            </span>
            <div>
              <small>CONTENT REACH</small>
              <b>8,000 views</b>
            </div>
          </div>
          <div className="float-card right">
            <span className="float-icon float-icon-revenue" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M5 16 10 11l3 3 6-7"></path>
                <path d="M13 7h6v6"></path>
              </svg>
            </span>
            <div>
              <small>REVENUE ATTRIBUTED</small>
              <b>$240.00</b>
            </div>
          </div>
          <div
            className="dashboard"
            role="img"
            aria-label="Illustrative Dablo analytics dashboard showing revenue, expenses, profit and content performance"
            ref={dashRef}
          >
            <div className="dash-top">
              <span className="dots">
                <i></i>
                <i></i>
                <i></i>
              </span>
              <span style={{ marginLeft: "7px" }}>DABLO / OVERVIEW</span>
              <span className="right">DEMO DATA · LAST 6 MONTHS</span>
            </div>
            <div className="dash-layout">
              <aside className="dash-sidebar">
                <div className="side-brand">
                  dablo<span style={{ color: "#829a6d" }}>.</span>
                </div>
                <div className="side-link active">
                  <span className="side-icon">◫</span> Overview
                </div>
                <div className="side-link">
                  <span className="side-icon">↗</span> Revenue
                </div>
                <div className="side-link">
                  <span className="side-icon">▣</span> Content
                </div>
                <div className="side-link">
                  <span className="side-icon">⌁</span> Tracking links
                </div>
                <div className="side-link">
                  <span className="side-icon">◷</span> Campaigns
                </div>
                <div className="side-link">
                  <span className="side-icon">✳</span> Frameworks
                </div>
              </aside>
              <div className="dash-main">
                <div className="dash-title">
                  <div>
                    <h3>Your revenue, connected.</h3>
                    <p>A clearer view of what your content earns.</p>
                  </div>
                  <span className="range">Last 6 months⌄</span>
                </div>
                <div className="metrics">
                  <div className="metric">
                    <small>Total revenue</small>
                    <strong>$2,400</strong>
                    <em>↗ 18% vs prior period</em>
                  </div>
                  <div className="metric">
                    <small>Total expenses</small>
                    <strong>$600</strong>
                    <em style={{ color: "#8a8e83" }}>3 categories</em>
                  </div>
                  <div className="metric">
                    <small>Net profit</small>
                    <strong>$1,800</strong>
                    <em>Revenue − expenses</em>
                  </div>
                  <div className="metric">
                    <small>Pending payments</small>
                    <strong>$420</strong>
                    <em style={{ color: "#bd8056" }}>2 invoices</em>
                  </div>
                </div>
                <div className="dash-lower">
                  <div className="panel">
                    <div className="panel-head">
                      Revenue over time <span>Illustrative</span>
                    </div>
                    <div className="chart">
                      <i style={{ "--h": "32%", "--i": "0" }}></i>
                      <i style={{ "--h": "48%", "--i": "1" }}></i>
                      <i style={{ "--h": "41%", "--i": "2" }}></i>
                      <i style={{ "--h": "67%", "--i": "3" }}></i>
                      <i style={{ "--h": "58%", "--i": "4" }}></i>
                      <i style={{ "--h": "79%", "--i": "5" }}></i>
                      <i style={{ "--h": "70%", "--i": "6" }}></i>
                      <i style={{ "--h": "100%", "--i": "7" }}></i>
                    </div>
                    <div className="chart-labels">
                      <span>May</span>
                      <span>Jun</span>
                      <span>Jul</span>
                      <span>Aug</span>
                      <span>Sep</span>
                      <span>Oct</span>
                    </div>
                  </div>
                  <div className="panel">
                    <div className="panel-head">
                      Top content <span>Revenue</span>
                    </div>
                    <div className="content-row">
                      <span className="thumb">▤</span>
                      <span>
                        <b>Budget desk setup</b>
                        <small>YouTube · 8k views</small>
                      </span>
                      <span className="money">$240</span>
                    </div>
                    <div className="content-row">
                      <span className="thumb" style={{ background: "#eee0ce" }}>
                        ◉
                      </span>
                      <span>
                        <b>My work routine</b>
                        <small>Instagram · 15k views</small>
                      </span>
                      <span className="money">$60</span>
                    </div>
                    <div className="content-row">
                      <span className="thumb" style={{ background: "#d9e2ed" }}>
                        ↗
                      </span>
                      <span>
                        <b>Desk essentials</b>
                        <small>Reel · 10k views</small>
                      </span>
                      <span className="money">$40</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-under">
            <span>
              01 / <strong>Track the money</strong>
            </span>
            <span>
              02 / <strong>Understand the signal</strong>
            </span>
            <span>
              03 / <strong>Repeat what works</strong>
            </span>
          </div>
        </div>
      </div>
      <div className="marquee-wrap" aria-label="Content platforms">
        <div className="marquee" id="platformMarquee">
          <div className="marquee-group">
            <span className="marquee-label">YOUR CONTENT LIVES ON</span>
            <span className="platform">
              <i className="icon">▶</i>YouTube
            </span>
            <span className="platform">
              <i className="icon">◎</i>Instagram
            </span>
            <span className="platform">
              <i className="icon">𝕏</i>X
            </span>
            <span className="platform">
              <i className="icon">◉</i>Threads
            </span>
            <span className="platform">
              <i className="icon">f</i>Facebook
            </span>
            <span className="platform">
              <i className="icon">♪</i>TikTok
            </span>
            <span className="platform">
              <i className="icon">↗</i>Newsletters
            </span>
            <span className="platform">
              <i className="icon">▧</i>Digital products
            </span>
          </div>
          <div className="marquee-group" aria-hidden="true">
            <span className="marquee-label">YOUR CONTENT LIVES ON</span>
            <span className="platform">
              <i className="icon">▶</i>YouTube
            </span>
            <span className="platform">
              <i className="icon">◎</i>Instagram
            </span>
            <span className="platform">
              <i className="icon">𝕏</i>X
            </span>
            <span className="platform">
              <i className="icon">◉</i>Threads
            </span>
            <span className="platform">
              <i className="icon">f</i>Facebook
            </span>
            <span className="platform">
              <i className="icon">♪</i>TikTok
            </span>
            <span className="platform">
              <i className="icon">↗</i>Newsletters
            </span>
            <span className="platform">
              <i className="icon">▧</i>Digital products
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
