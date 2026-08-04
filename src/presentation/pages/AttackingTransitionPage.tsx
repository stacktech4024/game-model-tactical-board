import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PresentationLayout } from '../PresentationLayout'
import {
  ATTACKING_TRANSITION_PAGE_CASES,
  ATTACKING_TRANSITION_PAGE_DEFAULT_CASE_ID,
  type AttackingTransitionPageCase,
} from '../data/attackingTransitionPageData'
import { PixiPitchPreview } from '../../renderers/pixi/PixiPitchPreview'

function getCaseDetails(activeCase: AttackingTransitionPageCase) {
  return {
    principleChips: activeCase.principles,
    tacticChips: activeCase.tactics,
    skillChips: activeCase.skillSet,
  }
}

export function AttackingTransitionPage() {
  const [activeCaseId, setActiveCaseId] = useState(ATTACKING_TRANSITION_PAGE_DEFAULT_CASE_ID)
  const activeCase = useMemo(
    () =>
      ATTACKING_TRANSITION_PAGE_CASES.find((item) => item.id === activeCaseId) ??
      ATTACKING_TRANSITION_PAGE_CASES.find((item) => item.id === ATTACKING_TRANSITION_PAGE_DEFAULT_CASE_ID) ??
      ATTACKING_TRANSITION_PAGE_CASES[0],
    [activeCaseId],
  )
  const [cue, setCue] = useState(activeCase.steps[0]?.cue ?? activeCase.cue)
  const boardUrl = activeCase.liveBoardScenarioId
    ? `/presentation/live-board?scenario=${activeCase.liveBoardScenarioId}`
    : null
  const activeDetails = getCaseDetails(activeCase)

  const handleCaseSelect = (nextCase: AttackingTransitionPageCase) => {
    setActiveCaseId(nextCase.id)
    setCue(nextCase.steps[0]?.cue ?? nextCase.cue)
  }

  return (
    <PresentationLayout pageId="attacking-transition" noPadding>
      <p className="presentation-eyebrow">Moment page - attacking transition</p>
      <h1 className="presentation-title">Attacking Transition</h1>
      <p className="presentation-body">
        When we win the ball, we look to counter quickly with wide-forward triggers, #10 support and
        link play, #9 as the central target, and rest-defence behind the attack.
      </p>

      <section className="analysis-lab">
        <div className="analysis-pitch-card">
          <PixiPitchPreview
            width={480}
            height={741}
            players={activeCase.players}
            ballPosition={activeCase.ballPosition}
            steps={activeCase.steps}
            routes={activeCase.routes}
            tokenScale={activeCase.tokenScale}
            repeatDelay={activeCase.repeatDelay}
            onCueChange={setCue}
          />
          <div className="mini-pitch__cue" aria-live="polite">
            {cue}
          </div>
          <div className="mini-pitch__caption">{activeCase.caption}</div>
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
          <div className="analysis-tab-list" role="tablist" aria-label="Attacking transition focus">
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

          <section className="analysis-detail" aria-live="polite">
            <span>Moment of the Game: Attacking Transition</span>
            <h2>{activeCase.zoneFocus}</h2>
            <p>{activeCase.system.description}</p>

            <div className="presentation-chip-row" aria-label="System">
              <span className="presentation-chip presentation-chip--small">{activeCase.system.shape}</span>
            </div>

            <div className="presentation-chip-row" aria-label="Strategy">
              <span className="presentation-chip presentation-chip--small">{activeCase.strategy}</span>
            </div>

            <div>
              <strong>Tactics</strong>
              <div className="presentation-chip-row">
                {activeDetails.tacticChips.map((tactic) => (
                  <span key={tactic} className="presentation-chip presentation-chip--small">
                    {tactic}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <strong>Skill Set</strong>
              <div className="presentation-chip-row">
                {activeDetails.skillChips.map((skill) => (
                  <span key={skill} className="presentation-chip presentation-chip--small">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <strong>Canada Soccer principles</strong>
              <div className="presentation-chip-row">
                {activeDetails.principleChips.map((principle) => (
                  <span key={principle} className="presentation-chip presentation-chip--small">
                    {principle}
                  </span>
                ))}
              </div>
            </div>

            {boardUrl ? (
              <Link className="presentation-link-button" to={boardUrl}>
                Open in live board
              </Link>
            ) : (
              <span className="presentation-chip presentation-chip--small">Preview only</span>
            )}
          </section>
        </aside>
      </section>
    </PresentationLayout>
  )
}
