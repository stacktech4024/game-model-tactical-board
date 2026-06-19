import { PresentationLayout } from '../PresentationLayout'
import clubLogo from '../../assets/club-logo-transparent.png'

export function ClosingPage() {
  return (
    <PresentationLayout pageId="closing">
      <p className="presentation-eyebrow">Section 5 — closing</p>
      <img src={clubLogo} alt="Pickering FC crest" className="presentation-logo" />
      <h1 className="presentation-title">Thank you</h1>
      <p className="presentation-body">
        This interactive presentation, the written Game &amp; Training Model, and the Emergency
        Action Plan together form the complete Canada Soccer B Diploma capping submission.
      </p>
      <div className="presentation-grid">
        <div className="presentation-card">
          <h3>Game &amp; Training Model</h3>
          <p>Full written detail of philosophy, System, Strategy, Tactics, Skill Set, and positional profiles.</p>
        </div>
        <div className="presentation-card">
          <h3>Emergency Action Plan</h3>
          <p>Pickering FC U20 OPL Men's Program — submitted as a companion document.</p>
        </div>
        <div className="presentation-card">
          <h3>Capping Submission Package</h3>
          <p>Interactive digital presentation, written document, and EAP — complete coaching portfolio for B Diploma review.</p>
        </div>
      </div>
      <p className="presentation-body" style={{ marginTop: 28 }}>
        Pickering FC — U20 OPL Men's Program · Coach Darren Billy
      </p>
    </PresentationLayout>
  )
}
