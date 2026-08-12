import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PixiPitchPreview } from '../../renderers/pixi/PixiPitchPreview'
import { PresentationLayout } from '../PresentationLayout'
import {
  SET_PIECES_PAGE_CASES,
  type SetPiecePageCase,
  type SetPieceCaseId,
} from '../data/setPiecesPageData'
import type { PresentationPageId } from '../data/pageOrder'

const GENERAL_SET_PIECE_CASES = SET_PIECES_PAGE_CASES.filter((item) => (
  item.id !== 'direct-free-kick' && item.id !== 'indirect-free-kick'
))

type SetPieceRegimePageProps = {
  pageId: PresentationPageId
  eyebrow: string
  title: string
  intro: string
  cases: SetPiecePageCase[]
  panelLabel: string
  tabListLabel: string
  labClassName?: string
}

export function SetPieceRegimePage({
  pageId,
  eyebrow,
  title,
  intro,
  cases,
  panelLabel,
  tabListLabel,
  labClassName = '',
}: SetPieceRegimePageProps) {
  const [activeCaseId, setActiveCaseId] = useState<SetPieceCaseId>(cases[0].id)
  const activeCase = cases.find((item) => item.id === activeCaseId) ?? cases[0]
  const [cue, setCue] = useState(activeCase.preview.steps[0]?.cue ?? '')

  const selectCase = (caseId: SetPieceCaseId) => {
    const nextCase = cases.find((item) => item.id === caseId) ?? cases[0]

    setActiveCaseId(nextCase.id)
    setCue(nextCase.preview.steps[0]?.cue ?? '')
  }

  return (
    <PresentationLayout pageId={pageId} noPadding>
      <p className="presentation-eyebrow">{eyebrow}</p>
      <h1 className="presentation-title">{title}</h1>
      <p className="presentation-body set-pieces-intro">
        {intro}
      </p>

      <section className={`analysis-lab set-pieces-lab ${labClassName}`.trim()}>
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
            accessibleLabel={`${activeCase.setPieceType}. ${activeCase.caption}`}
          />
          <div className="mini-pitch__cue" aria-live="polite">{cue}</div>
          <div className="mini-pitch__caption">{activeCase.caption}</div>
          <div className="mini-pitch__legend" aria-label="Diagram key">
            <span><i className="mini-pitch__legend-mark mini-pitch__legend-mark--pass" />Ball action</span>
            <span><i className="mini-pitch__legend-mark mini-pitch__legend-mark--run" />Run / shift</span>
          </div>
        </div>

        <aside className="analysis-tabs">
          <div className="analysis-tab-list set-pieces-tab-list" role="tablist" aria-label={tabListLabel}>
            {cases.map((item) => (
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
              <span>{panelLabel} · {activeCase.implementation}</span>
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

export function SetPiecesPage() {
  return (
    <SetPieceRegimePage
      pageId="set-pieces"
      eyebrow="Dedicated page - set pieces"
      title="Set Pieces"
      intro="Planned corners, wide restarts, and throw-ins use clear roles and responsibilities connected to the same Game Model principles used in open play."
      cases={GENERAL_SET_PIECE_CASES}
      panelLabel="Set Pieces"
      tabListLabel="Corner, wide free-kick, and throw-in restart"
    />
  )
}
