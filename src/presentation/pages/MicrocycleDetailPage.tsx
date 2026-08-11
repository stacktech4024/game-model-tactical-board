import { useRef } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PresentationLayout } from '../PresentationLayout'
import {
  DEFAULT_MICROCYCLE_DAY_ID,
  INDIVIDUAL_DEVELOPMENT,
  MD_PLUS_ONE_EVIDENCE,
  MICROCYCLE_DAYS,
  RPE_GUIDANCE,
  getMicrocycleDay,
  type EvidenceValue,
  type MicrocycleDayId,
  type MicrocycleLoad,
} from '../data/microcyclePageData'

const LOAD_STRENGTH: Record<MicrocycleLoad, number> = {
  LOW: 1,
  'LOW–MODERATE': 2,
  MODERATE: 2,
  HIGH: 4,
  MATCH: 4,
  REST: 0,
}

function isMicrocycleDayId(value: string | null): value is MicrocycleDayId {
  return MICROCYCLE_DAYS.some((day) => day.id === value)
}

function LoadDisplay({ label, field }: { label: string; field: EvidenceValue<MicrocycleLoad> }) {
  const strength = LOAD_STRENGTH[field.value]

  return (
    <div className="microcycle-load" data-load={field.value} aria-label={`${label}: ${field.value}`}>
      <span>{label}</span>
      <strong>{field.value}</strong>
      <div className="microcycle-load__bar" aria-hidden="true">
        {[1, 2, 3, 4].map((level) => <i key={level} className={level <= strength ? 'is-filled' : ''} />)}
      </div>
    </div>
  )
}

