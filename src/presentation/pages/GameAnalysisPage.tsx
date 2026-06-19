import { PresentationLayout } from '../PresentationLayout'

export function GameAnalysisPage() {
  return (
    <PresentationLayout pageId="game-analysis">
      <p className="presentation-eyebrow">Section 2 — the what</p>
      <h1 className="presentation-title">Game analysis: attacking organization</h1>
      <p className="presentation-body">
        System: 1-4-4-2 · Zone focus: Zone 1 → Zone 3. We build from the back through the wide
        channels, using the goalkeeper and centre-backs to draw the opposition press before
        progressing the ball forward with calm, controlled support.
      </p>

      <div className="presentation-grid">
        <div className="presentation-card">
          <h3>System</h3>
          <p>
            1-4-4-2 in possession. Full-backs push into Channels 1 and 2, wide forwards hold
            width, the CDM drops to offer a third option from the back.
          </p>
        </div>
        <div className="presentation-card">
          <h3>Strategy</h3>
          <p>
            Draw the opposition press out of position by building patiently, then exploit the
            space they vacate in the wide channels.
          </p>
        </div>
        <div className="presentation-card">
          <h3>Tactics</h3>
          <p>
            Centre-backs split, full-backs overlap, the CAM rotates to switch play, and the
            striker stays high in Zone 3 to stretch the back line.
          </p>
        </div>
        <div className="presentation-card">
          <h3>Coaching point</h3>
          <p>
            This is patient build-up — we are not forcing the ball forward, we are drawing the
            opponent out and playing around or through the press with controlled support.
          </p>
        </div>
      </div>
    </PresentationLayout>
  )
}
