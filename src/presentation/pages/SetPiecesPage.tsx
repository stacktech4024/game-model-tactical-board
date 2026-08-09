import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PixiPitchPreview } from '../../renderers/pixi/PixiPitchPreview'
import { PresentationLayout } from '../PresentationLayout'
import {
  SET_PIECES_PAGE_CASES,
  type SetPieceCaseId,
} from '../data/setPiecesPageData'

export function SetPiecesPage() {
  const [activeCaseId, setActiveCaseId] = useState<SetPieceCaseId>('attacking-corner')
  const activeCase = SET_PIECES_PAGE_CASES.find((item) => item.id === activeCaseId) ?? SET_PIECES_PAGE_CASES[0]
  const [cue, setCue] = useState(activeCase.preview.steps[0]?.cue ?? '')

  const selectCase = (caseId: SetPieceCaseId) => {
    const nextCase = SET_PIECES_PAGE_CASES.find((item) => item.id === caseId) ?? SET_PIECES_PAGE_CASES[0]

    setActiveCaseId(nextCase.id)
    setCue(nextCase.preview.steps[0]?.cue ?? '')
  }

  return (
    <PresentationLayout pageId="set-pieces" noPadding>
      <p className="presentation-eyebrow">Dedicated page - set pieces</p>
      <h1 className="presentation-title">Set Pieces</h1>
      <p className="presentation-body set-pieces-intro">
        Planned restarts use clear roles, organization, and responsibilities connected to the same
        Game Model principles used in open play.
      </p>

      <section className="analysis-lab set-pieces-lab">
        <div className="analysis-pitch-card set-pieces-pitch-card">
          <PixiPitchPreview
            key={activeCase.id}
            width={480}
            height={741}
            players={activeCase.preview.players}
            ballPosition={activeCase.preview.ballPosition}
            steps={activeCase.preview.steps}
            routes={activeCase.preview.routes}
            tokenScale={activeCase.tokenScale}
            repeatDelay={activeCase.repeatDelay}
            fadeRouteHistory
            onCueChange={setCue}
          />
          <div className="mini-pitch__cue" aria-live="polite">{cue}</div>
          <div className="mini-pitch__caption">{activeCase.caption}</div>
          <div className="mini-pitch__legend" aria-label="Diagram key">
            <span><i className="mini-pitch__legend-mark mini-pitch__legend-mark--pass" />Ball action</span>
            <span><i className="mini-pitch__legend-mark mini-pitch__legend-mark--run" />Run / shift</span>
          </div>
        </div>

        <aside className="analysis-tabs">
          <div className="analysis-tab-list set-pieces-tab-list" role="tablist" aria-label="Set-piece restart">
            {SET_PIECES_PAGE_CASES.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={item.id === activeCase.id}
                className={item.id === activeCase.id ? 'analysis-tab is-active' : 'analysis-tab'}
                onClick={() => selectCase(item.id)}
              >
                {item.tabLabel}
              </button>
            ))}
          </div>

          <section className="analysis-detail set-pieces-panel" aria-live="polite">
            <div className="set-pieces-panel__heading">
              <span>Set Pieces · {activeCase.implementation}</span>
              <h2>{activeCase.setPieceType}</h2>
            </div>

            <dl className="set-pieces-game-plan">
              <div>
                <dt>System / Organization</dt>
                <dd>{activeCase.organization}</dd>
              </div>
              <div>
                <dt>Strategy</dt>
                <dd>{activeCase.strategy}</dd>
              </div>
            </dl>

            <section className="set-pieces-tactics">
              <span>Tactics</span>
              <ol>
                {activeCase.tactics.map((tactic, index) => (
                  <li key={tactic}><b>{index + 1}</b><p>{tactic}</p></li>
                ))}
              </ol>
            </section>

            <section className="set-pieces-skills">
              <span>Skill Set</span>
              <div className="presentation-chip-row">
                {activeCase.skillSet.map((skill) => (
                  <span key={skill} className="presentation-chip presentation-chip--small">{skill}</span>
                ))}
              </div>
            </section>

            <section className="set-pieces-principles">
              <span>Restart principles</span>
              <div className="presentation-chip-row">
                {activeCase.principles.map((principle) => (
                  <span key={principle} className="presentation-chip presentation-chip--small">{principle}</span>
                ))}
              </div>
            </section>

            <p className="set-pieces-reality-reference">{activeCase.realityReference}</p>

            {activeCase.liveBoardScenarioId && (
              <Link className="presentation-link-button" to={`/presentation/live-board?scenario=${activeCase.liveBoardScenarioId}`}>
                Open attacking corner in live board
              </Link>
            )}
          </section>
        </aside>
      </section>
    </PresentationLayout>
  )
}
