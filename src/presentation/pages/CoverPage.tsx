import { PresentationLayout } from '../PresentationLayout'
import clubLogo from '../../assets/club-logo-transparent.png'

export function CoverPage() {
  const identityChips = ['Calm possession', 'Wide-channel progression', 'Central finishing']

  return (
    <PresentationLayout pageId="cover">
      <img src={clubLogo} alt="Pickering FC crest" className="presentation-logo" />
      <p className="presentation-eyebrow">Canada Soccer B Diploma — Capping Project</p>
      <h1 className="presentation-title">Game &amp; Training Model</h1>
      <p className="presentation-subtitle">
        Pickering FC — U20 OPL Men's Program · Coach Darren Billy
      </p>
      <p className="presentation-body">An interactive coaching lab for how we play, train, and teach.</p>
      <div className="presentation-chip-row" aria-label="Team identity">
        {identityChips.map((chip) => (
          <span key={chip} className="presentation-chip">
            {chip}
          </span>
        ))}
      </div>
    </PresentationLayout>
  )
}
