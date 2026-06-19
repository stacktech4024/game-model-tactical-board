import { PresentationLayout } from '../PresentationLayout'
import clubLogo from '../../assets/club-logo.jpg'

export function ClosingPage() {
  return (
    <PresentationLayout pageId="closing">
      <img src={clubLogo} alt="Pickering FC crest" className="presentation-logo" />
      <h1 className="presentation-title">Thank you</h1>
      <p className="presentation-body">
        This presentation, the full Game &amp; Training Model document, and the Emergency Action
        Plan together make up the complete capping project submission.
      </p>
      <div className="presentation-grid">
        <div className="presentation-card">
          <h3>Game &amp; Training Model</h3>
          <p>Full written detail of philosophy, system-strategy-tactics, and positional profiles.</p>
        </div>
        <div className="presentation-card">
          <h3>Emergency Action Plan</h3>
          <p>Pickering FC U20 OPL Men's Program — submitted as a companion document.</p>
        </div>
      </div>
      <p className="presentation-body" style={{ marginTop: 28 }}>
        Pickering FC — U20 OPL Men's Program · Coach Darren Billy
      </p>
    </PresentationLayout>
  )
}
