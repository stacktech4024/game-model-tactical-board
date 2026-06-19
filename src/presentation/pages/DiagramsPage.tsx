import { PresentationLayout } from '../PresentationLayout'
import diagram1 from '../../assets/diagram1_attacking_org.png'
import diagram2 from '../../assets/diagram2_defending_org.png'
import diagram3 from '../../assets/diagram3_attacking_transition.png'
import diagram4 from '../../assets/diagram4_defensive_transition.png'

const DIAGRAMS = [
  { src: diagram1, caption: 'Figure 1 — Attacking organization: build-up structure and passing options' },
  { src: diagram2, caption: 'Figure 2 — Defensive organization: 1-4-2-3-1 low block, pressing triggers and cover' },
  { src: diagram3, caption: 'Figure 3 — Attacking transition: counter on turnover, trigger runs and first pass' },
  { src: diagram4, caption: 'Figure 4 — Defensive transition: 5-second fuse press with a high defensive line' },
]

export function DiagramsPage() {
  return (
    <PresentationLayout pageId="diagrams" noPadding>
      <p className="presentation-eyebrow">Section 2 — the what</p>
      <h1 className="presentation-title">The four moments of the game</h1>
      <p className="presentation-body">
        Each diagram shows our shape, our key principles, and our coaching points for that
        specific moment, using the Canada Soccer zones and channels framework.
      </p>
      <div className="presentation-diagram-grid">
        {DIAGRAMS.map((diagram) => (
          <figure key={diagram.src} className="presentation-diagram-card">
            <img src={diagram.src} alt={diagram.caption} />
            <figcaption className="presentation-diagram-card__caption">{diagram.caption}</figcaption>
          </figure>
        ))}
      </div>
    </PresentationLayout>
  )
}
