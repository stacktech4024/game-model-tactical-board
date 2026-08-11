import { PresentationLayout } from '../PresentationLayout'
import TacticalBoardPage from '../../pages/TacticalBoardPage'

export function LiveBoardPage() {
  return (
    <PresentationLayout pageId="live-board" noPadding>
      <p className="presentation-eyebrow">Section 2 — explore live</p>
      <h1 className="presentation-title">Interactive tactical board</h1>
      <p className="presentation-body">
        Choose a scenario, then inspect one coordinated movement phase at a time or press Play to
        watch the full sequence. Each phase identifies the trigger, key players, and intended outcome.
      </p>
      <TacticalBoardPage initialScenarioId="build-through-wide-channels" embedded />
    </PresentationLayout>
  )
}
