import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SCENARIOS } from '../../data/scenarios'
import type { ScenarioDefinition } from '../../domain/scenarios/scenarioTypes'
import { PresentationLayout } from '../PresentationLayout'
import { ATTACKING_TRANSITION_PIXI_SCENARIO } from '../data/attackingTransitionPixiAdapter'
import { DEFENSIVE_TRANSITION_PIXI_SCENARIO } from '../data/defensiveTransitionPixiAdapter'
import { PixiPitchPreview } from '../../renderers/pixi/PixiPitchPreview'
import diagram1 from '../../assets/diagram1_attacking_org.png'
import diagram2 from '../../assets/diagram2_defending_org.png'
import diagram3 from '../../assets/diagram3_attacking_transition.png'
import diagram4 from '../../assets/diagram4_defensive_transition.png'

const DIAGRAM_IMAGE_BY_SCENARIO_ID: Record<string, string> = {
  'build-through-wide-channels': diagram1,
  'compact-defensive-block': diagram2,
  'counter-quickly-on-turnover': diagram3,
  'protect-lead-in-back-five': diagram4,
}

const DIAGRAM_SCENARIO_IDS = [
  'build-through-wide-channels',
  'compact-defensive-block',
  'counter-quickly-on-turnover',
  'protect-lead-in-back-five',
  'corner-short-decoy-wide-delivery',
]

const DIAGRAM_SCENARIOS = DIAGRAM_SCENARIO_IDS.map((id) =>
  SCENARIOS.find((scenario) => scenario.id === id),
).filter((scenario): scenario is ScenarioDefinition => Boolean(scenario))

function getBoardUrl(scenario: ScenarioDefinition): string {
  const step = scenario.phaseSteps[0]?.id
  const params = new URLSearchParams({ scenario: scenario.id })

  if (step) {
    params.set('step', step)
  }

  return `/presentation/live-board?${params.toString()}`
}

