import { useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { PITCH } from '../../domain/pitch/pitchConstants'
import { PixiPitchPreview } from '../../renderers/pixi/PixiPitchPreview'
import { PresentationLayout } from '../PresentationLayout'
import {
  HOW_WE_TRAIN_DEFAULT_EXAMPLE_ID,
  HOW_WE_TRAIN_EXAMPLES,
  type EvidenceDetail,
  type HowWeTrainExampleId,
} from '../data/howWeTrainPageData'

const PREVIEW_WIDTH = 250
const PREVIEW_HEIGHT = Math.round(PREVIEW_WIDTH * (PITCH.LENGTH / PITCH.WIDTH))

const DESIGN_LABELS: { key: keyof (typeof HOW_WE_TRAIN_EXAMPLES)[number]['design']; label: string }[] = [
  { key: 'pitch', label: 'Pitch' },
  { key: 'parameters', label: 'Parameters' },
  { key: 'players', label: 'Players' },
  { key: 'learningIntention', label: 'Learning intention' },
  { key: 'organization', label: 'Organization' },
]

const DEMAND_LABELS: { key: keyof (typeof HOW_WE_TRAIN_EXAMPLES)[number]['demands']; label: string }[] = [
  { key: 'reward', label: 'Reward' },
  { key: 'relate', label: 'Relate' },
  { key: 'restrict', label: 'Restrict' },
]

function EvidenceRow({ label, detail }: { label: string; detail: EvidenceDetail }) {
  return (
    <div className="how-we-train-evidence-row" data-status={detail.status}>
      <dt>{label}</dt>
      <dd>{detail.value}</dd>
      <small>{detail.status}</small>
    </div>
  )
}

export function HowWeTrainPage() {
  const [activeExampleId, setActiveExampleId] = useState<HowWeTrainExampleId>(
    HOW_WE_TRAIN_DEFAULT_EXAMPLE_ID,
  )
  const activeExample = HOW_WE_TRAIN_EXAMPLES.find((item) => item.id === activeExampleId)
    ?? HOW_WE_TRAIN_EXAMPLES[0]
  const [activeCue, setActiveCue] = useState(activeExample.visualScenario.steps[0]?.cue ?? '')
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const selectExample = (exampleId: HowWeTrainExampleId) => {
    const nextExample = HOW_WE_TRAIN_EXAMPLES.find((item) => item.id === exampleId)
      ?? HOW_WE_TRAIN_EXAMPLES[0]

    setActiveExampleId(nextExample.id)
    setActiveCue(nextExample.visualScenario.steps[0]?.cue ?? '')
  }

  const handleTabKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null

    if (event.key === 'ArrowRight') {
      nextIndex = (index + 1) % HOW_WE_TRAIN_EXAMPLES.length
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (index - 1 + HOW_WE_TRAIN_EXAMPLES.length) % HOW_WE_TRAIN_EXAMPLES.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = HOW_WE_TRAIN_EXAMPLES.length - 1
    }

    if (nextIndex === null) {
      return
    }

    event.preventDefault()
    const nextExample = HOW_WE_TRAIN_EXAMPLES[nextIndex]

    selectExample(nextExample.id)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <PresentationLayout pageId="how-we-train" noPadding>
      <header className="how-we-train-header">
        <div>
          <p className="presentation-eyebrow">How do we coach?</p>
          <h1 className="presentation-title">HOW WE TRAIN OUR GAME MODEL</h1>
          <p className="presentation-body">
            We train the decisions and behaviours required by our Game Model in realistic,
            game-related environments.
          </p>
        </div>
        <div className="how-we-train-framework" aria-label="Canada Soccer development framework">
          <span>WHO ARE WE?</span><i>→</i>
          <span>HOW DO WE WANT TO PLAY?</span><i>→</i>
          <strong>HOW DO WE COACH?</strong><i>→</i>
          <span>FUTURE CANADIAN PLAYERS</span>
        </div>
      </header>

      <div className="how-we-train-tabs" role="tablist" aria-label="Training evidence examples">
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

      <section
        id={`how-we-train-panel-${activeExample.id}`}
        className="how-we-train-panel"
        role="tabpanel"
        aria-labelledby={`how-we-train-tab-${activeExample.id}`}
        tabIndex={0}
      >
        <div className="how-we-train-metadata" aria-label="Selected example metadata">
          <div><span>Moment of the Game</span><strong>{activeExample.moments.join(' + ')}</strong></div>
          <div><span>Zone / Channel</span><strong>{activeExample.geography.join(' · ')}</strong></div>
          <div><span>Primary</span><strong>{activeExample.primaryPlayers.join(' · ')}</strong></div>
          <div><span>Secondary</span><strong>{activeExample.secondaryPlayers.join(' · ')}</strong></div>
          <div><span>Session source</span><strong>{activeExample.sessionSource}</strong></div>
          <div><span>Methodology</span><strong>{activeExample.methodology}</strong><small>{activeExample.methodologyStatus}</small></div>
          <div><span>Evidence status</span><strong>{activeExample.evidenceStrength}</strong></div>
        </div>

        <div className="how-we-train-main">
          <section className="how-we-train-activity" aria-label={`${activeExample.title} activity design`}>
            <div className="how-we-train-pitch-card">
              <PixiPitchPreview
                key={activeExample.id}
                width={PREVIEW_WIDTH}
                height={PREVIEW_HEIGHT}
                players={activeExample.visualScenario.players}
                ballPosition={activeExample.visualScenario.ballPosition}
                steps={activeExample.visualScenario.steps}
                routes={activeExample.visualScenario.routes}
                repeatDelay={1.1}
                tokenScale={0.74}
                fadeRouteHistory
                onCueChange={setActiveCue}
              />
              <div className="mini-pitch__cue" aria-live="polite">{activeCue}</div>
              <div className="mini-pitch__caption">{activeExample.visualScenario.caption}</div>
            </div>

            <div className="how-we-train-activity-detail">
              <div className="how-we-train-activity-heading">
                <span>{activeExample.system} · {activeExample.principles.join(' · ')}</span>
                <h2>{activeExample.title}</h2>
                <p>{activeExample.shortPurpose}</p>
              </div>

              <dl className="how-we-train-hierarchy" aria-label="System strategy tactics and skill set">
                <div><dt>System</dt><dd>{activeExample.system}</dd></div>
                <div><dt>Strategy</dt><dd>{activeExample.strategy}</dd></div>
                <div><dt>Tactics</dt><dd>{activeExample.tactics.join(' · ')}</dd></div>
                <div><dt>Skill Set</dt><dd>{activeExample.skillSet.join(' · ')}</dd></div>
              </dl>

              <div className="how-we-train-environment">
                <section>
                  <h3>DESIGN</h3>
                  <dl>
                    {DESIGN_LABELS.map(({ key, label }) => (
                      <EvidenceRow key={key} label={label} detail={activeExample.design[key]} />
                    ))}
                  </dl>
                </section>
                <section>
                  <h3>DEMANDS</h3>
                  <dl>
                    {DEMAND_LABELS.map(({ key, label }) => (
                      <EvidenceRow key={key} label={label} detail={activeExample.demands[key]} />
                    ))}
                  </dl>
                </section>
              </div>

              <div className="how-we-train-connections">
                <div className="how-we-train-role-chips" aria-label="Related positional profiles">
                  {activeExample.profileReferences.map((profile) => (
                    <span key={profile.profileId}>{profile.label}</span>
                  ))}
                </div>
                <div className="how-we-train-link-row">
                  <Link to="/presentation/players">View Positional Profiles</Link>
                  <Link to="/presentation/skills">Related Skill — {activeExample.relatedSkill}</Link>
                </div>
              </div>
            </div>
          </section>

          <section className="how-we-train-transfer" aria-label="Game Model to match transfer chain">
            <header>
              <span>How do we want to play? → How do we coach?</span>
              <h2>GAME MODEL → TRAINING → TRANSFER</h2>
            </header>

            <ol className="how-we-train-chain">
              <li>
                <b>1</b><div><span>GAME MODEL PRINCIPLE</span><p>{activeExample.gameModelPrinciple.join(' · ')}</p><small>{activeExample.gameModelPrincipleEvidence}</small></div>
              </li>
              <li>
                <b>2</b><div><span>POSITIONAL REQUIREMENT</span><p>{activeExample.positionalRequirement.join(' · ')}</p></div>
              </li>
              <li>
                <b>3</b><div><span>TRAINING DESIGN</span><p>{activeExample.trainingDesign}</p></div>
              </li>
              <li className="how-we-train-chain__coaching">
                <b>4</b>
                <div>
                  <span>COACHING DETAIL</span>
                  <dl>
                    {Object.entries(activeExample.coachingDetail).map(([label, value]) => (
                      <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
                    ))}
                  </dl>
                </div>
              </li>
              <li className="how-we-train-chain__transfer">
                <b>5</b>
                <div>
                  <span>MATCH TRANSFER</span>
                  <p>{activeExample.matchTransfer.map((step, index) => (
                    <span key={step}>{index > 0 && <i>→</i>}{step}</span>
                  ))}</p>
                </div>
              </li>
            </ol>

            {activeExample.decisionFramework && (
              <div className="how-we-train-decision" aria-label="Canada Soccer player decision-making framework">
                {activeExample.decisionFramework.map((item) => (
                  <div key={item.phase}><strong>{item.phase}</strong><span>{item.detail}</span></div>
                ))}
              </div>
            )}

            <div className="how-we-train-success">
              <span>SUCCESS INDICATOR / MATCH-TRANSFER OUTCOME</span>
              <p>{activeExample.successIndicator}</p>
            </div>
          </section>
        </div>
      </section>
    </PresentationLayout>
  )
}
