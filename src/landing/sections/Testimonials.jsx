export default function Testimonials() {
  return (
    <section className="testimonials-section" id="testimonials">
      <div className="testimonials-glow" aria-hidden="true"></div>
      <div className="wrap">
        <div className="testimonials-head">
          <div>
            <span className="eyebrow">The human side of the numbers</span>
            <h2>
              Good work deserves
              <br />
              <em>proof that feels real.</em>
            </h2>
          </div>
          <div className="testimonials-intro">
            <span className="testimonial-stamp">DABLO / FIELD NOTES 001</span>
            <p>
              When real creators use Dablo, this is where their stories belong.
              No invented praise, no made-up results. Just clear feedback from
              people doing the work.
            </p>
            <a href="#pricing" className="testimonial-link">
              Be part of the first stories <span>↗</span>
            </a>
          </div>
        </div>
        <div className="testimonial-stage">
          <div className="testimonial-side-note">
            <span className="note-dot"></span> CUSTOMER STORIES
            <br />
            <b>COMING INTO FOCUS</b>
            <span className="note-rule"></span>
            <small>
              Real people. Real workflows.
              <br />
              Evidence over hype.
            </small>
          </div>
          <article className="testimonial-card testimonial-main">
            <div className="testimonial-card-top">
              <span className="testimonial-label">
                <i>✳</i> EARLY ACCESS STORY
              </span>
              <span className="testimonial-index">01 / 03</span>
            </div>
            <div className="quote-glyph">“</div>
            <p className="testimonial-quote">
              Early-access preview. Use one specific moment when Dablo helped
              you connect a piece of content to a business result.
            </p>
            <div className="testimonial-card-bottom">
              <div className="testimonial-person">
                <div className="testimonial-avatar avatar-blue">C</div>
                <div>
                  <b>Early-access preview</b>
                  <span>Creator · Replace with verified role</span>
                </div>
              </div>
              <span className="testimonial-placeholder">QUOTE PLACEHOLDER</span>
            </div>
            <div className="testimonial-orbit" aria-hidden="true">
              <i></i>
              <i></i>
              <i></i>
            </div>
          </article>
          <article className="testimonial-card testimonial-secondary testimonial-secondary-one">
            <div className="testimonial-card-top">
              <span className="testimonial-label">
                <i>↗</i> FOUNDER NOTES
              </span>
              <span className="testimonial-index">02 / 03</span>
            </div>
            <p className="testimonial-quote small-quote">
              Add a short, honest line about a decision that became clearer
              after seeing content and revenue together.
            </p>
            <div className="testimonial-card-bottom">
              <div className="testimonial-person">
                <div className="testimonial-avatar avatar-sand">F</div>
                <div>
                  <b>Founder name</b>
                  <span>Founder · Replace with verified role</span>
                </div>
              </div>
              <span className="testimonial-placeholder">PLACEHOLDER</span>
            </div>
          </article>
          <article className="testimonial-card testimonial-secondary testimonial-secondary-two">
            <div className="testimonial-card-top">
              <span className="testimonial-label">
                <i>◎</i> CREATOR NOTES
              </span>
              <span className="testimonial-index">03 / 03</span>
            </div>
            <p className="testimonial-quote small-quote">
              Use a real quote about the workflow, what changed, and why it
              mattered. Keep it in the customer's own words.
            </p>
            <div className="testimonial-card-bottom">
              <div className="testimonial-person">
                <div className="testimonial-avatar avatar-lilac">A</div>
                <div>
                  <b>Early-access preview</b>
                  <span>Independent creator · Verify before launch</span>
                </div>
              </div>
              <span className="testimonial-placeholder">PLACEHOLDER</span>
            </div>
          </article>
          <div className="testimonial-footnote">
            <span>01 — REAL FEEDBACK ONLY</span>
            <span>
              Replace every placeholder with approved customer quotes before
              publishing.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
