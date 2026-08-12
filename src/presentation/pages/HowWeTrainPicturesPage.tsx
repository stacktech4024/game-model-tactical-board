import { useMemo, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PITCH } from '../../domain/pitch/pitchConstants'
import { PixiPitchPreview } from '../../renderers/pixi/PixiPitchPreview'
import { PresentationLayout } from '../PresentationLayout'
import {
  HOW_WE_TRAIN_DEFAULT_EXAMPLE_ID,
  HOW_WE_TRAIN_EXAMPLES,
  splitHowWeTrainVisualScenario,
  type HowWeTrainExampleId,
  type HowWeTrainVisualScenario,
} from '../data/howWeTrainPageData'

const PREVIEW_WIDTH = 360
const PREVIEW_HEIGHT = Math.round(PREVIEW_WIDTH * (PITCH.LENGTH / PITCH.WIDTH))

const PHASE_COPY: Record<HowWeTrainExampleId, [{ title: string; detail: string }, { title: string; detail: string }]> = {
  'central-wide': [
    { title: 'Build central pressure', detail: 'Circulate, scan, and draw the opposition midfield toward the ball.' },
    { title: 'Release and defend wide', detail: 'Attack Channel 1 as grey defenders recover, cover inside, and protect depth.' },
  ],
  'wide-pressure': [
    { title: 'Set the pressing picture', detail: 'Identify the wide trigger and connect the first, second, and third defenders.' },
    { title: 'Force and contain', detail: 'Remove the inside pass, direct play outside, and defend the next action together.' },
  ],
  'press-regain': [
    { title: 'Coordinate the press', detail: 'The front line closes with midfield protection while grey players seek an exit.' },
    { title: 'Regain and transition', detail: 'Red selects counter or retain while grey immediately counterpresses and recovers.' },
  ],
  'line-break-react': [
    { title: 'Create and break the line', detail: 'Red movement creates the lane while grey screens, tracks, and protects depth.' },
    { title: 'Turnover and react', detail: 'Possession changes: red presses and covers while grey opens to escape pressure.' },
  ],
}

function TrainingPhaseCard({
  exampleId,
  index,
  phase,
}: {
  exampleId: HowWeTrainExampleId
  index: 0 | 1
  phase: HowWeTrainVisualScenario
}) {
  const [activeCue, setActiveCue] = useState(phase.steps[0]?.cue ?? '')
  const copy = PHASE_COPY[exampleId][index]

  return (
    <article className="how-we-train-phase-card">
      <header><b>DIAGRAM {index + 1}</b><h3>{copy.title}</h3><p>{copy.detail}</p></header>
      <div className="how-we-train-pitch-card">
        <div className="how-we-train-pitch-direction" aria-label="Red attacks toward Zone 4 and defends toward Zone 1">
          <span><b aria-hidden="true">↑</b> Red attacks · Zone 4</span>
          <span>Red defends · Zone 1 <b aria-hidden="true">↓</b></span>
        </div>
        <PixiPitchPreview
          width={PREVIEW_WIDTH}
          height={PREVIEW_HEIGHT}
          players={phase.players}
          ballPosition={phase.ballPosition}
          steps={phase.steps}
          routes={phase.routes}
          repeatDelay={1.25}
          tokenScale={0.86}
          fadeRouteHistory
          onCueChange={setActiveCue}
        />
        <div className="mini-pitch__cue" aria-live="polite">{activeCue}</div>
      </div>
    </article>
  )
}

