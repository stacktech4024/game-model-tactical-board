import { useNavigate } from 'react-router-dom'
import {
  EVALUATOR_PRESENTATION,
  EVALUATOR_TOTAL_SECONDS,
  formatPlannedTime,
} from '../data/evaluatorPresentation'
import '../PresentationLayout.css'

const REHEARSAL_CHECKS = [
  'Start and finish inside 20:00 without skipping the five-link transfer chain.',
  'Keep every spoken example inside Attacking Organization · Zones 2–3 into Zone 4.',
  'Name #2/#3, #7/#11, and #9 when explaining the wide relationship.',
  'On every diagram, identify Pickering, the opponent, attacking direction, zone, and active tactic.',
  'Allow each animation to show the body rotation and opponent reaction before advancing.',
  'Use one interaction per slide unless the script explicitly calls for two.',
  'Record the finish time and mark any section that ran more than 15 seconds over plan.',
]

export function EvaluatorGuidePage() {
  const navigate = useNavigate()

  const startRehearsal = () => {
    window.sessionStorage.setItem('evaluatorRehearsalStartedAt', String(Date.now()))
    navigate('/presentation/cover?mode=evaluator')
  }

  return (
    <div className="evaluator-guide">
      <header className="evaluator-guide__header">
        <div>
          <p>Canada Soccer B Diploma · AO Capping Mode</p>
          <h1>20-Minute Evaluator Run of Show</h1>
          <span>
            One story: identity → AO game problem → Fullback relationship → training activity → match transfer.
          </span>
        </div>
        <aside>
          <strong>{formatPlannedTime(EVALUATOR_TOTAL_SECONDS)}</strong>
          <small>{EVALUATOR_PRESENTATION.length} focused pages</small>
          <button type="button" onClick={startRehearsal}>Start timed rehearsal</button>
          <button type="button" onClick={() => navigate('/presentation/cover?mode=evaluator')}>Open without timer</button>
          <button type="button" onClick={() => navigate('/presentation/cover')}>Open full Game Model</button>
        </aside>
      </header>

      <section className="evaluator-guide__checks" aria-labelledby="rehearsal-checks-title">
        <div>
          <p>Before presenting</p>
          <h2 id="rehearsal-checks-title">Timed rehearsal checklist</h2>
        </div>
        <ul>{REHEARSAL_CHECKS.map((check) => <li key={check}>{check}</li>)}</ul>
      </section>

      <main className="evaluator-guide__timeline">
        {EVALUATOR_PRESENTATION.map((step, index) => (
          <article key={step.pageId}>
            <header>
              <b>{String(index + 1).padStart(2, '0')}</b>
              <div><span>{step.section}</span><h2>{step.purpose}</h2></div>
              <strong>{formatPlannedTime(step.plannedSeconds)}</strong>
            </header>
            <div className="evaluator-guide__script">
              {step.script.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            {step.interaction && <p className="evaluator-guide__cue"><b>Interaction</b>{step.interaction}</p>}
            <p className="evaluator-guide__transition"><b>Transition</b>{step.transition}</p>
            <button
              type="button"
              onClick={() => navigate(`/presentation/${step.pageId}?mode=evaluator${step.pageId.startsWith('how-we-train-') ? '&example=central-wide' : ''}`)}
            >
              Open this page
            </button>
          </article>
        ))}
      </main>
    </div>
  )
}
