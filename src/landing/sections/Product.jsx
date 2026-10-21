import Reveal from "../../components/Reveal";
import Mascot from "../../components/Mascot";

export default function Product() {
  return (
    <section className="product-section" id="product">
      <div className="section-orb orb-product" aria-hidden="true">
        <span>◎</span>
      </div>
      <Mascot className="dablo-mascot mascot-ledger" aria-hidden="true">
        <svg viewBox="0 0 140 150" role="presentation">
          <defs>
            <linearGradient id="ledgerBody" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#eff4db"></stop>
              <stop offset=".55" stopColor="#cde39a"></stop>
              <stop offset="1" stopColor="#91b55c"></stop>
            </linearGradient>
            <linearGradient id="ledgerFin" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff"></stop>
              <stop offset="1" stopColor="#d8ff54"></stop>
            </linearGradient>
          </defs>
          <ellipse
            cx="70"
            cy="137"
            rx="35"
            ry="7"
            fill="#34491f"
            opacity=".13"
          ></ellipse>
          <path
            d="M48 113 Q37 123 39 133 Q42 140 51 136 L62 123Z"
            fill="#9bbf66"
          ></path>
          <path
            d="M84 117 Q96 124 98 134 Q97 140 87 138 L78 127Z"
            fill="#9bbf66"
          ></path>
          <path
            d="M35 58 Q36 28 64 22 Q90 15 106 37 Q119 57 108 88 L100 109 Q88 125 68 124 Q45 124 36 105Z"
            fill="url(#ledgerBody)"
            stroke="#fff"
            strokeOpacity=".85"
            strokeWidth="2"
          ></path>
          <path
            d="M47 37 Q59 18 82 28 Q91 31 98 40 Q76 33 61 43 Q53 46 47 37Z"
            fill="#fff"
            opacity=".76"
          ></path>
          <path
            d="M40 70 Q22 65 22 81 Q22 91 34 96 L45 84Z"
            fill="url(#ledgerBody)"
            stroke="#fff"
            strokeOpacity=".7"
            strokeWidth="1.5"
          ></path>
          <path
            d="M101 73 Q116 63 123 77 Q126 87 113 96 L101 87Z"
            fill="url(#ledgerBody)"
            stroke="#fff"
            strokeOpacity=".7"
            strokeWidth="1.5"
          ></path>
          <path
            d="M71 24 Q64 10 74 8 Q83 7 80 22"
            fill="none"
            stroke="#87a94e"
            strokeWidth="4"
            strokeLinecap="round"
          ></path>
          <path d="M74 5 L80 1 L85 7 L80 12Z" fill="url(#ledgerFin)"></path>
          <ellipse cx="57" cy="70" rx="8" ry="11" fill="#2b3820"></ellipse>
          <ellipse cx="83" cy="70" rx="8" ry="11" fill="#2b3820"></ellipse>
          <ellipse cx="59" cy="67" rx="2.6" ry="3.7" fill="#fff"></ellipse>
          <ellipse cx="85" cy="67" rx="2.6" ry="3.7" fill="#fff"></ellipse>
          <ellipse
            cx="46"
            cy="85"
            rx="6"
            ry="3.5"
            fill="#ef9ba4"
            opacity=".75"
          ></ellipse>
          <ellipse
            cx="94"
            cy="85"
            rx="6"
            ry="3.5"
            fill="#ef9ba4"
            opacity=".75"
          ></ellipse>
          <path
            d="M63 88 Q70 96 78 88"
            fill="none"
            stroke="#2b3820"
            strokeWidth="3"
            strokeLinecap="round"
          ></path>
          <rect
            x="53"
            y="101"
            width="34"
            height="12"
            rx="6"
            fill="#fff"
            opacity=".5"
          ></rect>
          <path
            d="M61 107 L67 110 L78 103"
            fill="none"
            stroke="#668b38"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
        <span className="mascot-spark spark-a">↗</span>
        <span className="mascot-spark spark-b">✧</span>
      </Mascot>
      <div className="wrap">
        <Reveal className="section-head" as="div">
          <div>
            <span className="eyebrow">A closer look at Dablo</span>
            <h2>Not another analytics screen.</h2>
          </div>
          <p>
            Revenue, content, campaigns, and expenses belong in the same story.
            Dablo brings the pieces together so your next decision is based on
            more than views.
          </p>
        </Reveal>
        <Reveal className="feature-row" as="div">
          <div className="feature-copy">
            <span className="eyebrow">01 / Why it converted</span>
            <h3>The most-viewed post is not always the one that pays.</h3>
            <p>
              A video with 8,000 views can earn more than one with 80,000. Put
              attributed revenue beside the content, then investigate the hook,
              offer, audience, and next step. The numbers show where to look,
              not a guaranteed reason why.
            </p>
            <ul className="feature-list">
              <li>
                <span className="check">✓</span>Compare content by attributed
                revenue, not views alone.
              </li>
              <li>
                <span className="check">✓</span>Record the hook, offer,
                audience, and call to action.
              </li>
              <li>
                <span className="check">✓</span>Keep hypotheses separate from
                verified results.
              </li>
            </ul>
          </div>
          <Reveal className="feature-art lime" as="div" delay={210}>
            <Reveal
              className="editorial-photo photo-creator"
              as="div"
              delay={0}
            >
              <img
                src="https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=85"
                alt="Creator filming content in a studio"
                loading="lazy"
              />
              <span>01 / CONTENT THAT EARNS</span>
            </Reveal>
            <div className="art-label">
              <span>CONTENT PERFORMANCE / DEMO</span>
              <span>01—03</span>
            </div>
            <div className="mock-window">
              <div className="mock-window-top">
                <span>Content comparison</span>
                <small>Same product · Three videos</small>
              </div>
              <div className="mock-body">
                <div className="mock-title">Reach is not the whole story.</div>
                <p className="mock-sub">
                  Illustrative revenue attribution, entered or connected where
                  data is available.
                </p>
                <div className="video-grid">
                  <div className="video-card">
                    <div className="video-cover">▤</div>
                    <b>My desk setup</b>
                    <small>10,000 views</small>
                    <strong>$40</strong>
                    <span className="best">LOWER REVENUE</span>
                  </div>
                  <div className="video-card">
                    <div className="video-cover">↗</div>
                    <b>Best budget desk</b>
                    <small>8,000 views</small>
                    <strong>$240</strong>
                    <span className="best">TOP REVENUE ↗</span>
                  </div>
                  <div className="video-card">
                    <div className="video-cover">◉</div>
                    <b>Daily routine</b>
                    <small>15,000 views</small>
                    <strong>$60</strong>
                    <span className="best">MORE REACH</span>
                  </div>
                </div>
                <div className="insight-callout">
                  <span>✳</span>
                  <div>
                    <b>Possible reason to investigate</b>Clear problem, product
                    demo, and a direct call to action. This is a hypothesis, not
                    proof of cause.
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </Reveal>
        <Reveal className="feature-row reverse" as="div">
          <div className="feature-copy">
            <span className="eyebrow">02 / Content success frameworks</span>
            <h3>Make your best work easier to repeat.</h3>
            <p>
              When you spot a pattern worth testing again, save it. Build a
              playbook from your own work instead of relying on vague advice.
            </p>
            <ul className="feature-list">
              <li>
                <span className="check">✓</span>Save the content that inspired
                the framework.
              </li>
              <li>
                <span className="check">✓</span>Keep steps, observations, and
                experiments together.
              </li>
              <li>
                <span className="check">✓</span>Reuse and edit the framework for
                new campaigns.
              </li>
            </ul>
          </div>
          <Reveal className="feature-art" as="div" delay={70}>
            <Reveal
              className="editorial-photo photo-campaign"
              as="div"
              delay={140}
            >
              <img
                src="https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1200&q=85"
                alt="Colorful creative campaign work"
                loading="lazy"
              />
              <span>02 / CAMPAIGN SIGNALS</span>
            </Reveal>
            <div className="art-label">
              <span>FRAMEWORK LIBRARY</span>
              <span>EDITABLE EXAMPLE</span>
            </div>
            <div className="mock-window">
              <div className="mock-window-top">
                <span>High-converting product review</span>
                <small>Draft framework</small>
              </div>
              <div className="mock-body">
                <div className="mock-title">
                  A useful structure to test again.
                </div>
                <p className="mock-sub">
                  Based on your notes and observed results, not a promise of
                  future performance.
                </p>
                <div className="framework-steps">
                  <div className="framework-step">
                    <span>01</span>
                    <div>
                      <b>Open with a real problem</b>
                      <small>Make the audience recognize it.</small>
                    </div>
                  </div>
                  <div className="framework-step">
                    <span>02</span>
                    <div>
                      <b>Show the product at work</b>
                      <small>Demonstrate, do not just describe.</small>
                    </div>
                  </div>
                  <div className="framework-step">
                    <span>03</span>
                    <div>
                      <b>Answer one objection</b>
                      <small>Make the fit clear.</small>
                    </div>
                  </div>
                  <div className="framework-step">
                    <span>04</span>
                    <div>
                      <b>Use a direct next step</b>
                      <small>Track clicks and conversions.</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </Reveal>
        <Reveal className="feature-row" as="div">
          <div className="feature-copy">
            <span className="eyebrow">03 / Tracking links</span>
            <h3>Follow the click. Find the outcome.</h3>
            <p>
              Give each video or campaign its own link. See which links attract
              clicks, then connect purchases only when a supported source
              reports them. A click is a clue, not a sale.
            </p>
            <ul className="feature-list">
              <li>
                <span className="check">✓</span>One link per content item or
                campaign.
              </li>
              <li>
                <span className="check">✓</span>Track clicks once the redirect
                endpoint is deployed.
              </li>
              <li>
                <span className="check">✓</span>Do not mistake a click for a
                sale.
              </li>
            </ul>
          </div>
          <Reveal className="feature-art dark" as="div" delay={210}>
            <Reveal className="editorial-photo photo-team" as="div" delay={0}>
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=85"
                alt="Team planning a creative project"
                loading="lazy"
              />
              <span>03 / THE BIGGER PICTURE</span>
            </Reveal>
            <div className="art-label">
              <span>CAMPAIGN ATTRIBUTION</span>
              <span>DEMO DATA</span>
            </div>
            <div className="link-demo">
              <div className="mock-title">Budget desk setup</div>
              <p className="mock-sub">Unique campaign link</p>
              <div className="link-url">
                <span>dablo.app/r/desk-review</span>
                <b>↗ COPY</b>
              </div>
              <div className="link-stats">
                <div className="link-stat">
                  <small>Link clicks</small>
                  <strong>1,284</strong>
                  <em>Recorded events</em>
                </div>
                <div className="link-stat">
                  <small>Conversions</small>
                  <strong>32</strong>
                  <em>Example data</em>
                </div>
                <div className="link-stat">
                  <small>Revenue</small>
                  <strong>$240</strong>
                  <em>Attributed example</em>
                </div>
              </div>
              <p
                style={{ fontSize: "9px", color: "#82877a", marginTop: "12px" }}
              >
                Illustrative only. Click and conversion figures require deployed
                tracking and reliable conversion data.
              </p>
            </div>
          </Reveal>
        </Reveal>
        <Reveal className="feature-row reverse" as="div">
          <div className="feature-copy">
            <span className="eyebrow">04 / Revenue and campaigns</span>
            <h3>Know what is earned, spent, and still owed.</h3>
            <p>
              Keep sponsorship deals, payment status, expenses, and campaign
              revenue in one place. Know what is paid, what is pending, and what
              remains after costs.
            </p>
            <ul className="feature-list">
              <li>
                <span className="check">✓</span>Track income and expenses by
                source.
              </li>
              <li>
                <span className="check">✓</span>See net profit and campaign
                performance.
              </li>
              <li>
                <span className="check">✓</span>Filter records by date,
                platform, and content.
              </li>
            </ul>
          </div>
          <Reveal className="feature-art" as="div" delay={70}>
            <Reveal
              className="editorial-photo photo-product"
              as="div"
              delay={140}
            >
              <img
                src="https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=85"
                alt="Digital product and interface design"
                loading="lazy"
              />
              <span>04 / REPEAT WHAT WORKS</span>
            </Reveal>
            <div className="art-label">
              <span>CAMPAIGN WORKSPACE</span>
              <span>EXAMPLE</span>
            </div>
            <div className="mock-window">
              <div className="mock-window-top">
                <span>Partnerships</span>
                <small>October</small>
              </div>
              <div className="mock-body">
                <div className="mock-title">Money in motion.</div>
                <p className="mock-sub">
                  Track what was agreed, delivered, and paid.
                </p>
                <div className="campaign-row">
                  <div>
                    <b>Northfield Desk Co.</b>
                    <small>Product review · 2 of 3 deliverables</small>
                  </div>
                  <span className="status">Paid</span>
                </div>
                <div className="campaign-row">
                  <div>
                    <b>Brightline Software</b>
                    <small>Newsletter mention · Payment due</small>
                  </div>
                  <span
                    className="status"
                    style={{ background: "#f7e9d6", color: "#9c6a31" }}
                  >
                    Pending
                  </span>
                </div>
                <div className="campaign-row">
                  <div>
                    <b>Studio Notes</b>
                    <small>Affiliate campaign · Monthly payout</small>
                  </div>
                  <span
                    className="status"
                    style={{ background: "#eee9dc", color: "#76745f" }}
                  >
                    Review
                  </span>
                </div>
                <div className="link-stats" style={{ marginTop: "15px" }}>
                  <div className="link-stat">
                    <small>Revenue</small>
                    <strong>$2,400</strong>
                  </div>
                  <div className="link-stat">
                    <small>Expenses</small>
                    <strong>$600</strong>
                  </div>
                  <div className="link-stat">
                    <small>Net profit</small>
                    <strong>$1,800</strong>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </Reveal>
      </div>
    </section>
  );
}
