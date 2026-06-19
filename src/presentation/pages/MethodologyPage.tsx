import { useState } from 'react'
import { PresentationLayout } from '../PresentationLayout'

const TRAINING_STEPS = [
  {
    id: 'whole-start',
    label: 'Whole',
    title: 'Show the game problem',
    detail: 'Players experience the wide-channel build-up moment in context before coaching interrupts the picture.',
    chips: ['Zone 1 start', 'Wide channel target', 'Find #9 centrally'],
  },
  {
    id: 'part',
    label: 'Part',
    title: 'Isolate the relationship',
    detail: 'Fullback, winger, and #6 repeat the timing, support angle, scanning, and crossing/reset decision.',
    chips: ['FB + winger', '#6 underneath', 'Timing cue', 'Decision point'],
  },
  {
    id: 'whole-return',
    label: 'Whole',
    title: 'Return to match pressure',
    detail: 'Add opposition pressure, realistic scoring, restarts, and second-ball support from #8/#10.',
    chips: ['Phase of play', 'Real restarts', 'Opposition pressure', '#8/#10 support'],
  },
]

const MICROCYCLE = [
  { day: 'MD+1', focus: 'Recovery, reflection, video' },
  { day: 'MD+2', focus: 'Unit correction + technical detail' },
  { day: 'MD+3', focus: 'Game moment focus, higher intensity' },
  { day: 'MD-1', focus: 'Activation, team shape, set pieces, lower load' },
  { day: 'Match Day', focus: 'Apply the model' },
]

const TRANSFER_CHECKS = [
  'Did the fullback recognize the overlap cue?',
  'Did the winger create width or drive inside at the right time?',
  'Did #6 support underneath?',
  'Did #9 stay available centrally?',
  'Did the behaviour appear in the next match?',
]

const RISK_ITEMS = [
  'Field/equipment check',
  'Load managed by match day',
  'Intensity adjusted by player readiness',
  'EAP submitted with final package',
]

export function MethodologyPage() {
  const [activeStepId, setActiveStepId] = useState(TRAINING_STEPS[0].id)
  const activeStep = TRAINING_STEPS.find((step) => step.id === activeStepId) ?? TRAINING_STEPS[0]

  return (
    <PresentationLayout pageId="methodology" noPadding>
      <p className="presentation-eyebrow">Section 4 — the reasoning</p>
      <h1 className="presentation-title">Training methodology</h1>
      <p className="presentation-body">
        Whole-Part-Whole: present the game problem in context, isolate the key relationship, then
        return to match pressure with real opposition and scoring.
      </p>

      <section className="method-builder">
        <div className="method-steps" role="tablist" aria-label="Whole part whole training design">
          {TRAINING_STEPS.map((step, index) => (
            <button
              key={step.id}
              type="button"
              role="tab"
              aria-selected={step.id === activeStepId}
              className={step.id === activeStepId ? 'method-step is-active' : 'method-step'}
              onClick={() => setActiveStepId(step.id)}
            >
              <span>{index + 1}</span>
              <strong>{step.label}</strong>
            </button>
          ))}
        </div>

        <section className="method-detail" aria-live="polite">
          <span>{activeStep.label}</span>
          <h2>{activeStep.title}</h2>
          <p>{activeStep.detail}</p>
          <div className="presentation-chip-row">
            {activeStep.chips.map((chip) => (
              <span key={chip} className="presentation-chip presentation-chip--small">
                {chip}
              </span>
            ))}
          </div>
        </section>
      </section>

      <section className="method-lower-grid">
        <div className="microcycle-timeline" aria-label="Microcycle timeline">
          {MICROCYCLE.map((item) => (
            <article key={item.day} className="microcycle-item">
              <span>{item.day}</span>
              <p>{item.focus}</p>
            </article>
          ))}
        </div>

        <div className="method-check-card">
          <h2>Did it transfer?</h2>
          <ul>
            {TRANSFER_CHECKS.map((check) => (
              <li key={check}>{check}</li>
            ))}
          </ul>
        </div>

        <div className="method-risk-card">
          <h2>Risk management</h2>
          <div className="presentation-chip-row">
            {RISK_ITEMS.map((item) => (
              <span key={item} className="presentation-chip presentation-chip--small">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </PresentationLayout>
  )
}
