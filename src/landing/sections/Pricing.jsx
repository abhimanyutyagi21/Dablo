import Reveal from "../../components/Reveal";
import { useOpenApp } from "../useOpenApp";

export default function Pricing() {
  const openApp = useOpenApp();
  return (
    <section className="pricing-section" id="pricing">
      <div className="section-orb orb-pricing" aria-hidden="true">
        <span>✳</span>
      </div>
      <div className="wrap">
        <Reveal className="section-head" as="div">
          <div>
            <span className="eyebrow">Early access</span>
            <h2>
              Built around your workflow.
              <br />
              Not made-up pricing.
            </h2>
          </div>
          <p>
            Dablo's pricing has not been finalized. No made-up tiers or fake
            discounts. The product scope and plans will be shared before launch.
          </p>
        </Reveal>
        <Reveal className="pricing-panel" as="div" tilt>
          <div className="pricing-copy">
            <span className="pill">
              <i></i> Plans in development
            </span>
            <h3>Help shape what Dablo becomes.</h3>
            <p>
              Join the early-access list to hear when the product is ready and
              share what you need most from your revenue workflow.
            </p>
            <div style={{ marginTop: "25px" }}>
              <button className="btn" onClick={openApp}>
                Create your workspace <span className="arrow">↗</span>
              </button>
            </div>
          </div>
          <div className="pricing-features">
            <div className="pricing-item">
              <span className="pi">↘</span>
              <h4>Core tracking</h4>
              <p>
                Income, expenses, content records, and campaign organization.
              </p>
            </div>
            <div className="pricing-item">
              <span className="pi">◎</span>
              <h4>Revenue insights</h4>
              <p>
                Content comparisons, attribution context, and reusable
                frameworks.
              </p>
            </div>
            <div className="pricing-item">
              <span className="pi">⌁</span>
              <h4>Tracking links</h4>
              <p>
                Clicks and conversion data where the required services are
                connected.
              </p>
            </div>
            <div className="pricing-item">
              <span className="pi">↗</span>
              <h4>Integrations</h4>
              <p>
                Future imports from supported affiliate, payment, and store
                services.
              </p>
            </div>
          </div>
          <div className="pricing-foot">
            <span>
              No price or free-trial promise until plans are confirmed.
            </span>
            <span>Early access · In development</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
