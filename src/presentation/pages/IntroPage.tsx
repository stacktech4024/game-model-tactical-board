import { PresentationLayout } from '../PresentationLayout'
import { PICKERING_GAME_MODEL } from '../../data/gameModel'

export function IntroPage() {
  return (
    <PresentationLayout pageId="intro">
      <p className="presentation-eyebrow">Section 1 — the why</p>
      <h1 className="presentation-title">Who we are</h1>
      <p className="presentation-body">
        My coaching philosophy centres on patience in possession. We build and combine passes
        before committing forward, attacking from wide channels and finding our striker in a
        central position for quick, clinical finishes. Nothing is done without intent — every
        pass, every run, and every defensive action serves the team's broader plan.
      </p>
      <blockquote className="presentation-quote">
        {PICKERING_GAME_MODEL.possession}. {PICKERING_GAME_MODEL.buildUp}.{' '}
        {PICKERING_GAME_MODEL.finishing}. Everything with a purpose.
      </blockquote>
      <p className="presentation-body">
        The club's guiding principle is a positive culture built on structure and consistency
        throughout the season. We place high value on the phases of the game, on players
        continually self-assessing their own improvement, and on coaches actively teaching
        tactical ideas — both on the training pitch and in classroom sessions.
      </p>
    </PresentationLayout>
  )
}
