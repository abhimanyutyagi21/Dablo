import StoryLines from "../../components/StoryLines";

export default function Story() {
  return (
    <section className="story-section">
      <div className="section-orb orb-story" aria-hidden="true">
        <span>↗</span>
      </div>
      <div className="wrap story-grid">
        <div className="story-aside">
          <span className="eyebrow">The problem is not more data</span>
          <p>
            You already have views, likes, clicks, invoices, and payouts. The
            hard part is connecting the dots.
          </p>
          <div className="story-proof">
            <div className="proof-mark">d.</div>
            <div>
              <b>One financial picture</b>
              <small>Content · Campaigns · Revenue</small>
            </div>
          </div>
        </div>
        <StoryLines
          lines={[
            "A video can get thousands of views.",
            "A smaller one can make more money.",
            "Dablo helps you see the difference, connect the earning to the content, and learn from the result.",
          ]}
        />
      </div>
    </section>
  );
}
