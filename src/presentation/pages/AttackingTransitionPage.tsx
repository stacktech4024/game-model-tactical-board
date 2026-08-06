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

          <section className="analysis-detail" aria-live="polite">
            <span>Moment of the Game: Attacking Transition</span>
            <h2>{activeCase.zoneFocus}</h2>
            <p>{activeCase.subtitle}</p>

            <div>
              <strong>System</strong>
              <p>{activeCase.system.description}</p>
            </div>

            <div>
              <strong>Strategy</strong>
              <div className="presentation-chip-row">
                <span className="presentation-chip presentation-chip--small">{activeCase.strategy}</span>
              </div>
            </div>

            <div>
              <strong>Movement sequence</strong>
              <div className="presentation-chip-row">
                {activeCase.tactics.map((tactic) => (
                  <span key={tactic} className="presentation-chip presentation-chip--small">
                    {tactic}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <strong>Body-position emphasis</strong>
              <p>
                The player releasing the ball faces the next action, receivers open forward,
                runners align with their run, and defenders recover goal-side with their shoulders
                open to the ball carrier.
              </p>
            </div>

            <div>
              <strong>Unit progression</strong>
              <p>
                Before the regain, the front and midfield units press while the back four protect
                halfway. After the regain, the front unit stretches, midfield supports underneath,
                and the back line squeezes forward with #4 and #5 slightly deeper.
              </p>
            </div>

            <div>
              <strong>Skill Set</strong>
              <div className="presentation-chip-row">
                {activeCase.skillSet.map((skill) => (
                  <span key={skill} className="presentation-chip presentation-chip--small">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <strong>Canada Soccer attacking principles</strong>
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
