import Reveal from "../../components/Reveal";

export default function Faq() {
  return (
    <section className="faq-section" id="faq">
      <Reveal className="wrap faq-layout" as="div" delay={140}>
        <div className="faq-intro">
          <span className="eyebrow">Questions, answered</span>
          <h2>
            Straight answers.
            <br />
            No pretend certainty.
          </h2>
          <p>
            Dablo is in development. These answers describe the intended product
            and what the first version can reasonably support.
          </p>
        </div>
        <div className="faq-list">
          <details>
            <summary>What is Dablo?</summary>
            <p>
              Dablo is a revenue tracking and analytics platform for people who
              use content to grow an audience, business, or income. It brings
              revenue, expenses, content, tracking links, and campaigns into one
              workspace.
            </p>
          </details>
          <details>
            <summary>Who is Dablo for?</summary>
            <p>
              Creators, founders, personal-brand builders, affiliate marketers,
              consultants, and independent professionals who earn through
              content.
            </p>
          </details>
          <details>
            <summary>
              Can I track revenue from an individual video or post?
            </summary>
            <p>
              Yes, by associating a revenue record with the relevant content
              manually or through reliable conversion data from a supported
              integration. Views alone do not prove that a piece of content
              generated a sale.
            </p>
          </details>
          <details>
            <summary>How do tracking links work?</summary>
            <p>
              A unique link can be assigned to a video, post, product, or
              campaign. A deployed redirect endpoint is required to record
              clicks. Purchases require conversion data from a supported service
              or manual entry.
            </p>
          </details>
          <details>
            <summary>Are clicks the same as sales?</summary>
            <p>
              No. Clicks show that someone opened a link. They do not confirm a
              purchase. Dablo should show conversion and revenue only when the
              data is available and the attribution is justified.
            </p>
          </details>
          <details>
            <summary>Can I track sponsorships and affiliate income?</summary>
            <p>
              The intended workflow supports recording sponsorship deals,
              deliverables, payment status, campaign expenses, affiliate
              commissions, and related content. Automatic imports depend on
              future supported integrations.
            </p>
          </details>
          <details>
            <summary>Can Dablo track expenses and profit?</summary>
            <p>
              Yes. The planned dashboard calculates net profit as total revenue
              minus total expenses, using the records available in your account.
            </p>
          </details>
          <details>
            <summary>What does “Why It Converted” do?</summary>
            <p>
              It helps you compare content and record possible explanations,
              such as the hook, audience intent, product fit, offer, and call to
              action. These are hypotheses unless the available evidence
              supports a stronger conclusion.
            </p>
          </details>
          <details>
            <summary>What are Content Success Frameworks?</summary>
            <p>
              They are editable checklists you save from patterns worth testing
              again. Each framework can link back to the content that inspired
              it. They are a learning tool, not a guarantee of results.
            </p>
          </details>
          <details>
            <summary>
              Does Dablo connect to every platform automatically?
            </summary>
            <p>
              No. The initial version relies on manual entry. Integrations and
              automatic imports can be added where platforms provide suitable
              access and permissions.
            </p>
          </details>
          <details>
            <summary>How will financial data be protected?</summary>
            <p>
              The product plan includes authenticated accounts, database access
              controls, and limited collection of tracking information. The
              cloud implementation and security policies must be in place before
              these protections can be considered live.
            </p>
          </details>
          <details>
            <summary>Can I use Dablo today?</summary>
            <p>
              Not yet. Dablo is in development. Join the early-access list to
              hear about availability. This form is a prototype and does not
              send your email to a backend yet.
            </p>
          </details>
        </div>
      </Reveal>
    </section>
  );
}
