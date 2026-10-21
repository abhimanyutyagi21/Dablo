import Reveal from "../../components/Reveal";

export default function UseCases() {
  return (
    <section className="usecases">
      <div className="section-orb orb-usecase" aria-hidden="true">
        <span>✦</span>
      </div>
      <div className="wrap">
        <Reveal className="section-head" as="div">
          <div>
            <span className="eyebrow">Made for content-led work</span>
            <h2>
              Different businesses.
              <br />
              One question that matters.
            </h2>
          </div>
          <p>
            Which parts of your content are helping the business? These are
            illustrative workflows, not customer case studies or measured
            outcomes.
          </p>
        </Reveal>
        <div className="case-grid">
          <Reveal className="case-card" as="article" tilt>
            <div className="case-image">
              <img
                className="case-photo"
                src="https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=900&q=85"
                alt="A creator recording a video"
                loading="lazy"
              />
              <span className="case-index">01 / CREATOR</span>
            </div>
            <div className="case-body">
              <h3>The YouTube creator</h3>
              <p>
                Compare which videos earn more, not just which ones get watched.
              </p>
            </div>
            <div className="case-foot">
              <span>CONTENT REVENUE</span>
              <span>↗ Explore use case</span>
            </div>
          </Reveal>
          <Reveal className="case-card" as="article" tilt>
            <div className="case-image">
              <img
                className="case-photo"
                src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=900&q=85"
                alt="A founder planning a product launch"
                loading="lazy"
              />
              <span className="case-index">02 / FOUNDER</span>
            </div>
            <div className="case-body">
              <h3>The product founder</h3>
              <p>
                See which product stories are associated with sales and
                inquiries.
              </p>
            </div>
            <div className="case-foot">
              <span>PRODUCT MARKETING</span>
              <span>↗ Explore use case</span>
            </div>
          </Reveal>
          <Reveal className="case-card" as="article" tilt>
            <div className="case-image">
              <img
                className="case-photo"
                src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=85"
                alt="A team reviewing campaign performance"
                loading="lazy"
              />
              <span className="case-index">03 / AFFILIATE</span>
            </div>
            <div className="case-body">
              <h3>The affiliate marketer</h3>
              <p>
                Compare campaign clicks, reported conversions, commission, and
                costs.
              </p>
            </div>
            <div className="case-foot">
              <span>CAMPAIGN ANALYSIS</span>
              <span>↗ Explore use case</span>
            </div>
          </Reveal>
          <Reveal className="case-card" as="article" tilt>
            <div className="case-image">
              <img
                className="case-photo"
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=85"
                alt="Analytics on a laptop screen"
                loading="lazy"
              />
              <span className="case-index">04 / CONSULTANT</span>
            </div>
            <div className="case-body">
              <h3>The independent expert</h3>
              <p>
                Record which content is linked to client inquiries and projects.
              </p>
            </div>
            <div className="case-foot">
              <span>LEAD CONTEXT</span>
              <span>↗ Explore use case</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
