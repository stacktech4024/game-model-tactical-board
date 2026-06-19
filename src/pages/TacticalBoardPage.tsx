import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TimelineScrubber } from '../editor/TimelineScrubber'
import { VideoReferencePanel } from '../editor/VideoReferencePanel'
import { FORMATION_LABELS } from '../data/formations'
import { SCENARIOS } from '../data/scenarios'
import type { ScenarioFormationMode } from '../domain/scenarios/scenarioTypes'
import type { AnimatorState, ScenarioAnimator } from '../renderers/pixi/animation/scenarioAnimator'
import { PixiCanvas } from '../renderers/pixi/PixiCanvas'
import './TacticalBoardPage.css'

const FORMATION_OPTIONS: ScenarioFormationMode[] = [
  'attacking-442',
  'defensive-4231',
  'attacking-433',
  'defensive-532',
  'attacking-352',
]

type TacticalBoardPageProps = {
  initialScenarioId?: string
  embedded?: boolean
}

function TacticalBoardPage({ initialScenarioId, embedded = false }: TacticalBoardPageProps) {
  const [pitchSize, setPitchSize] = useState({
    width: 900,
    height: 700,
  })
  const [selectedFormation, setSelectedFormation] = useState<ScenarioFormationMode>('attacking-442')
  const [debugMode, setDebugMode] = useState(false)
  const [showAnnotations, setShowAnnotations] = useState(true)
  const [showArrows, setShowArrows] = useState(true)
  const [showMarkers, setShowMarkers] = useState(true)
  const [showOpposition, setShowOpposition] = useState(true)
  const [showBall, setShowBall] = useState(true)
  const [playState, setPlayState] = useState<AnimatorState>('idle')
  const [selectedScenarioId, setSelectedScenarioId] = useState(
    initialScenarioId && SCENARIOS.some((scenario) => scenario.id === initialScenarioId)
      ? initialScenarioId
      : SCENARIOS[0].id,
  )
  const pitchHostRef = useRef<HTMLDivElement | null>(null)
  const animatorRef = useRef<ScenarioAnimator | null>(null)

  const selectedScenario = useMemo(() => {
    return SCENARIOS.find((scenario) => scenario.id === selectedScenarioId) ?? SCENARIOS[0]
  }, [selectedScenarioId])

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
    animatorRef.current?.reset()
    setPlayState('idle')
  }

  const handleAnimatorReady = useCallback((animator: ScenarioAnimator) => {
    animatorRef.current = animator
    setPlayState('idle')
  }, [])

  const handleAnimatorStateChange = useCallback((state: AnimatorState) => {
    setPlayState(state)
  }, [])

  const handleScrubberPause = useCallback(() => {
    setPlayState('paused')
  }, [])

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
    setPlayState('idle')
  }

  const currentFormationLabel = FORMATION_LABELS[selectedFormation]

  return (
    <main className={embedded ? 'app-shell app-shell--embedded' : 'app-shell'}>
      {!embedded && (
        <header className="app-header">
        <div>
          <p className="eyebrow">Canada Soccer Game Model</p>
          <h1>Pickering FC static pitch explorer</h1>
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
        <aside className="scenario-panel">
          <h2>Scenarios</h2>
          <div className="scenario-list">
            {SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                className={scenario.id === selectedScenario.id ? 'scenario-card is-active' : 'scenario-card'}
                onClick={() => handleScenarioSelect(scenario.id)}
              >
                <span className="scenario-card__title">{scenario.title}</span>
                <span className="scenario-card__meta">{scenario.moment}</span>
              </button>
            ))}
          </div>

          <div className="info-panel">
            <h2>{selectedScenario.title}</h2>
            <p className="info-panel__meta">{selectedScenario.moment}</p>
            <p className="info-panel__meta">Zone focus: {selectedScenario.zoneFocus}</p>
            <p className="info-panel__description">{selectedScenario.description}</p>
            <div className="info-panel__section">
              <h3>Coaching points</h3>
              <ul>
                {selectedScenario.coachingPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
            <p className="info-panel__meta">Current formation: {currentFormationLabel}</p>
          </div>

          <VideoReferencePanel />
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
              showAnnotations={showAnnotations}
              showArrows={showArrows}
              showMarkers={showMarkers}
              showOpposition={showOpposition}
              showBall={showBall}
              onAnimatorReady={handleAnimatorReady}
              onStateChange={handleAnimatorStateChange}
            />
          </div>
          <TimelineScrubber
            key={selectedScenario.id}
            animatorRef={animatorRef}
            playState={playState}
            onPause={handleScrubberPause}
          />
        </section>
      </section>
    </main>
  )
}

export default TacticalBoardPage