export function DiagramsPage() {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioDefinition | null>(null)
  const [attackingTransitionCue, setAttackingTransitionCue] = useState('Regain')
  const [defensiveTransitionCue, setDefensiveTransitionCue] = useState('Ball lost')

  const handleScenarioSelect = (scenario: ScenarioDefinition) => {
    setSelectedScenario(scenario)

    if (scenario.id === 'counter-quickly-on-turnover') {
      setAttackingTransitionCue('Regain')
    }

    if (scenario.id === 'protect-lead-in-back-five') {
      setDefensiveTransitionCue('Ball lost')
    }
  }

  return (
    <PresentationLayout pageId="diagrams" noPadding>
      <p className="presentation-eyebrow">Section 2 — the what</p>
      <h1 className="presentation-title">All Moments of the Game</h1>
      <p className="presentation-body">Click any card to inspect the System, Strategy, Tactics, Skill Set, and coaching cue.</p>

      <div className="presentation-diagram-grid presentation-diagram-grid--interactive">
        {DIAGRAM_SCENARIOS.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            className="presentation-diagram-card presentation-diagram-card--button"
            onClick={() => handleScenarioSelect(scenario)}
          >
            {DIAGRAM_IMAGE_BY_SCENARIO_ID[scenario.id] ? (
              <img src={DIAGRAM_IMAGE_BY_SCENARIO_ID[scenario.id]} alt={`${scenario.title} diagram`} />
            ) : (
              <div className="presentation-diagram-card__live-preview">
                <span>Live board scenario</span>
                <strong>{scenario.setPieceType}</strong>
              </div>
            )}
            <span className="presentation-diagram-card__caption">{scenario.momentOfGame}</span>
          </button>
        ))}
      </div>

      {selectedScenario && (
        <div
          className="diagram-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedScenario.momentOfGame} details`}
        >
          <button
            type="button"
            className="diagram-modal__backdrop"
            aria-label="Close diagram details"
            onClick={() => setSelectedScenario(null)}
          />
          <section className="diagram-modal__panel">
            <button
              type="button"
              className="diagram-modal__close"
              aria-label="Close diagram details"
              onClick={() => setSelectedScenario(null)}
            >
              Close
            </button>
            {selectedScenario.id === 'counter-quickly-on-turnover' ? (
              <div
                className="transition-modal-pitch"
                style={{ display: 'grid', placeItems: 'center', overflow: 'hidden' }}
              >
                <div className="transition-modal-pitch__preview">
                  <PixiPitchPreview
                    width={480}
                    height={741}
                    players={ATTACKING_TRANSITION_PIXI_SCENARIO.players}
                    ballPosition={ATTACKING_TRANSITION_PIXI_SCENARIO.ballPosition}
                    steps={ATTACKING_TRANSITION_PIXI_SCENARIO.steps}
                    routes={ATTACKING_TRANSITION_PIXI_SCENARIO.routes}
                    repeatDelay={1.15}
                    onCueChange={setAttackingTransitionCue}
                  />
                  <div className="mini-pitch__cue" aria-live="polite">
                    {attackingTransitionCue}
                  </div>
                  <div className="mini-pitch__caption">
                    {ATTACKING_TRANSITION_PIXI_SCENARIO.caption}
                  </div>
                  <div className="mini-pitch__legend" aria-label="Diagram key">
                    <span>
                      <i className="mini-pitch__legend-mark mini-pitch__legend-mark--pass" />
                      Pass
                    </span>
                    <span>
                      <i className="mini-pitch__legend-mark mini-pitch__legend-mark--run" />
                      Player run
                    </span>
                  </div>
                </div>
              </div>
            ) : selectedScenario.id === 'protect-lead-in-back-five' ? (
              <div
                className="transition-modal-pitch"
                style={{ display: 'grid', placeItems: 'center', overflow: 'hidden' }}
              >
                <div className="transition-modal-pitch__preview">
                  <PixiPitchPreview
                    width={480}
                    height={741}
                    players={DEFENSIVE_TRANSITION_PIXI_SCENARIO.players}
                    ballPosition={DEFENSIVE_TRANSITION_PIXI_SCENARIO.ballPosition}
                    steps={DEFENSIVE_TRANSITION_PIXI_SCENARIO.steps}
                    routes={DEFENSIVE_TRANSITION_PIXI_SCENARIO.routes}
                    repeatDelay={1}
                    onCueChange={setDefensiveTransitionCue}
                  />
                  <div className="mini-pitch__cue" aria-live="polite">
                    {defensiveTransitionCue}
                  </div>
                  <div className="mini-pitch__caption">
                    {DEFENSIVE_TRANSITION_PIXI_SCENARIO.caption}
                  </div>
                  <div className="mini-pitch__legend" aria-label="Diagram key">
                    <span>
                      <i
                        className="mini-pitch__legend-mark"
                        style={{ background: '#ef4444' }}
                      />
                      Pressure
                    </span>
                    <span>
                      <i
                        className="mini-pitch__legend-mark"
                        style={{ background: '#22c55e' }}
                      />
                      Recovery
                    </span>
                  </div>
                </div>
              </div>
            ) : DIAGRAM_IMAGE_BY_SCENARIO_ID[selectedScenario.id] ? (
              <img
                src={DIAGRAM_IMAGE_BY_SCENARIO_ID[selectedScenario.id]}
                alt={`${selectedScenario.title} expanded diagram`}
              />
            ) : (
              <div className="diagram-modal__live-preview">
                <span>Open this set-piece in the live board</span>
                <strong>{selectedScenario.title}</strong>
              </div>
            )}
            <div className="diagram-modal__content">
              <span>Moment of the Game: {selectedScenario.momentOfGame}</span>
              <h2>{selectedScenario.system.shape}</h2>
              <p><strong>System:</strong> {selectedScenario.system.description}</p>
              {selectedScenario.setPieceType && (
                <p><strong>Set piece type:</strong> {selectedScenario.setPieceType}</p>
              )}
              <p><strong>Field Geography:</strong> {selectedScenario.fieldGeography.description}</p>
              <p><strong>Strategy:</strong> {selectedScenario.strategy}</p>
              <div>
                <strong>Tactics</strong>
                <div className="presentation-chip-row">
                  {selectedScenario.tactics.map((tactic) => (
                    <span key={tactic} className="presentation-chip presentation-chip--small">
                      {tactic}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <strong>Skill Set</strong>
                <div className="presentation-chip-row">
                  {selectedScenario.skillSet.map((skill) => (
                    <span key={skill} className="presentation-chip presentation-chip--small">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <p><strong>Key coaching point:</strong> {selectedScenario.phaseSteps[0]?.coachingCue}</p>
              <Link className="presentation-link-button" to={getBoardUrl(selectedScenario)}>
                Open in live board
              </Link>
            </div>
          </section>
        </div>
      )}
    </PresentationLayout>
  )
}
