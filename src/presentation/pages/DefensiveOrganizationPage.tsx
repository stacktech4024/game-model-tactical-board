import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PixiPitchPreview } from '../../renderers/pixi/PixiPitchPreview'
import { PresentationLayout } from '../PresentationLayout'
import { DEFENSIVE_ORGANIZATION_PAGE_CASE } from '../data/defensiveOrganizationPageData'
import { DEFENSIVE_ORGANIZATION_PIXI_SCENARIO } from '../data/defensiveOrganizationPixiAdapter'

export function DefensiveOrganizationPage() {
  const scenario = DEFENSIVE_ORGANIZATION_PAGE_CASE
  const [cue, setCue] = useState(scenario.steps[0]?.cue ?? '')

  return (
    <PresentationLayout pageId="defensive-organization" noPadding>
      <p className="presentation-eyebrow">Moment page - defensive organization</p>
      <h1 className="presentation-title">Defensive Organization</h1>
      <p className="presentation-body">
        Out of possession, we stay compact in a 1-4-2-3-1, deny central Channel 2/3 passes,
        force the opponent into Channel 1, and press wide with control while protecting Zone 1/2.
      </p>

      <section className="analysis-lab">
        <div className="analysis-pitch-card">
          <PixiPitchPreview
            width={480}
            height={741}
            players={DEFENSIVE_ORGANIZATION_PIXI_SCENARIO.players}
            ballPosition={DEFENSIVE_ORGANIZATION_PIXI_SCENARIO.ballPosition}
            steps={DEFENSIVE_ORGANIZATION_PIXI_SCENARIO.steps}
            routes={DEFENSIVE_ORGANIZATION_PIXI_SCENARIO.routes}
            tokenScale={scenario.tokenScale}
            repeatDelay={scenario.repeatDelay}
            onCueChange={setCue}
          />
          <div className="mini-pitch__cue" aria-live="polite">{cue}</div>
          <div className="mini-pitch__caption">{scenario.caption}</div>
          <div className="mini-pitch__legend" aria-label="Diagram key">
            <span><i className="mini-pitch__legend-mark" style={{ background: '#ef4444' }} />Wide pressure</span>
            <span><i className="mini-pitch__legend-mark" style={{ background: '#22c55e' }} />Screen / shift</span>
          </div>
        </div>

        <aside className="analysis-tabs">
          <section className="analysis-detail" aria-live="polite">
            <span>Moment of the Game: Defensive Organization</span>
            <h2>{scenario.system.shape}</h2>
            <div>
              <strong>System</strong>
              <p>{scenario.system.description}</p>
            </div>
            <div>
              <strong>Strategy</strong>
              <div className="presentation-chip-row">
                <span className="presentation-chip presentation-chip--small">{scenario.strategy}</span>
              </div>
            </div>
            <div>
              <strong>Tactics</strong>
              <div className="presentation-chip-row">
                {scenario.tactics.map((tactic) => <span key={tactic} className="presentation-chip presentation-chip--small">{tactic}</span>)}
              </div>
            </div>
            <div>
              <strong>Skill Set</strong>
              <div className="presentation-chip-row">
                {scenario.skillSet.map((skill) => <span key={skill} className="presentation-chip presentation-chip--small">{skill}</span>)}
              </div>
            </div>
            <div>
              <strong>Canada Soccer defending principles</strong>
              <div className="presentation-chip-row">
                {scenario.principles.map((principle) => <span key={principle} className="presentation-chip presentation-chip--small">{principle}</span>)}
              </div>
            </div>
            <Link className="presentation-link-button" to={`/presentation/live-board?scenario=${scenario.liveBoardScenarioId}`}>
              Open in live board
            </Link>
          </section>
        </aside>
      </section>
    </PresentationLayout>
  )
}
