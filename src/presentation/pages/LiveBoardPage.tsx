import { PresentationLayout } from '../PresentationLayout'
import TacticalBoardPage from '../../pages/TacticalBoardPage'

export function LiveBoardPage() {
  return (
    <PresentationLayout pageId="live-board" noPadding>
      <p className="presentation-eyebrow">Section 2 — explore live</p>
      <h1 className="presentation-title">Interactive tactical board</h1>
      <p className="presentation-body">
        Select a scenario on the left, then step through each movement phase or press Play to watch
        the full sequence. Use Previous / Next to inspect each phase cue in detail.
      </p>
      <TacticalBoardPage initialScenarioId="build-through-wide-channels" embedded />
    </PresentationLayout>
  )
}
