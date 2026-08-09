import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PixiPitchPreview } from '../../renderers/pixi/PixiPitchPreview'
import { PresentationLayout } from '../PresentationLayout'
import { DEFENSIVE_ORGANIZATION_PAGE_CASE } from '../data/defensiveOrganizationPageData'
import { DEFENSIVE_ORGANIZATION_PIXI_SCENARIO } from '../data/defensiveOrganizationPixiAdapter'

export function DefensiveOrganizationPage() {
  const scenario = DEFENSIVE_ORGANIZATION_PAGE_CASE
  const [cue, setCue] = useState(scenario.steps[0]?.cue ?? '')
  const [activeStepId, setActiveStepId] = useState(scenario.steps[0]?.id ?? '')
  const activeStep = scenario.steps.find((step) => step.id === activeStepId) ?? scenario.steps[0]

  const handleCueChange = (nextCue: string) => {
    setCue(nextCue)
    const nextStep = scenario.steps.find((step) => step.cue === nextCue)
    if (nextStep) setActiveStepId(nextStep.id)
  }

  return (
    <PresentationLayout pageId="defensive-organization" noPadding>
      <p className="presentation-eyebrow">Moment page - defensive organization</p>
      <h1 className="presentation-title">Defensive Organization</h1>
      <p className="presentation-body">
        Out of possession, we stay compact in a 1-4-2-3-1, deny central Channel 2/3 passes,
        force the opponent into Channel 1, and press wide with control while protecting Zone 1/2.
      </p>

      <section className="analysis-lab">
        <div className="analysis-pitch-card defensive-organization-pitch-card">
          <PixiPitchPreview
            width={480}
            height={741}
            players={DEFENSIVE_ORGANIZATION_PIXI_SCENARIO.players}
            ballPosition={DEFENSIVE_ORGANIZATION_PIXI_SCENARIO.ballPosition}
            steps={DEFENSIVE_ORGANIZATION_PIXI_SCENARIO.steps}
            routes={DEFENSIVE_ORGANIZATION_PIXI_SCENARIO.routes}
            tokenScale={scenario.tokenScale}
            repeatDelay={scenario.repeatDelay}
            fadeRouteHistory
            onCueChange={handleCueChange}
          />
          <div className="defensive-organization-geography" aria-hidden="true">
            <div className="defensive-organization-geography__pitch">
              <span className="defensive-organization-geography__channel defensive-organization-geography__channel--central">
                <b>Channel 3</b>
                <small>Deny</small>
              </span>
              <span className="defensive-organization-geography__channel defensive-organization-geography__channel--half-space">
                <b>Channel 2</b>
                <small>Protect</small>
              </span>
              <span className="defensive-organization-geography__channel defensive-organization-geography__channel--wide">
                <b>Channel 1</b>
                <small>Direct</small>
              </span>
            </div>
          </div>
          <div className="mini-pitch__cue" aria-live="polite">{cue}</div>
          <div className="mini-pitch__caption">{scenario.caption}</div>
          <div className="mini-pitch__legend" aria-label="Diagram key">
            <span><i className="mini-pitch__legend-mark" style={{ background: '#facc15' }} />Directed wide</span>
            <span><i className="mini-pitch__legend-mark" style={{ background: '#ef4444' }} />Pressure</span>
            <span><i className="mini-pitch__legend-mark" style={{ background: '#22c55e' }} />Cover / balance</span>
          </div>
        </div>

        <aside className="analysis-tabs">
          <section className="analysis-detail defensive-organization-panel">
            <span>Moment of the Game: Defensive Organization</span>
            <div className="defensive-organization-problem">
              <strong>Opponent problem</strong>
              <p>{scenario.opponentProblem}</p>
            </div>

            <section className="defensive-organization-game-plan">
              <span>Game plan</span>
              <h2>{scenario.system.shape}</h2>
              <dl>
                <div>
                  <dt>System</dt>
                  <dd>{scenario.system.description}</dd>
                </div>
                <div>
                  <dt>Strategy</dt>
                  <dd>{scenario.strategy}</dd>
                </div>
              </dl>
            </section>

            {activeStep && (
              <section className="defensive-organization-phase" aria-live="polite">
                <span>Current phase principle</span>
                <strong>{activeStep.principle}</strong>
                <p>{activeStep.phaseSummary}</p>
              </section>
            )}

            <section className="defensive-organization-tactics">
              <span>Tactics</span>
              <ol>
                {scenario.tactics.map((tactic) => (
                  <li key={tactic.number} className={tactic.stepIds.includes(activeStepId) ? 'is-active' : undefined}>
                    <b>{tactic.number}</b>
                    <div>
                      <strong>{tactic.title}</strong>
                      <p>{tactic.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section className="defensive-organization-skills">
              <span>Skill Set</span>
              <div className="presentation-chip-row">
                {scenario.skillSet.map((skill) => <span key={skill} className="presentation-chip presentation-chip--small">{skill}</span>)}
              </div>
            </section>
            <Link className="presentation-link-button" to={`/presentation/live-board?scenario=${scenario.liveBoardScenarioId}`}>
              Open in live board
            </Link>
          </section>
        </aside>
      </section>
    </PresentationLayout>
  )
}
