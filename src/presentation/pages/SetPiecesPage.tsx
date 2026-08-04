import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PixiPitchPreview } from '../../renderers/pixi/PixiPitchPreview'
import { PresentationLayout } from '../PresentationLayout'
import { CORNER_PIXI_SCENARIO } from '../data/cornerPixiAdapter'
import { CORNER_PREVIEW_STEPS } from '../data/cornerScenario'
import { SET_PIECES_PAGE_CASE } from '../data/setPiecesPageData'

export function SetPiecesPage() {
  const scenario = SET_PIECES_PAGE_CASE
  const [cue, setCue] = useState(CORNER_PREVIEW_STEPS[0]?.cue ?? '')

  return (
    <PresentationLayout pageId="set-pieces" noPadding>
      <p className="presentation-eyebrow">Dedicated page - set pieces</p>
      <h1 className="presentation-title">Set Pieces</h1>
      <p className="presentation-body">
        On set pieces, we use rehearsed routines with clear roles, disguise, delivery timing,
        central finishing targets, second-ball support, and rest-defence protection.
      </p>

      <section className="analysis-lab">
        <div className="analysis-pitch-card">
          <PixiPitchPreview
            width={480}
            height={741}
            players={CORNER_PIXI_SCENARIO.players}
            ballPosition={CORNER_PIXI_SCENARIO.ballPosition}
            steps={CORNER_PIXI_SCENARIO.steps}
            routes={CORNER_PIXI_SCENARIO.routes}
            tokenScale={scenario.tokenScale}
            repeatDelay={scenario.repeatDelay}
            onCueChange={setCue}
          />
          <div className="mini-pitch__cue" aria-live="polite">{cue}</div>
          <div className="mini-pitch__caption">{scenario.caption}</div>
          <div className="mini-pitch__legend" aria-label="Diagram key">
            <span><i className="mini-pitch__legend-mark mini-pitch__legend-mark--pass" />Delivery</span>
            <span><i className="mini-pitch__legend-mark mini-pitch__legend-mark--run" />Attack / support run</span>
          </div>
        </div>

        <aside className="analysis-tabs">
          <section className="analysis-detail" aria-live="polite">
            <span>Set Pieces</span>
            <h2>{scenario.setPieceType}</h2>
            <div>
              <strong>System</strong>
              <p>{scenario.system.description}</p>
            </div>
            <div>
              <strong>Strategy</strong>
              <div className="presentation-chip-row">
                <span className="presentation-chip presentation-chip--small">{scenario.strategy}</span>
              </div>
            </div>
            <div>
              <strong>Tactics</strong>
              <div className="presentation-chip-row">
                {scenario.tactics.map((tactic) => <span key={tactic} className="presentation-chip presentation-chip--small">{tactic}</span>)}
              </div>
            </div>
            <div>
              <strong>Skill Set</strong>
              <div className="presentation-chip-row">
                {scenario.skillSet.map((skill) => <span key={skill} className="presentation-chip presentation-chip--small">{skill}</span>)}
              </div>
            </div>
            <div>
              <strong>Canada Soccer attacking principles</strong>
              <div className="presentation-chip-row">
                {scenario.principles.map((principle) => <span key={principle} className="presentation-chip presentation-chip--small">{principle}</span>)}
              </div>
            </div>
            <div>
              <strong>Not authored yet</strong>
              <div className="presentation-chip-row">
                {scenario.futureSetPieces.map((item) => <span key={item} className="presentation-chip presentation-chip--small">{item}</span>)}
              </div>
            </div>
            <Link className="presentation-link-button" to={`/presentation/live-board?scenario=${scenario.liveBoardScenarioId}`}>
              Open in live board
            </Link>
          </section>
        </aside>
      </section>
    </PresentationLayout>
  )
}
