import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SCENARIOS } from '../../data/scenarios'
import type { ScenarioDefinition } from '../../domain/scenarios/scenarioTypes'
import { PresentationLayout } from '../PresentationLayout'
import diagram1 from '../../assets/diagram1_attacking_org.png'
import diagram2 from '../../assets/diagram2_defending_org.png'
import diagram3 from '../../assets/diagram3_attacking_transition.png'
import diagram4 from '../../assets/diagram4_defensive_transition.png'

const DIAGRAM_IMAGE_BY_SCENARIO_ID: Record<string, string> = {
  'build-through-wide-channels': diagram1,
  'compact-defensive-block': diagram2,
  'counter-quickly-on-turnover': diagram3,
  'protect-lead-in-back-five': diagram4,
  'corner-short-decoy-wide-delivery': diagram1,
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

export function DiagramsPage() {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioDefinition | null>(null)

  return (
    <PresentationLayout pageId="diagrams" noPadding>
      <p className="presentation-eyebrow">Section 2 — the what</p>
      <h1 className="presentation-title">Open-play Moments of the Game + set pieces</h1>
      <p className="presentation-body">Click a Moment of the Game to inspect the System, Strategy, Tactics, and coaching cue.</p>

      <div className="presentation-diagram-grid presentation-diagram-grid--interactive">
        {DIAGRAM_SCENARIOS.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            className="presentation-diagram-card presentation-diagram-card--button"
            onClick={() => setSelectedScenario(scenario)}
          >
            <img src={DIAGRAM_IMAGE_BY_SCENARIO_ID[scenario.id]} alt={`${scenario.title} diagram`} />
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
            <img
              src={DIAGRAM_IMAGE_BY_SCENARIO_ID[selectedScenario.id]}
              alt={`${selectedScenario.title} expanded diagram`}
            />
            <div className="diagram-modal__content">
              <span>Moment of the Game: {selectedScenario.momentOfGame}</span>
              <h2>{selectedScenario.system}</h2>
              {selectedScenario.setPieceType && (
                <p><strong>Set piece type:</strong> {selectedScenario.setPieceType}</p>
              )}
              <p><strong>Field geography:</strong> {selectedScenario.fieldGeography.zones.join(', ')} · {selectedScenario.fieldGeography.channels.join(', ')}</p>
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
              <Link className="presentation-link-button" to="/board">
                Open in live board
              </Link>
            </div>
          </section>
        </div>
      )}
    </PresentationLayout>
  )
}
