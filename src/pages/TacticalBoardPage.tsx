import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TimelineScrubber } from '../editor/TimelineScrubber'
import { VideoReferencePanel } from '../editor/VideoReferencePanel'
import { FORMATION_LABELS, FORMATION_POSITIONS, OPPOSITION_POSITIONS } from '../data/formations'
import { SCENARIOS } from '../data/scenarios'
import type { ScenarioFormationMode } from '../domain/scenarios/scenarioTypes'
import { buildScenarioPlan, getPhaseStepIndexAtProgress } from '../domain/simulation/scenarioPlan'
import type { AnimatorState, ScenarioAnimator } from '../renderers/pixi/animation/scenarioAnimator'
import { PixiCanvas } from '../renderers/pixi/PixiCanvas'
import './TacticalBoardPage.css'

const FORMATION_OPTIONS: ScenarioFormationMode[] = [
  'attacking-442',
  'attacking-corner',
  'defensive-4231',
  'attacking-433',
  'defensive-532',
  'attacking-352',
]

const ROUTE_LEGEND = [
  { label: 'Pass', className: 'is-pass' },
  { label: 'Run', className: 'is-run' },
  { label: 'Dribble', className: 'is-dribble' },
  { label: 'Press', className: 'is-press' },
  { label: 'Recovery', className: 'is-recovery' },
  { label: 'Shot', className: 'is-shot' },
  { label: 'Cross', className: 'is-cross' },
  { label: 'Header', className: 'is-header' },
]

type TacticalBoardPageProps = {
  initialScenarioId?: string
  embedded?: boolean
}

