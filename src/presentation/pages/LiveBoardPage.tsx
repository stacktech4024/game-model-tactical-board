import { PresentationLayout } from '../PresentationLayout'
import TacticalBoardPage from '../../pages/TacticalBoardPage'

export function LiveBoardPage() {
  return (
    <PresentationLayout pageId="live-board" noPadding>
      <p className="presentation-eyebrow">Section 2 — the what</p>
      <h1 className="presentation-title">Explore it live</h1>
      <p className="presentation-body">
        This is the actual tactical board — the same tool used to build every diagram in this
        presentation. Select a scenario on the left, then use the play controls to watch the
        movement, or switch formations and toggle layers to explore further.
      </p>
      <TacticalBoardPage initialScenarioId="build-through-wide-channels" embedded />
    </PresentationLayout>
  )
}
