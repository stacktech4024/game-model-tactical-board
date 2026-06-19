import { PresentationLayout } from '../PresentationLayout'
import { MICROCYCLE, COACHING_TOOLS, METHODOLOGY_WHY } from '../data/methodology'

export function MethodologyPage() {
  return (
    <PresentationLayout pageId="methodology" noPadding>
      <p className="presentation-eyebrow">Section 4 — the reasoning</p>
      <h1 className="presentation-title">Training methodology</h1>
      <p className="presentation-body">
        My preferred approach is Whole-Part-Whole. We start by playing the game, pause to isolate
        the specific tactical behaviour we need to address, then bring the group back into the
        full game context so they apply what they have learned under real match conditions.
      </p>

      <div className="presentation-grid">
        {COACHING_TOOLS.map((tool) => (
          <div key={tool.title} className="presentation-card">
            <h3>{tool.title}</h3>
            <p>{tool.detail}</p>
          </div>
        ))}
      </div>

      <table className="presentation-table">
        <thead>
          <tr>
            <th>Day</th>
            <th>Focus</th>
          </tr>
        </thead>
        <tbody>
          {MICROCYCLE.map((row) => (
            <tr key={row.day}>
              <td>{row.day}</td>
              <td>{row.focus}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="presentation-body" style={{ marginTop: 28 }}>
        {METHODOLOGY_WHY}
      </p>
    </PresentationLayout>
  )
}