export function MicrocycleDetailPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedDayId = searchParams.get('day')
  const activeDayId = isMicrocycleDayId(requestedDayId) ? requestedDayId : DEFAULT_MICROCYCLE_DAY_ID
  const activeDay = getMicrocycleDay(activeDayId)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const selectDay = (dayId: MicrocycleDayId) => setSearchParams({ day: dayId }, { replace: true })

  const handleDayKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % MICROCYCLE_DAYS.length
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + MICROCYCLE_DAYS.length) % MICROCYCLE_DAYS.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = MICROCYCLE_DAYS.length - 1
    if (nextIndex === null) return

    event.preventDefault()
    selectDay(MICROCYCLE_DAYS[nextIndex].id)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <PresentationLayout pageId="microcycle-detail" noPadding>
      <header className="microcycle-detail-header">
        <div>
          <p className="presentation-eyebrow">Evidence-based Microcycle · day detail</p>
          <h1 className="presentation-title">SESSION → MATCH TRANSFER</h1>
          <p className="presentation-body">Select one day and read its complete training purpose at a useful size.</p>
        </div>
        <Link to="/presentation/microcycle">← Weekly overview</Link>
      </header>

      <div className="microcycle-ribbon" role="tablist" aria-label="Current U20 weekly schedule">
        {MICROCYCLE_DAYS.map((day, index) => (
          <button
            key={day.id}
            ref={(element) => { tabRefs.current[index] = element }}
            id={`microcycle-detail-tab-${day.id}`}
            type="button"
            role="tab"
            aria-selected={day.id === activeDay.id}
            aria-controls="microcycle-detail-panel"
            tabIndex={day.id === activeDay.id ? 0 : -1}
            className={day.id === activeDay.id ? 'microcycle-day-tab is-active' : 'microcycle-day-tab'}
            data-load={day.physicalLoad.value}
            onClick={() => selectDay(day.id)}
            onKeyDown={(event) => handleDayKeyDown(event, index)}
          >
            <span>{day.ribbonLabel}</span>
            <strong>{day.role}</strong>
            <small>{day.physicalLoad.value}</small>
          </button>
        ))}
      </div>

      <div
        id="microcycle-detail-panel"
        className="microcycle-detail-panel"
        role="tabpanel"
        aria-labelledby={`microcycle-detail-tab-${activeDay.id}`}
        tabIndex={0}
      >
        <section className="microcycle-detail-layout">
          <article className="microcycle-day-card">
            <header>
              <div><span>{activeDay.day}</span><h2>{activeDay.role}</h2></div>
              <p>{activeDay.calendarRelationship}</p>
            </header>

            <div className="microcycle-load-grid">
              <LoadDisplay label="Physical load" field={activeDay.physicalLoad} />
              <LoadDisplay label="Tactical load" field={activeDay.tacticalLoad} />
              <div className="microcycle-duration"><span>Duration</span><strong>{activeDay.duration.value}</strong></div>
              <div className="microcycle-rpe"><span>RPE</span><strong>{activeDay.rpe.value}</strong></div>
            </div>

            <dl className="microcycle-day-facts">
              <div className="is-wide"><dt>Objective</dt><dd>{activeDay.objective.value}</dd></div>
              <div>
                <dt>Primary Moment</dt>
                <dd>{activeDay.primaryMoments.value.length > 0 ? activeDay.primaryMoments.value.join(' · ') : 'No team-session Moment'}</dd>
              </div>
              {activeDay.secondaryMoments.length > 0 && <div><dt>Secondary Moments</dt><dd>{activeDay.secondaryMoments.join(' · ')}</dd></div>}
              <div><dt>Primary units</dt><dd>{activeDay.primaryUnits.join(' · ')}</dd></div>
              {activeDay.secondaryUnits.length > 0 && <div><dt>Secondary units</dt><dd>{activeDay.secondaryUnits.join(' · ')}</dd></div>}
              <div><dt>Session type</dt><dd>{activeDay.sessionType.value}</dd></div>
              <div><dt>Session methodology</dt><dd>{activeDay.methodology.value}</dd></div>
              <div className="is-wide"><dt>Activity types</dt><dd>{activeDay.activityTypes.value.join(' · ')}</dd></div>
            </dl>

            <div className="microcycle-readiness">
              <span>PLAYER READINESS / MODIFIED LOAD</span>
              <p>{activeDay.readinessNote}</p>
            </div>
          </article>

          <article className="microcycle-transfer-card">
            <header><span>DAY → DEMAND → BEHAVIOUR</span><h2>WHY THIS SESSION, ON THIS DAY?</h2></header>
            <div className="microcycle-rpe-guidance">
              <span>RPE COLLECTION</span>
              <p>{RPE_GUIDANCE.scale} {RPE_GUIDANCE.loadCalculation}</p>
            </div>
            <div className="microcycle-transfer-flow">
              <section><b>1</b><div><span>GAME MODEL FOCUS</span><ul>{activeDay.gameModelFocus.map((item) => <li key={item}>{item}</li>)}</ul></div></section>
              <section><b>2</b><div><span>SESSION CONTENT</span><ul>{activeDay.sessionContent.map((item) => <li key={item}>{item}</li>)}</ul></div></section>
              <section><b>3</b><div><span>MATCH TRANSFER</span><p>{activeDay.matchTransfer}</p></div></section>
            </div>
            <div className="microcycle-why"><span>WHY THIS DAY</span><p>{activeDay.whyThisDay}</p></div>
            <div className="microcycle-skills"><span>SKILL DEVELOPMENT</span><p>{activeDay.skillDevelopment.join(' · ')}</p><Link to="/presentation/players">View positional profiles</Link></div>
          </article>
        </section>

        <section
          className={activeDay.id === 'sunday' ? 'microcycle-detail-support has-md1' : 'microcycle-detail-support'}
          aria-label="Applied session references and individual development"
        >
          <section className="microcycle-evidence-card">
            <header><span>APPLIED REFERENCES</span><h2>Connected practice examples</h2></header>
            <div>
              {activeDay.sessionEvidence.map((reference) => (
                <article key={`${reference.source}-${reference.title}`}>
                  <div><strong>{reference.title}</strong><small>{reference.source}</small></div>
                  <p>{reference.detail}</p>
                  {reference.exampleId && <Link to={`/presentation/how-we-train-session?example=${reference.exampleId}`}>How We Train reference →</Link>}
                </article>
              ))}
            </div>
          </section>

          {activeDay.id === 'sunday' && (
            <section className="microcycle-md1-card">
              <header><span>{MD_PLUS_ONE_EVIDENCE.title}</span></header>
              <p>{MD_PLUS_ONE_EVIDENCE.use}</p>
              <div><b>{MD_PLUS_ONE_EVIDENCE.duration}</b><b>{MD_PLUS_ONE_EVIDENCE.rpe}</b><b>{MD_PLUS_ONE_EVIDENCE.physicalLoad}</b><b>{MD_PLUS_ONE_EVIDENCE.methodology}</b><b>{MD_PLUS_ONE_EVIDENCE.format}</b></div>
              <small>{MD_PLUS_ONE_EVIDENCE.constraints} · {MD_PLUS_ONE_EVIDENCE.content.join(' · ')}</small>
            </section>
          )}

          <section className="microcycle-individual-card">
            <header><span>INDIVIDUAL DEVELOPMENT</span><h2>Outside team training</h2></header>
            <p><b>RUN</b>{INDIVIDUAL_DEVELOPMENT.running}</p>
            <p><b>GYM</b>{INDIVIDUAL_DEVELOPMENT.gym}</p>
            <small>{INDIVIDUAL_DEVELOPMENT.modification}</small>
          </section>
        </section>
      </div>
    </PresentationLayout>
  )
}
