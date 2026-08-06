import { useMemo, useState } from 'react'
import { PixiPitchPreview } from '../../renderers/pixi/PixiPitchPreview'
import { PresentationLayout } from '../PresentationLayout'
import {
  ATTACKING_TRANSITION_PAGE_CASES,
  ATTACKING_TRANSITION_PAGE_DEFAULT_CASE_ID,
  type AttackingTransitionPageCase,
} from '../data/attackingTransitionPageData'

export function AttackingTransitionPage() {
  const [activeCaseId, setActiveCaseId] = useState(ATTACKING_TRANSITION_PAGE_DEFAULT_CASE_ID)
  const activeCase = useMemo(
    () =>
      ATTACKING_TRANSITION_PAGE_CASES.find((item) => item.id === activeCaseId) ??
      ATTACKING_TRANSITION_PAGE_CASES[0],
    [activeCaseId],
  )
  const [cue, setCue] = useState(activeCase.steps[0]?.cue ?? '')

  const handleCaseSelect = (nextCase: AttackingTransitionPageCase) => {
    setActiveCaseId(nextCase.id)
    setCue(nextCase.steps[0]?.cue ?? '')
  }

  return (
    <PresentationLayout pageId="attacking-transition" noPadding>
      <p className="presentation-eyebrow">Moment page - attacking transition</p>
      <h1 className="presentation-title">Attacking Transition</h1>
      <p className="presentation-body">
        Every case begins with the opponent goalkeeper in possession. Canada presses in connected
        lines with the back four protecting halfway against the long ball; the selected tab shows
        the zone where we recover possession and begin the Attacking Transition.
      </p>

      <section className="analysis-lab attacking-transition-lab">
        <div className="analysis-pitch-card attacking-transition-animation-card">
          <PixiPitchPreview
            width={480}
            height={741}
            players={activeCase.players}
            ballPosition={activeCase.ballPosition}
            steps={activeCase.steps}
            routes={activeCase.routes}
            fadeRouteHistory
            tokenScale={activeCase.tokenScale}
            repeatDelay={activeCase.repeatDelay}
            onCueChange={setCue}
          />
          <div className="attacking-transition-animation-meta">
            <div className="mini-pitch__cue" aria-live="polite">
              {cue}
            </div>
            <div className="mini-pitch__caption">{activeCase.caption}</div>
            <div className="mini-pitch__legend" aria-label="Diagram key">
              <span>
                <i className="mini-pitch__legend-mark mini-pitch__legend-mark--pass" />
                Ball movement
              </span>
              <span>
                <i className="mini-pitch__legend-mark mini-pitch__legend-mark--run" />
                Player run
              </span>
              <span>
                <i className="mini-pitch__legend-mark" style={{ background: '#fb923c' }} />
                Cross
              </span>
              <span>
                <i className="mini-pitch__legend-mark" style={{ background: '#a855f7' }} />
                Shot
              </span>
            </div>
          </div>
        </div>

        <aside className="analysis-tabs">
          <div className="analysis-tab-list" role="tablist" aria-label="Attacking transition turnover zone">
            {ATTACKING_TRANSITION_PAGE_CASES.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={item.id === activeCase.id}
                className={item.id === activeCase.id ? 'analysis-tab is-active' : 'analysis-tab'}
                onClick={() => handleCaseSelect(item)}
              >
                {item.tabLabel}
              </button>
            ))}
          </div>

          <section className="analysis-detail attacking-transition-detail" aria-live="polite">
            <span>Moment of the Game: Attacking Transition</span>
            <h2>{activeCase.zoneFocus}</h2>
            <p className="attacking-transition-detail__summary">{activeCase.subtitle}</p>

            <div className="attacking-transition-detail__section">
              <div className="attacking-transition-detail__heading">
                <strong>Game plan</strong>
                <span>System + Strategy</span>
              </div>
              <p><b>{activeCase.system.shape}.</b> {activeCase.system.description}</p>
              <p className="attacking-transition-detail__objective">
                <b>Objective:</b> {activeCase.strategy}
              </p>
            </div>

            <div className="attacking-transition-detail__section">
              <div className="attacking-transition-detail__heading">
                <strong>Movement sequence</strong>
                <span>Tactics</span>
              </div>
              <ol className="attacking-transition-steps">
                {activeCase.tactics.map((tactic, index) => (
                  <li key={tactic}>
                    <b>{index + 1}</b>
                    <p>{tactic}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="attacking-transition-detail__section">
              <div className="attacking-transition-detail__heading">
                <strong>Coaching points</strong>
                <span>Body position + Unit progression</span>
              </div>
              <ul className="attacking-transition-coaching-points">
                {activeCase.coachingPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>

            <div className="attacking-transition-detail__section">
              <div className="attacking-transition-detail__heading">
                <strong>Key tags</strong>
                <span>Skill Set + Principles</span>
              </div>
              <div className="presentation-chip-row">
                {activeCase.principles.map((principle) => (
                  <span key={principle} className="presentation-chip presentation-chip--small">
                    {principle}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </aside>
      </section>
    </PresentationLayout>
  )
}
