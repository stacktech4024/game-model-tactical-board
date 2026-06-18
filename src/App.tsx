import { useEffect, useMemo, useState } from 'react'
import { FORMATION_LABELS } from './data/formations'
import { SCENARIOS } from './data/scenarios'
import type { ScenarioFormationMode } from './domain/scenarios/scenarioTypes'
import { PixiCanvas } from './renderers/pixi/PixiCanvas'
import './App.css'

const FORMATION_OPTIONS: ScenarioFormationMode[] = [
  'attacking-442',
  'defensive-4231',
  'attacking-433',
  'defensive-532',
  'attacking-352',
]

function App() {
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })
  const [selectedFormation, setSelectedFormation] = useState<ScenarioFormationMode>('attacking-442')
  const [debugMode, setDebugMode] = useState(false)
  const [selectedScenarioId, setSelectedScenarioId] = useState(SCENARIOS[0].id)

  const selectedScenario = useMemo(() => {
    return SCENARIOS.find((scenario) => scenario.id === selectedScenarioId) ?? SCENARIOS[0]
  }, [selectedScenarioId])

  useEffect(() => {
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight })
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handleFormationSelect = (formation: ScenarioFormationMode) => {
    setSelectedFormation(formation)
  }

  const handleScenarioSelect = (scenarioId: string) => {
    const scenario = SCENARIOS.find((item) => item.id === scenarioId) ?? SCENARIOS[0]

    setSelectedScenarioId(scenario.id)
    setSelectedFormation(scenario.formationMode)
  }

  const currentFormationLabel = FORMATION_LABELS[selectedFormation]

  return (
    <main className="app-shell">
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
        </div>
      </header>

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
        </aside>

        <section className="pitch-panel" aria-label="Pitch visualization">
          <PixiCanvas
            width={viewport.width}
            height={viewport.height}
            debugMode={debugMode}
            selectedFormation={selectedFormation}
          />
        </section>
      </section>
    </main>
  )
}

export default App
