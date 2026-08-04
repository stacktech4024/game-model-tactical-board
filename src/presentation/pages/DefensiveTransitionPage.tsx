import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PixiPitchPreview } from '../../renderers/pixi/PixiPitchPreview'
import { PresentationLayout } from '../PresentationLayout'
import {
  DEFENSIVE_TRANSITION_PAGE_CASES,
  DEFENSIVE_TRANSITION_PAGE_DEFAULT_CASE_ID,
  type DefensiveTransitionPageCase,
} from '../data/defensiveTransitionPageData'

function getCaseDetails(activeCase: DefensiveTransitionPageCase) {
  return {
    principleChips: activeCase.principles,
    tacticChips: activeCase.tactics,
    skillChips: activeCase.skillSet,
  }
}

export function DefensiveTransitionPage() {
  const [activeCaseId, setActiveCaseId] = useState(DEFENSIVE_TRANSITION_PAGE_DEFAULT_CASE_ID)
  const activeCase = useMemo(
    () =>
      DEFENSIVE_TRANSITION_PAGE_CASES.find((item) => item.id === activeCaseId) ??
      DEFENSIVE_TRANSITION_PAGE_CASES.find((item) => item.id === DEFENSIVE_TRANSITION_PAGE_DEFAULT_CASE_ID) ??
      DEFENSIVE_TRANSITION_PAGE_CASES[0],
    [activeCaseId],
  )
  const [cue, setCue] = useState(activeCase.steps[0]?.cue ?? activeCase.cue)
  const activeDetails = getCaseDetails(activeCase)
  const boardUrl = activeCase.liveBoardScenarioId
    ? `/presentation/live-board?scenario=${activeCase.liveBoardScenarioId}`
    : null

  const handleCaseSelect = (nextCase: DefensiveTransitionPageCase) => {
    setActiveCaseId(nextCase.id)
    setCue(nextCase.steps[0]?.cue ?? nextCase.cue)
  }

  return (
    <PresentationLayout pageId="defensive-transition" noPadding>
      <p className="presentation-eyebrow">Moment page - defensive transition</p>
      <h1 className="presentation-title">Defensive Transition</h1>
      <p className="presentation-body">
        When we lose the ball, we react with a 5-second fuse: nearest player pressures, second
        player covers the forward lane, #6/#8 protect central channels, wide players delay recovery
        routes, and the back line protects Zone 1.
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
              <i className="mini-pitch__legend-mark" style={{ background: '#ef4444' }} />
              Pressure
            </span>
            <span>
              <i className="mini-pitch__legend-mark" style={{ background: '#22c55e' }} />
              Recovery
            </span>
          </div>
        </div>

        <aside className="analysis-tabs">
          <div className="analysis-tab-list" role="tablist" aria-label="Defensive transition focus">
            {DEFENSIVE_TRANSITION_PAGE_CASES.map((item) => (
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
            <span>Moment of the Game: Defensive Transition</span>
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
              <strong>Canada Soccer defending principles</strong>
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
