import { PresentationLayout } from '../PresentationLayout'
import clubLogo from '../../assets/club-logo.jpg'

export function CoverPage() {
  return (
    <PresentationLayout pageId="cover">
      <img src={clubLogo} alt="Pickering FC crest" className="presentation-logo" />
      <p className="presentation-eyebrow">Canada Soccer B Diploma — Capping Project</p>
      <h1 className="presentation-title">Game &amp; training model</h1>
      <p className="presentation-subtitle">
        Pickering FC — U20 OPL Men's Program · Coach Darren Billy
      </p>
      <p className="presentation-body">
        This presentation walks through Pickering FC's game model — our coaching philosophy, how
        we want to play, our tactical principles across each moment of the game, and the training
        methodology behind it. The live tactical board is embedded directly in this presentation
        so you can explore the scenarios yourself.
      </p>
    </PresentationLayout>
  )
}
