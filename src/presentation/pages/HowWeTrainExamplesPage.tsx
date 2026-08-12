import { useRef } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PresentationLayout } from '../PresentationLayout'
import {
  HOW_WE_TRAIN_DEFAULT_EXAMPLE_ID,
  HOW_WE_TRAIN_EXAMPLES,
  type HowWeTrainExampleId,
  type SessionDetail,
} from '../data/howWeTrainPageData'

const DESIGN_LABELS: { key: keyof (typeof HOW_WE_TRAIN_EXAMPLES)[number]['design']; label: string }[] = [
  { key: 'pitch', label: 'Area' },
  { key: 'parameters', label: 'Time & load' },
  { key: 'players', label: 'Format' },
  { key: 'learningIntention', label: 'Objective' },
  { key: 'organization', label: 'Restarts & scoring' },
]

const DEMAND_LABELS: { key: keyof (typeof HOW_WE_TRAIN_EXAMPLES)[number]['demands']; label: string }[] = [
  { key: 'reward', label: 'Reward' },
  { key: 'relate', label: 'Game cue' },
  { key: 'restrict', label: 'Constraint' },
]

function DetailRow({ label, detail }: { label: string; detail: SessionDetail }) {
  return (
    <div className="how-we-train-detail-row">
      <dt>{label}</dt><dd>{detail.value}</dd>
    </div>
  )
}

export function HowWeTrainExamplesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedId = searchParams.get('example') as HowWeTrainExampleId | null
  const activeExample = HOW_WE_TRAIN_EXAMPLES.find((item) => item.id === requestedId)
    ?? HOW_WE_TRAIN_EXAMPLES.find((item) => item.id === HOW_WE_TRAIN_DEFAULT_EXAMPLE_ID)
    ?? HOW_WE_TRAIN_EXAMPLES[0]
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
    <PresentationLayout pageId="how-we-train-session" noPadding>
      <header className="how-we-train-detail-header how-we-train-detail-header--session">
        <div>
          <Link to="/presentation/how-we-train">← How We Train overview</Link>
          <p className="presentation-eyebrow">Session design · Page 1 of 3</p>
          <h1 className="presentation-title">{activeExample.title}</h1>
          <p className="presentation-body">{activeExample.shortPurpose}</p>
        </div>
      </header>

      <div className="how-we-train-tabs" role="tablist" aria-label="Training session examples">
        {HOW_WE_TRAIN_EXAMPLES.map((example, index) => (
          <button
            key={example.id}
            ref={(element) => { tabRefs.current[index] = element }}
            id={`how-we-train-tab-${example.id}`}
            type="button"
            role="tab"
            aria-selected={example.id === activeExample.id}
            aria-controls={`how-we-train-panel-${example.id}`}
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
        id={`how-we-train-panel-${activeExample.id}`}
        className="how-we-train-panel how-we-train-detail-panel"
        role="tabpanel"
        aria-labelledby={`how-we-train-tab-${activeExample.id}`}
        tabIndex={0}
      >
        <div className="how-we-train-session-summary" aria-label="Selected session summary">
          <div><span>Moment</span><strong>{activeExample.moments.join(' + ')}</strong></div>
          <div><span>Session plan</span><strong>{activeExample.sessionSource}</strong></div>
          <div><span>Key units</span><strong>{activeExample.primaryPlayers.join(' · ')}</strong></div>
          <div><span>Method</span><strong>{activeExample.methodology}</strong></div>
        </div>

        <div className="how-we-train-session-design">
          <section className="how-we-train-activity-detail" aria-label={`${activeExample.title} activity design`}>
            <div className="how-we-train-activity-heading">
              <div><span>{activeExample.system} · {activeExample.methodology}</span><h2>SESSION BLUEPRINT</h2></div>
              <p>Set the game up clearly, reward the target behaviour, and let players solve the football problem.</p>
            </div>
            <dl className="how-we-train-hierarchy" aria-label="System strategy tactics and skill set">
              <div><dt>Game structure</dt><dd>{activeExample.system}</dd></div>
              <div><dt>Strategy</dt><dd>{activeExample.strategy}</dd></div>
              <div><dt>Team actions</dt><dd>{activeExample.tactics.join(' · ')}</dd></div>
              <div><dt>Player actions</dt><dd>{activeExample.skillSet.join(' · ')}</dd></div>
            </dl>
            <div className="how-we-train-environment">
              <section><h3>DESIGN</h3><dl>{DESIGN_LABELS.map(({ key, label }) => <DetailRow key={key} label={label} detail={activeExample.design[key]} />)}</dl></section>
              <section><h3>DEMANDS</h3><dl>{DEMAND_LABELS.map(({ key, label }) => <DetailRow key={key} label={label} detail={activeExample.demands[key]} />)}</dl></section>
            </div>
            <Link className="how-we-train-continue" to={`/presentation/how-we-train-pictures?example=${activeExample.id}`}>
              Continue to game pictures <span aria-hidden="true">→</span>
            </Link>
          </section>
        </div>
      </main>
    </PresentationLayout>
  )
}