export function HowWeTrainPicturesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedId = searchParams.get('example') as HowWeTrainExampleId | null
  const activeExample = HOW_WE_TRAIN_EXAMPLES.find((item) => item.id === requestedId)
    ?? HOW_WE_TRAIN_EXAMPLES.find((item) => item.id === HOW_WE_TRAIN_DEFAULT_EXAMPLE_ID)
    ?? HOW_WE_TRAIN_EXAMPLES[0]
  const visualPhases = useMemo(() => splitHowWeTrainVisualScenario(activeExample.visualScenario), [activeExample])
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const selectExample = (exampleId: HowWeTrainExampleId) => {
    setSearchParams({ example: exampleId })
  }

  const handleTabKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % HOW_WE_TRAIN_EXAMPLES.length
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + HOW_WE_TRAIN_EXAMPLES.length) % HOW_WE_TRAIN_EXAMPLES.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = HOW_WE_TRAIN_EXAMPLES.length - 1
    if (nextIndex === null) return
    event.preventDefault()
    selectExample(HOW_WE_TRAIN_EXAMPLES[nextIndex].id)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <PresentationLayout pageId="how-we-train-pictures" noPadding>
      <header className="how-we-train-detail-header">
        <div>
          <Link to={`/presentation/how-we-train-session?example=${activeExample.id}`}>← Session design</Link>
          <p className="presentation-eyebrow">Game pictures · Page 2 of 3</p>
          <h1 className="presentation-title">{activeExample.title}</h1>
          <p className="presentation-body">Read both teams across two connected diagrams. The second picture begins from the first picture’s final positions and orientations.</p>
        </div>
        <div className="how-we-train-team-key" aria-label="Team colour and pitch direction key">
          <span><i className="how-we-train-team-dot is-red" />Red — coached outfield</span>
          <span><i className="how-we-train-team-dot is-grey" />Grey — opposition outfield</span>
          <span><i className="how-we-train-team-dot is-yellow" />Yellow #1 — coached GK</span>
          <span><i className="how-we-train-team-dot is-cyan" />Cyan #1 — opposition GK</span>
          <strong>↑ RED ATTACKS ZONE 4 · RED DEFENDS ZONE 1 ↓</strong>
          <small>Numbers show roles · token direction shows body orientation</small>
        </div>
      </header>

      <div className="how-we-train-tabs" role="tablist" aria-label="Training game-picture examples">
        {HOW_WE_TRAIN_EXAMPLES.map((example, index) => (
          <button
            key={example.id}
            ref={(element) => { tabRefs.current[index] = element }}
            id={`how-we-train-pictures-tab-${example.id}`}
            type="button"
            role="tab"
            aria-selected={example.id === activeExample.id}
            aria-controls={`how-we-train-pictures-panel-${example.id}`}
            tabIndex={example.id === activeExample.id ? 0 : -1}
            className={example.id === activeExample.id ? 'how-we-train-tab is-active' : 'how-we-train-tab'}
            onClick={() => selectExample(example.id)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
          >
            <span>{index + 1}</span>{example.tabLabel}
          </button>
        ))}
      </div>

      <main
        id={`how-we-train-pictures-panel-${activeExample.id}`}
        className="how-we-train-panel how-we-train-detail-panel how-we-train-pictures-page"
        role="tabpanel"
        aria-labelledby={`how-we-train-pictures-tab-${activeExample.id}`}
        tabIndex={0}
      >
        <section className="how-we-train-diagram-section" aria-labelledby="training-diagrams-title">
          <header>
            <span>GAME-REALISTIC PICTURES</span>
            <h2 id="training-diagrams-title">See the problem, then see the response</h2>
            <p>Each animation keeps the ball, both teams, and player orientation connected.</p>
          </header>
          <div className="how-we-train-diagrams">
            <TrainingPhaseCard key={`${activeExample.id}-0`} exampleId={activeExample.id} index={0} phase={visualPhases[0]} />
            <TrainingPhaseCard key={`${activeExample.id}-1`} exampleId={activeExample.id} index={1} phase={visualPhases[1]} />
          </div>
          <p className="how-we-train-diagram-caption">{activeExample.visualScenario.caption}</p>
          <Link className="how-we-train-continue" to={`/presentation/how-we-train-transfer?example=${activeExample.id}`}>
            Continue to match transfer <span aria-hidden="true">→</span>
          </Link>
        </section>
      </main>
    </PresentationLayout>
  )
}
