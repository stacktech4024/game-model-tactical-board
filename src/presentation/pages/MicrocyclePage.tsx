import { Link } from 'react-router-dom'
import { PresentationLayout } from '../PresentationLayout'
import {
  INDIVIDUAL_DEVELOPMENT,
  MICROCYCLE_DAYS,
  PLAYER_READINESS_NOTE,
} from '../data/microcyclePageData'

export function MicrocyclePage() {
  return (
    <PresentationLayout pageId="microcycle" noPadding>
      <header className="microcycle-header microcycle-overview-header">
        <div>
          <p className="presentation-eyebrow">When and why do we train?</p>
          <h1 className="presentation-title">EVIDENCE-BASED MICROCYCLE</h1>
          <p className="presentation-body">
            See the rhythm of the week first. Open any day for all six required planning fields.
          </p>
        </div>
        <div className="microcycle-story" aria-label="Microcycle planning logic">
          <span><b>GAME MODEL</b> determines <strong>SESSION OBJECTIVE</strong></span>
          <span><b>MATCH SCHEDULE</b> influences <strong>LOAD</strong></span>
          <span><b>TRAINING</b> prepares <strong>MATCH BEHAVIOUR</strong></span>
        </div>
      </header>

      <div className="microcycle-required-fields" aria-label="Required Microcycle planning fields">
        {['Moment', 'Objective', 'Duration', 'RPE', 'Session methodology', 'Activity types'].map((field) => (
          <span key={field}>{field}</span>
        ))}
      </div>

      <section className="microcycle-week-grid" aria-label="Current U20 weekly Microcycle overview">
        {MICROCYCLE_DAYS.map((day, index) => (
          <article key={day.id} className="microcycle-week-card" data-load={day.physicalLoad.value}>
            <header>
              <span>0{index + 1} · {day.day}</span>
              <strong>{day.physicalLoad.value}</strong>
            </header>
            <div className="microcycle-week-card__load" aria-hidden="true"><i /></div>
            <h2>{day.role}</h2>
            <p>{day.calendarRelationship}</p>
            <dl>
              <div><dt>Duration</dt><dd>{day.duration.value}</dd></div>
              <div><dt>RPE</dt><dd>{day.rpe.value}</dd></div>
            </dl>
            <div className="microcycle-week-card__moment">
              <span>Primary Moment</span>
              <p>
                {day.primaryMoments.value.length > 0
                  ? day.primaryMoments.value.join(' · ')
                  : 'Recovery / no team session'}
              </p>
            </div>
            <Link to={`/presentation/microcycle-detail?day=${day.id}`}>
              View day plan <span aria-hidden="true">→</span>
            </Link>
          </article>
        ))}
      </section>

      <section className="microcycle-overview-footer" aria-label="Weekly planning notes">
        <div className="microcycle-overview-principle">
          <span>WEEKLY RHYTHM</span>
          <p>
            Re-enter and develop on Sunday, place the highest team-training load on Monday,
            sharpen tactically on Wednesday, compete, then recover.
          </p>
        </div>
        <div>
          <span>INDIVIDUAL WORK</span>
          <p>{INDIVIDUAL_DEVELOPMENT.running} · {INDIVIDUAL_DEVELOPMENT.gym}</p>
        </div>
        <div>
          <span>READINESS</span>
          <p>{PLAYER_READINESS_NOTE}</p>
        </div>
      </section>
    </PresentationLayout>
  )
}
