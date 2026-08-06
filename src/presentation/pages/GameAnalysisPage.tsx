import { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { SCENARIOS } from '../../data/scenarios'
import { PresentationLayout } from '../PresentationLayout'
import { PixiPitchPreview } from '../../renderers/pixi/PixiPitchPreview'
import {
  ATTACKING_ORGANIZATION_DEFAULT_SERVICE,
  ATTACKING_ORGANIZATION_DEFAULT_SKILL_ID,
  ATTACKING_ORGANIZATION_PAGE_BODY,
  ATTACKING_ORGANIZATION_SKILL_OPTIONS,
  ATTACKING_ORGANIZATION_TAB_COPY,
  ATTACKING_ORGANIZATION_TABS,
  getAttackingOrganizationVisual,
  getGameAnalysisReplayKey,
  isCurrentGameAnalysisReplay,
  type AttackingOrganizationService,
  type AttackingOrganizationSkillId,
  type AttackingOrganizationTab,
} from '../data/attackingOrganizationPageData'

const ANALYSIS_SCENARIO_ID = 'build-through-wide-channels'

export function GameAnalysisPage() {
  const scenario = SCENARIOS.find((item) => item.id === ANALYSIS_SCENARIO_ID) ?? SCENARIOS[0]
  const [activeTab, setActiveTab] = useState<AttackingOrganizationTab>('System')
  const [activeSkillId, setActiveSkillId] = useState<AttackingOrganizationSkillId>(
    ATTACKING_ORGANIZATION_DEFAULT_SKILL_ID,
  )
  const [activeService, setActiveService] = useState<AttackingOrganizationService>(
    ATTACKING_ORGANIZATION_DEFAULT_SERVICE,
  )
  const [replayRevision, setReplayRevision] = useState(0)
  const activeVisual = getAttackingOrganizationVisual(activeTab, activeSkillId, activeService)
  const [cue, setCue] = useState(activeVisual.steps[0]?.cue ?? '')
  const activeCopy = ATTACKING_ORGANIZATION_TAB_COPY[activeTab]
  const replayKey = getGameAnalysisReplayKey(activeTab, activeVisual.id, replayRevision)
  const activeReplayKeyRef = useRef(replayKey)

  useLayoutEffect(() => {
    activeReplayKeyRef.current = replayKey
  }, [replayKey])
  const firstStepId = scenario.phaseSteps[0]?.id
  const boardUrl = firstStepId
    ? `/presentation/live-board?scenario=${scenario.id}&step=${firstStepId}`
    : `/presentation/live-board?scenario=${scenario.id}`

  const restartVisual = (
    nextTab: AttackingOrganizationTab,
    nextSkillId: AttackingOrganizationSkillId,
    nextService: AttackingOrganizationService,
  ) => {
    const nextVisual = getAttackingOrganizationVisual(nextTab, nextSkillId, nextService)

    setActiveTab(nextTab)
    setActiveSkillId(nextSkillId)
    setActiveService(nextService)
    setCue(nextVisual.steps[0]?.cue ?? '')
    setReplayRevision((revision) => revision + 1)
  }

  const handleCueChange = (nextCue: string) => {
    if (isCurrentGameAnalysisReplay(activeReplayKeyRef.current, replayKey)) {
      setCue(nextCue)
    }
  }

  return (
    <PresentationLayout pageId="game-analysis" noPadding>
      <p className="presentation-eyebrow">Section 2 — the what</p>
      <h1 className="presentation-title">{scenario.momentOfGame}</h1>
      <p className="presentation-body">
        {ATTACKING_ORGANIZATION_PAGE_BODY}
      </p>

      <section className="analysis-lab">
        <div className="analysis-pitch-card">
          <PixiPitchPreview
            key={replayKey}
            width={480}
            height={741}
            players={activeVisual.players}
            ballPosition={activeVisual.ballPosition}
            steps={activeVisual.steps}
            routes={activeVisual.routes}
            tokenScale={activeVisual.tokenScale}
            repeatDelay={activeVisual.repeatDelay}
            onCueChange={handleCueChange}
          />
          <div className="mini-pitch__cue" aria-live="polite">
            {cue}
          </div>
          <div className="mini-pitch__caption">
            {activeVisual.caption}
          </div>
          <div className="mini-pitch__legend" aria-label="Diagram key">
            <span>
              <i className="mini-pitch__legend-mark mini-pitch__legend-mark--pass" />
              Pass
            </span>
            <span>
              <i className="mini-pitch__legend-mark mini-pitch__legend-mark--run" />
              Player run
            </span>
          </div>
        </div>

        <aside className="analysis-tabs">
          <div className="analysis-tab-list" role="tablist" aria-label="Attacking organization focus">
            {ATTACKING_ORGANIZATION_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={tab === activeTab}
                className={tab === activeTab ? 'analysis-tab is-active' : 'analysis-tab'}
                aria-label={tab === activeTab ? `Replay ${tab}` : `Show ${tab}`}
                onClick={() => restartVisual(tab, activeSkillId, activeService)}
              >
                {tab}
              </button>
            ))}
          </div>

          <section className="analysis-detail" aria-live="polite">
            <span>Moment of the Game: {scenario.momentOfGame}</span>
            <h2>{activeCopy.headline}</h2>
            <p>{activeCopy.note}</p>
            <div className="presentation-chip-row">
              {activeCopy.chips.map((chip) => (
                <span key={chip} className="presentation-chip presentation-chip--small">
                  {chip}
                </span>
              ))}
            </div>

            {activeTab === 'Skill Set' ? (
              <div className="analysis-skill-controls">
                <strong>Choose a teaching example</strong>
                <div className="analysis-skill-list" aria-label="Skill Set examples">
                  {ATTACKING_ORGANIZATION_SKILL_OPTIONS.map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      className={skill.id === activeSkillId ? 'analysis-skill-button is-active' : 'analysis-skill-button'}
                      aria-pressed={skill.id === activeSkillId}
                      onClick={() => restartVisual('Skill Set', skill.id, activeService)}
                    >
                      {skill.label}
                    </button>
                  ))}
                </div>

                {activeSkillId === 'cross-cut-back' ? (
                  <div className="analysis-service-toggle" aria-label="Delivery choice">
                    {(['Cross', 'Cut back'] as const).map((service) => (
                      <button
                        key={service}
                        type="button"
                        className={service === activeService ? 'analysis-service-button is-active' : 'analysis-service-button'}
                        aria-pressed={service === activeService}
                        onClick={() => restartVisual('Skill Set', activeSkillId, service)}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            <p className="analysis-replay-note">Select the active focus again to restart its animation.</p>
            <Link className="presentation-link-button" to={boardUrl}>
              Open in live board
            </Link>
          </section>
        </aside>
      </section>
    </PresentationLayout>
  )
}
