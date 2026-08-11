import { useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { PITCH } from '../../domain/pitch/pitchConstants'
import { PixiPitchPreview } from '../../renderers/pixi/PixiPitchPreview'
import { PresentationLayout } from '../PresentationLayout'
import { getFullbackSkillPixiScenario } from '../data/fullbackSkillPixiAdapter'
import {
  FULLBACK_DEFAULT_SKILL_ID,
  FULLBACK_SKILL_ORDER,
  getFullbackSkillScenario,
  type FullbackCoachingDetail,
  type FullbackSkillVariant,
} from '../data/fullbackSkillScenario'

const PIXI_PREVIEW_WIDTH = 268
const PIXI_PREVIEW_HEIGHT = Math.round(
  PIXI_PREVIEW_WIDTH * (PITCH.LENGTH / PITCH.WIDTH),
)

const COACHING_FIELDS: { key: keyof FullbackCoachingDetail; label: string }[] = [
  { key: 'who', label: 'Who' },
  { key: 'what', label: 'What' },
  { key: 'when', label: 'When' },
  { key: 'where', label: 'Where' },
  { key: 'why', label: 'Why' },
  { key: 'how', label: 'How' },
]

export function SkillsPage() {
  const [activeSkillId, setActiveSkillId] = useState<FullbackSkillVariant>(
    FULLBACK_DEFAULT_SKILL_ID,
  )
  const [activeCue, setActiveCue] = useState(
    getFullbackSkillPixiScenario(FULLBACK_DEFAULT_SKILL_ID).steps?.[0]?.cue ?? '',
  )
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const activeSkill = getFullbackSkillScenario(activeSkillId)
  const pixiScenario = useMemo(
    () => getFullbackSkillPixiScenario(activeSkillId),
    [activeSkillId],
  )

  const selectSkill = (skillId: FullbackSkillVariant) => {
    const nextScenario = getFullbackSkillPixiScenario(skillId)

    setActiveSkillId(skillId)
    setActiveCue(nextScenario.steps?.[0]?.cue ?? '')
  }

  const handleSkillKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    let nextIndex: number

    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % FULLBACK_SKILL_ORDER.length
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + FULLBACK_SKILL_ORDER.length) % FULLBACK_SKILL_ORDER.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = FULLBACK_SKILL_ORDER.length - 1
    } else {
      return
    }

    event.preventDefault()
    const nextSkillId = FULLBACK_SKILL_ORDER[nextIndex]
    selectSkill(nextSkillId)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <PresentationLayout pageId="skills" noPadding>
      <header className="fullback-skills-header">
        <div>
          <p className="presentation-eyebrow">Section 3 — the individual execution</p>
          <h1 className="presentation-title">Skill Development: Fullbacks</h1>
          <p className="presentation-body">
            What #2 Aaron and #3 Christian must recognize and execute within our Game Model.
          </p>
        </div>
        <div className="fullback-player-card" aria-label="Selected position and players">
          <span>Fullbacks</span>
          <strong>#2 Aaron · #3 Christian</strong>
        </div>
      </header>

      <div className="fullback-skill-selector" role="tablist" aria-label="Fullback skill examples">
        {FULLBACK_SKILL_ORDER.map((skillId, index) => {
          const skill = getFullbackSkillScenario(skillId)
          const isActive = skillId === activeSkillId

          return (
            <button
              key={skillId}
              ref={(node) => { tabRefs.current[index] = node }}
              id={`fullback-skill-tab-${skillId}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="fullback-skill-panel"
              tabIndex={isActive ? 0 : -1}
              className={isActive ? 'fullback-skill-tab is-active' : 'fullback-skill-tab'}
              onClick={() => selectSkill(skillId)}
              onKeyDown={(event) => handleSkillKeyDown(event, index)}
            >
              <span>0{index + 1}</span>
              {skill.tabLabel}
            </button>
          )
        })}
      </div>

      <section
        id="fullback-skill-panel"
        className="fullback-skill-workspace"
        role="tabpanel"
        aria-labelledby={`fullback-skill-tab-${activeSkillId}`}
        tabIndex={0}
      >
        <figure className="fullback-skill-visual">
          <div className="mini-pitch fullback-skill-pitch">
            <PixiPitchPreview
              key={activeSkillId}
              width={PIXI_PREVIEW_WIDTH}
              height={PIXI_PREVIEW_HEIGHT}
              accessibleLabel={pixiScenario.animationDescription}
              players={pixiScenario.players}
              ballPosition={pixiScenario.ballPosition}
              steps={pixiScenario.steps}
              routes={pixiScenario.routes}
              fadeRouteHistory
              repeatDelay={2}
              onCueChange={setActiveCue}
            />
            <div className="mini-pitch__cue" aria-live="polite">{activeCue}</div>
            <figcaption className="mini-pitch__caption">{pixiScenario.caption}</figcaption>
          </div>
        </figure>

        <article className="fullback-skill-detail">
          <div className="fullback-skill-detail__header">
            <div className="fullback-skill-meta" aria-label="Game Model context">
              <span>{activeSkill.moment}</span>
              <span>{activeSkill.system}</span>
              <span>{activeSkill.geography}</span>
            </div>
            <h2>{activeSkill.title}</h2>
            <p>{activeSkill.gameModelReason}</p>
          </div>

          <dl className="fullback-coaching-grid">
            {COACHING_FIELDS.map((field) => (
              <div key={field.key}>
                <dt>{field.label}</dt>
                <dd>{activeSkill.coachingDetail[field.key]}</dd>
              </div>
            ))}
          </dl>

          <div className="fullback-skill-lower">
            <section className="fullback-success-card">
              <h3>Success looks like</h3>
              <ul>
                {activeSkill.observableSuccess.map((criterion) => (
                  <li key={criterion}>{criterion}</li>
                ))}
              </ul>
            </section>

            <aside className="fullback-training-card">
              <span>How We Train</span>
              <Link to={activeSkill.relatedTraining.href}>{activeSkill.relatedTraining.label} →</Link>
              <p>{activeSkill.relatedTraining.note}</p>
            </aside>
          </div>

          <div className="fullback-match-transfer" aria-label="Match transfer sequence">
            <span className="fullback-match-transfer__label">Match transfer</span>
            <div>
              {activeSkill.matchTransfer.map((action, index) => (
                <span key={action}>
                  {action}
                  {index < activeSkill.matchTransfer.length - 1 && <b aria-hidden="true">→</b>}
                </span>
              ))}
            </div>
            <p>{activeSkill.transferStatement}</p>
          </div>
        </article>
      </section>
    </PresentationLayout>
  )
}
