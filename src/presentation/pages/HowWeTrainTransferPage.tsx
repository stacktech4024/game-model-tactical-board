import { useRef } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PresentationLayout } from '../PresentationLayout'
import {
  HOW_WE_TRAIN_DEFAULT_EXAMPLE_ID,
  HOW_WE_TRAIN_EXAMPLES,
  type HowWeTrainExampleId,
} from '../data/howWeTrainPageData'

export function HowWeTrainTransferPage() {
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
    <PresentationLayout pageId="how-we-train-transfer" noPadding>
      <header className="how-we-train-detail-header how-we-train-transfer-header">
        <div>
          <Link to={`/presentation/how-we-train-pictures?example=${activeExample.id}`}>← Game pictures</Link>
          <p className="presentation-eyebrow">Session to match transfer · Page 3 of 3</p>
          <h1 className="presentation-title">{activeExample.title}</h1>
          <p className="presentation-body">
            Follow one concise line from the Game Model requirement to the behaviour we expect in the match.
          </p>
        </div>
        <aside className="how-we-train-transfer-summary" aria-label="Selected training example summary">
          <div><span>Moment</span><strong>{activeExample.moments.join(' + ')}</strong></div>
          <div><span>Session</span><strong>{activeExample.sessionSource}</strong></div>
          <div><span>Primary roles</span><strong>{activeExample.primaryPlayers.join(' · ')}</strong></div>
        </aside>
      </header>

      <div className="how-we-train-tabs" role="tablist" aria-label="Training transfer examples">
        {HOW_WE_TRAIN_EXAMPLES.map((example, index) => (
          <button
            key={example.id}
            ref={(element) => { tabRefs.current[index] = element }}
            id={`how-we-train-transfer-tab-${example.id}`}
            type="button"
            role="tab"
            aria-selected={example.id === activeExample.id}
            aria-controls={`how-we-train-transfer-panel-${example.id}`}
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
        id={`how-we-train-transfer-panel-${activeExample.id}`}
        className="how-we-train-panel how-we-train-transfer-page"
        role="tabpanel"
        aria-labelledby={`how-we-train-transfer-tab-${activeExample.id}`}
        tabIndex={0}
      >
        <section className="how-we-train-transfer how-we-train-transfer--page" aria-label="Game Model to match transfer chain">
          <header>
            <span>How do we want to play? → How do we coach?</span>
            <h2>GAME MODEL → TRAINING → TRANSFER</h2>
            <p>Each stage answers one question. Read left to right, then use the match outcome as the test.</p>
          </header>
          <ol className="how-we-train-chain how-we-train-chain--page">
            <li><b>1</b><div><span>GAME MODEL PRINCIPLE</span><p>{activeExample.gameModelPrinciple.join(' · ')}</p></div></li>
            <li><b>2</b><div><span>POSITIONAL REQUIREMENT</span><p>{activeExample.positionalRequirement.join(' · ')}</p></div></li>
            <li><b>3</b><div><span>TRAINING DESIGN</span><p>{activeExample.trainingDesign}</p></div></li>
            <li className="how-we-train-chain__coaching"><b>4</b><div><span>COACHING DETAIL</span><dl>{Object.entries(activeExample.coachingDetail).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div></li>
            <li className="how-we-train-chain__transfer"><b>5</b><div><span>MATCH TRANSFER</span><p>{activeExample.matchTransfer.map((step, index) => <span key={step}>{index > 0 && <i>→</i>}{step}</span>)}</p></div></li>
          </ol>

          <div className="how-we-train-transfer-outcomes">
            {activeExample.decisionFramework && (
              <div className="how-we-train-decision" aria-label="Canada Soccer player decision-making framework">
                {activeExample.decisionFramework.map((item) => <div key={item.phase}><strong>{item.phase}</strong><span>{item.detail}</span></div>)}
              </div>
            )}
            <div className="how-we-train-success"><span>SUCCESS INDICATOR / MATCH-TRANSFER OUTCOME</span><p>{activeExample.successIndicator}</p></div>
          </div>
        </section>

        <footer className="how-we-train-transfer-links">
          <Link to={`/presentation/how-we-train-pictures?example=${activeExample.id}`}>← Review the game pictures</Link>
          <Link to={`/presentation/how-we-train-session?example=${activeExample.id}`}>Review the session design</Link>
          <Link to="/presentation/players">Connect positional profiles</Link>
          <Link to="/presentation/skills">Connect skill development</Link>
        </footer>
      </main>
    </PresentationLayout>
  )
}