function TacticalBoardPage({ initialScenarioId, embedded = false }: TacticalBoardPageProps) {
  const [searchParams] = useSearchParams()
  const linkedScenarioId = searchParams.get('scenario') ?? initialScenarioId
  const linkedStepId = searchParams.get('step')
  const initialScenario = SCENARIOS.find((scenario) => scenario.id === linkedScenarioId) ?? SCENARIOS[0]
  const initialStepIndex = Math.max(
    0,
    initialScenario.phaseSteps.findIndex((step) => step.id === linkedStepId),
  )
  const [pitchSize, setPitchSize] = useState({ width: 900, height: 700 })
  const [selectedFormation, setSelectedFormation] = useState<ScenarioFormationMode>(initialScenario.formationMode)
  const [debugMode, setDebugMode] = useState(false)
  const [showAnnotations, setShowAnnotations] = useState(true)
  const [showArrows, setShowArrows] = useState(false)
  const showAllRoutes = false
  const [showMarkers, setShowMarkers] = useState(false)
  const [showOpposition, setShowOpposition] = useState(true)
  const [showBall, setShowBall] = useState(true)
  const [playState, setPlayState] = useState<AnimatorState>('idle')
  const [activePhaseStepIndex, setActivePhaseStepIndex] = useState(initialStepIndex)
  const [scrubberRevision, setScrubberRevision] = useState(0)
  const [selectedScenarioId, setSelectedScenarioId] = useState(initialScenario.id)
  const pitchHostRef = useRef<HTMLDivElement | null>(null)
  const animatorRef = useRef<ScenarioAnimator | null>(null)
  const activePhaseStepIndexRef = useRef(activePhaseStepIndex)
  const playStateRef = useRef(playState)

  const selectedScenario = useMemo(() => {
    return SCENARIOS.find((scenario) => scenario.id === selectedScenarioId) ?? SCENARIOS[0]
  }, [selectedScenarioId])

  const activePhaseStep =
    selectedScenario.phaseSteps[activePhaseStepIndex] ?? selectedScenario.phaseSteps[0]
  const scenarioPlan = useMemo(() => buildScenarioPlan(
    selectedScenario,
    FORMATION_POSITIONS[selectedFormation],
    OPPOSITION_POSITIONS[selectedFormation],
  ), [selectedFormation, selectedScenario])

  useEffect(() => {
    activePhaseStepIndexRef.current = activePhaseStepIndex
    playStateRef.current = playState
  }, [activePhaseStepIndex, playState, selectedScenario])

  useEffect(() => {
    const host = pitchHostRef.current

    if (!host) {
      return undefined
    }

    const updateSize = () => {
      const { width, height } = host.getBoundingClientRect()

      setPitchSize({
        width: Math.max(1, Math.round(width)),
        height: Math.max(1, Math.round(height)),
      })
    }

    updateSize()

    const resizeObserver = new ResizeObserver(() => {
      updateSize()
    })

    resizeObserver.observe(host)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const handleFormationSelect = (formation: ScenarioFormationMode) => {
    setSelectedFormation(formation)
  }

  const handleScenarioSelect = (scenarioId: string) => {
    const scenario = SCENARIOS.find((item) => item.id === scenarioId) ?? SCENARIOS[0]

    setSelectedScenarioId(scenario.id)
    setSelectedFormation(scenario.formationMode)
    setActivePhaseStepIndex(0)
    animatorRef.current?.reset()
    setPlayState('idle')
  }

  const handleAnimatorReady = useCallback((animator: ScenarioAnimator) => {
    animatorRef.current = animator
    const progress = scenarioPlan.phaseSteps[activePhaseStepIndexRef.current]?.timing.startProgress ?? 0

    animator.setProgress(progress)

    if (playStateRef.current === 'playing') {
      animator.play()
      return
    }

    setPlayState(progress === 0 ? 'idle' : 'paused')
  }, [scenarioPlan.phaseSteps])

  const handleAnimatorStateChange = useCallback((state: AnimatorState) => {
    setPlayState(state)
  }, [])

  const handleScrubberPause = useCallback(() => {
    setPlayState('paused')
  }, [])

  const getPhaseIndexForProgress = useCallback(
    (progress: number) => {
      return getPhaseStepIndexAtProgress(scenarioPlan, progress)
    },
    [scenarioPlan],
  )

  const handleTimelineProgressChange = useCallback(
    (progress: number) => {
      setActivePhaseStepIndex(getPhaseIndexForProgress(progress))
    },
    [getPhaseIndexForProgress],
  )

  const handlePlay = () => {
    animatorRef.current?.play()
    setPlayState('playing')
  }

  const handlePause = () => {
    animatorRef.current?.pause()
    setPlayState('paused')
  }

  const handleReset = () => {
    animatorRef.current?.reset()
    setActivePhaseStepIndex(0)
    setScrubberRevision((revision) => revision + 1)
    setPlayState('idle')
  }

  const handlePhaseStepChange = (nextIndex: number) => {
    const clampedIndex = Math.min(
      Math.max(nextIndex, 0),
      Math.max(selectedScenario.phaseSteps.length - 1, 0),
    )
    const progress = scenarioPlan.phaseSteps[clampedIndex]?.timing.startProgress ?? 0

    setActivePhaseStepIndex(clampedIndex)
    setScrubberRevision((revision) => revision + 1)
    animatorRef.current?.pause()
    animatorRef.current?.setProgress(progress)
    setPlayState(clampedIndex === 0 ? 'idle' : 'paused')
  }

  const currentFormationLabel = FORMATION_LABELS[selectedFormation]

  return (
    <main className={embedded ? 'app-shell app-shell--embedded' : 'app-shell'}>
      {!embedded && (
        <header className="app-header">
        <div>
          <p className="eyebrow">Canada Soccer Game Model</p>
          <h1>Pickering FC tactical board</h1>
        </div>

        <div className="formation-controls" role="group" aria-label="Formation controls">
          {FORMATION_OPTIONS.map((formation) => (
            <button
              key={formation}
              type="button"
              className={selectedFormation === formation ? 'control-button is-active' : 'control-button'}
              onClick={() => handleFormationSelect(formation)}
            >
              {FORMATION_LABELS[formation]}
            </button>
          ))}
          <label className="debug-toggle">
            <input
              type="checkbox"
              checked={debugMode}
              onChange={(event) => setDebugMode(event.target.checked)}
            />
            <span>Debug overlay</span>
          </label>
          <div className="layer-controls" role="group" aria-label="Layer controls">
            <span className="layer-controls__label">Layers</span>
            <label className="layer-toggle">
              <input
                type="checkbox"
                checked={showAnnotations}
                onChange={(event) => setShowAnnotations(event.target.checked)}
              />
              <span>Highlights</span>
            </label>
            <label className="layer-toggle">
              <input
                type="checkbox"
                checked={showArrows}
                onChange={(event) => setShowArrows(event.target.checked)}
              />
              <span>Arrows</span>
            </label>
            <label className="layer-toggle">
              <input
                type="checkbox"
                checked={showMarkers}
                onChange={(event) => setShowMarkers(event.target.checked)}
              />
              <span>Markers</span>
            </label>
            <label className="layer-toggle">
              <input
                type="checkbox"
                checked={showOpposition}
                onChange={(event) => setShowOpposition(event.target.checked)}
              />
              <span>Opposition</span>
            </label>
            <label className="layer-toggle">
              <input
                type="checkbox"
                checked={showBall}
                onChange={(event) => setShowBall(event.target.checked)}
              />
              <span>Ball</span>
            </label>
          </div>
          <div className="playback-controls" role="group" aria-label="Playback controls">
            <span className="playback-controls__label">Playback: {playState}</span>
            <button
              type="button"
              className="control-button"
              disabled={playState === 'playing'}
              onClick={handlePlay}
            >
              Play
            </button>
            <button
              type="button"
              className="control-button"
              disabled={playState === 'idle' || playState === 'complete'}
              onClick={handlePause}
            >
              Pause
            </button>
            <button type="button" className="control-button" onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>
      </header>
      )}

      <section className="app-grid">
        {embedded && (
          <div className="embedded-board-controls">
            <label className="scenario-select-control">
              <span>Scenario</span>
              <select
                value={selectedScenario.id}
                onChange={(event) => handleScenarioSelect(event.target.value)}
              >
                {SCENARIOS.map((scenario) => (
                  <option key={scenario.id} value={scenario.id}>
                    {scenario.title}
                  </option>
                ))}
              </select>
            </label>
            <div className="playback-controls" role="group" aria-label="Playback controls">
              <span className="playback-controls__label">{playState}</span>
              <button
                type="button"
                className="control-button"
                disabled={playState === 'playing'}
                onClick={handlePlay}
              >
                Play
              </button>
              <button
                type="button"
                className="control-button"
                disabled={playState === 'idle' || playState === 'complete'}
                onClick={handlePause}
              >
                Pause
              </button>
              <button type="button" className="control-button" onClick={handleReset}>
                Reset
              </button>
            </div>
            <div className="phase-controls phase-controls--primary" role="group" aria-label="Phase step controls">
              <button
                type="button"
                className="control-button"
                disabled={activePhaseStepIndex === 0}
                onClick={() => handlePhaseStepChange(activePhaseStepIndex - 1)}
              >
                ← Previous
              </button>
              <span>{activePhaseStepIndex + 1}/{selectedScenario.phaseSteps.length}</span>
              <button
                type="button"
                className="control-button"
                disabled={activePhaseStepIndex >= selectedScenario.phaseSteps.length - 1}
                onClick={() => handlePhaseStepChange(activePhaseStepIndex + 1)}
              >
                Next →
              </button>
            </div>
            <div className="display-controls" role="group" aria-label="Display controls">
              <label className="layer-toggle">
                <input
                  type="checkbox"
                  checked={showArrows}
                  onChange={(event) => setShowArrows(event.target.checked)}
                />
                <span>Show movement routes</span>
              </label>
              <label className="layer-toggle">
                <input
                  type="checkbox"
                  checked={showMarkers}
                  onChange={(event) => setShowMarkers(event.target.checked)}
                />
                <span>Show markers</span>
              </label>
            </div>
          </div>
        )}
        <aside className="scenario-panel">
          {!embedded && (
            <>
              <h2>Scenarios</h2>
              <div className="scenario-list">
                {SCENARIOS.map((scenario) => (
                  <button
                    key={scenario.id}
                    type="button"
                    aria-pressed={scenario.id === selectedScenario.id}
                    className={scenario.id === selectedScenario.id ? 'scenario-card is-active' : 'scenario-card'}
                    onClick={() => handleScenarioSelect(scenario.id)}
                  >
                    <span className="scenario-card__title">{scenario.title}</span>
                    <span className="scenario-card__meta">{scenario.momentOfGame}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="info-panel">
            <p className="info-panel__eyebrow">What to notice</p>
            <h2>{selectedScenario.title}</h2>
            <div className="scenario-facts">
              <span>{selectedScenario.momentOfGame}</span>
              <span>{selectedScenario.system.shape}</span>
              {selectedScenario.setPieceType && <span>{selectedScenario.setPieceType}</span>}
            </div>
            <p className="info-panel__objective">{selectedScenario.strategy}</p>
            {activePhaseStep && (
              <div className="phase-panel">
                <div className="phase-panel__header">
                  <h3>Active phase step</h3>
                  <span>
                    {activePhaseStepIndex + 1}/{selectedScenario.phaseSteps.length}
                  </span>
                </div>
                <strong>{activePhaseStep.label}</strong>
                <p>{activePhaseStep.coachingCue}</p>
                <p className="info-panel__meta">
                  Key players: {activePhaseStep.keyPlayers.map((player) => `#${player}`).join(', ')}
                </p>
                <p className="info-panel__meta">
                  Zone {activePhaseStep.zoneFocus.join('/')} · Channel {activePhaseStep.channelFocus.join('/')}
                </p>
                {!embedded && <div className="phase-controls" role="group" aria-label="Phase step controls">
                  <button
                    type="button"
                    className="control-button"
                    disabled={activePhaseStepIndex === 0}
                    onClick={() => handlePhaseStepChange(activePhaseStepIndex - 1)}
                  >
                    Previous step
                  </button>
                  <button
                    type="button"
                    className="control-button"
                    disabled={activePhaseStepIndex >= selectedScenario.phaseSteps.length - 1}
                    onClick={() => handlePhaseStepChange(activePhaseStepIndex + 1)}
                  >
                    Next step
                  </button>
                </div>}
              </div>
            )}
            {showArrows && <div className="route-legend" aria-label="Movement route legend">
              {ROUTE_LEGEND.map((item) => (
                <span key={item.label}>
                  <i className={item.className} aria-hidden="true" />
                  {item.label}
                </span>
              ))}
            </div>}
            <details className="scenario-context">
              <summary>Scenario context</summary>
              <p>{selectedScenario.description}</p>
              <p>{selectedScenario.fieldGeography.description}</p>
              <p>Formation: {currentFormationLabel}</p>
            </details>
          </div>

          {!embedded && <VideoReferencePanel />}
        </aside>

        <section className="pitch-panel" aria-label="Pitch visualization">
          <div ref={pitchHostRef} className="pitch-canvas-host">
            <PixiCanvas
              width={pitchSize.width}
              height={pitchSize.height}
              debugMode={debugMode}
              selectedFormation={selectedFormation}
              selectedScenario={selectedScenario}
              selectedBallStart={selectedScenario.ballStart}
              selectedAnnotations={selectedScenario.annotations}
              selectedArrows={selectedScenario.arrows}
              selectedMarkers={selectedScenario.markers}
              activePhaseStep={activePhaseStep}
              showAnnotations={showAnnotations}
              showArrows={showArrows}
              showAllRoutes={showAllRoutes}
              showMarkers={showMarkers}
              showOpposition={showOpposition}
              showBall={showBall}
              onAnimatorReady={handleAnimatorReady}
              onStateChange={handleAnimatorStateChange}
            />
          </div>
          <TimelineScrubber
            key={`${selectedScenario.id}:${scrubberRevision}`}
            animatorRef={animatorRef}
            playState={playState}
            initialProgress={scenarioPlan.phaseSteps[activePhaseStepIndex]?.timing.startProgress ?? 0}
            onPause={handleScrubberPause}
            onProgressChange={handleTimelineProgressChange}
          />
        </section>
      </section>
    </main>
  )
}

export default TacticalBoardPage
