import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SCENARIOS } from '../../data/scenarios'
import type { ScenarioDefinition } from '../../domain/scenarios/scenarioTypes'
import { PresentationLayout } from '../PresentationLayout'
import { BUILD_THROUGH_WIDE_CHANNELS_PIXI_SCENARIO } from '../data/buildThroughWideChannelsPixiAdapter'
import { ATTACKING_TRANSITION_PIXI_SCENARIO } from '../data/attackingTransitionPixiAdapter'
import { DEFENSIVE_TRANSITION_PIXI_SCENARIO } from '../data/defensiveTransitionPixiAdapter'
import { WING_BACK_ATTACK_PIXI_SCENARIO } from '../data/wingBackAttackPixiAdapter'
import { PixiPitchPreview } from '../../renderers/pixi/PixiPitchPreview'
import { ResponsivePixiPitchPreview } from '../components/ResponsivePixiPitchPreview'

const DIAGRAM_SCENARIO_IDS = [
  'build-through-wide-channels',
  'counter-quickly-on-turnover',
  'protect-lead-in-back-five',
  'back-five-to-wing-back-attack',
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

function DiagramCardPreview({ scenario }: { scenario: ScenarioDefinition }) {
  if (scenario.id === 'build-through-wide-channels') {
    return (
      <div style={{ width: '100%' }}>
        <ResponsivePixiPitchPreview
          players={BUILD_THROUGH_WIDE_CHANNELS_PIXI_SCENARIO.players}
          ballPosition={BUILD_THROUGH_WIDE_CHANNELS_PIXI_SCENARIO.ballPosition}
          routes={BUILD_THROUGH_WIDE_CHANNELS_PIXI_SCENARIO.routes}
        />
      </div>
    )
  }

  if (scenario.id === 'counter-quickly-on-turnover') {
    return (
      <div style={{ width: '100%' }}>
        <ResponsivePixiPitchPreview
          players={ATTACKING_TRANSITION_PIXI_SCENARIO.players}
          ballPosition={ATTACKING_TRANSITION_PIXI_SCENARIO.ballPosition}
          routes={ATTACKING_TRANSITION_PIXI_SCENARIO.routes}
        />
      </div>
    )
  }

  if (scenario.id === 'protect-lead-in-back-five') {
    return (
      <div style={{ width: '100%' }}>
        <ResponsivePixiPitchPreview
          players={DEFENSIVE_TRANSITION_PIXI_SCENARIO.players}
          ballPosition={DEFENSIVE_TRANSITION_PIXI_SCENARIO.ballPosition}
          routes={DEFENSIVE_TRANSITION_PIXI_SCENARIO.routes}
        />
      </div>
    )
  }

  if (scenario.id === 'back-five-to-wing-back-attack') {
    return (
      <div style={{ width: '100%' }}>
        <ResponsivePixiPitchPreview
          players={WING_BACK_ATTACK_PIXI_SCENARIO.players}
          ballPosition={WING_BACK_ATTACK_PIXI_SCENARIO.ballPosition}
          routes={WING_BACK_ATTACK_PIXI_SCENARIO.routes}
        />
      </div>
    )
  }

  return (
    <div className="presentation-diagram-card__live-preview">
      <span>Live board scenario</span>
      <strong>{scenario.setPieceType}</strong>
    </div>
  )
}

export function DiagramsPage() {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioDefinition | null>(null)
  const [buildThroughWideChannelsCue, setBuildThroughWideChannelsCue] = useState('Secure build-up')
  const [attackingTransitionCue, setAttackingTransitionCue] = useState('Regain')
  const [defensiveTransitionCue, setDefensiveTransitionCue] = useState('Ball lost')
  const [wingBackAttackCue, setWingBackAttackCue] = useState('Secure base')

  const handleScenarioSelect = (scenario: ScenarioDefinition) => {
    setSelectedScenario(scenario)

    if (scenario.id === 'build-through-wide-channels') {
      setBuildThroughWideChannelsCue('Secure build-up')
    }

    if (scenario.id === 'counter-quickly-on-turnover') {
      setAttackingTransitionCue('Regain')
    }

    if (scenario.id === 'protect-lead-in-back-five') {
      setDefensiveTransitionCue('Ball lost')
    }

    if (scenario.id === 'back-five-to-wing-back-attack') {
      setWingBackAttackCue('Secure base')
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
            <DiagramCardPreview scenario={scenario} />
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
            {selectedScenario.id === 'build-through-wide-channels' ? (
              <div
                className="transition-modal-pitch"
                style={{ display: 'grid', placeItems: 'center', overflow: 'hidden' }}
              >
                <div className="transition-modal-pitch__preview">
                  <PixiPitchPreview
                    width={480}
                    height={741}
                    players={BUILD_THROUGH_WIDE_CHANNELS_PIXI_SCENARIO.players}
                    ballPosition={BUILD_THROUGH_WIDE_CHANNELS_PIXI_SCENARIO.ballPosition}
                    steps={BUILD_THROUGH_WIDE_CHANNELS_PIXI_SCENARIO.steps}
                    routes={BUILD_THROUGH_WIDE_CHANNELS_PIXI_SCENARIO.routes}
                    repeatDelay={1.2}
                    onCueChange={setBuildThroughWideChannelsCue}
                  />
                  <div className="mini-pitch__cue" aria-live="polite">
                    {buildThroughWideChannelsCue}
                  </div>
                  <div className="mini-pitch__caption">
                    {BUILD_THROUGH_WIDE_CHANNELS_PIXI_SCENARIO.caption}
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
            ) : selectedScenario.id === 'counter-quickly-on-turnover' ? (
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
            ) : selectedScenario.id === 'back-five-to-wing-back-attack' ? (
              <div
                className="transition-modal-pitch"
                style={{ display: 'grid', placeItems: 'center', overflow: 'hidden' }}
              >
                <div className="transition-modal-pitch__preview">
                  <PixiPitchPreview
                    width={480}
                    height={741}
                    players={WING_BACK_ATTACK_PIXI_SCENARIO.players}
                    ballPosition={WING_BACK_ATTACK_PIXI_SCENARIO.ballPosition}
                    steps={WING_BACK_ATTACK_PIXI_SCENARIO.steps}
                    routes={WING_BACK_ATTACK_PIXI_SCENARIO.routes}
                    repeatDelay={1.2}
                    onCueChange={setWingBackAttackCue}
                  />
                  <div className="mini-pitch__cue" aria-live="polite">
                    {wingBackAttackCue}
                  </div>
                  <div className="mini-pitch__caption">
                    {WING_BACK_ATTACK_PIXI_SCENARIO.caption}
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
