import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SCENARIOS } from '../../data/scenarios'
import { PresentationLayout } from '../PresentationLayout'
import { BUILD_THROUGH_WIDE_CHANNELS_PIXI_SCENARIO } from '../data/buildThroughWideChannelsPixiAdapter'
import { PixiPitchPreview } from '../../renderers/pixi/PixiPitchPreview'
import {
  ATTACKING_ORGANIZATION_PAGE_BODY,
  ATTACKING_ORGANIZATION_TAB_COPY,
  ATTACKING_ORGANIZATION_TABS,
  type AttackingOrganizationTab,
} from '../data/attackingOrganizationPageData'

const ANALYSIS_SCENARIO_ID = 'build-through-wide-channels'

export function GameAnalysisPage() {
  const scenario = SCENARIOS.find((item) => item.id === ANALYSIS_SCENARIO_ID) ?? SCENARIOS[0]
  const [activeTab, setActiveTab] = useState<AttackingOrganizationTab>('System')
  const [cue, setCue] = useState('#3 starts the Zone 2 build')
  const activeCopy = ATTACKING_ORGANIZATION_TAB_COPY[activeTab]
  const firstStepId = scenario.phaseSteps[0]?.id
  const boardUrl = firstStepId
    ? `/presentation/live-board?scenario=${scenario.id}&step=${firstStepId}`
    : `/presentation/live-board?scenario=${scenario.id}`

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
            width={480}
            height={741}
            players={BUILD_THROUGH_WIDE_CHANNELS_PIXI_SCENARIO.players}
            ballPosition={BUILD_THROUGH_WIDE_CHANNELS_PIXI_SCENARIO.ballPosition}
            steps={BUILD_THROUGH_WIDE_CHANNELS_PIXI_SCENARIO.steps}
            routes={BUILD_THROUGH_WIDE_CHANNELS_PIXI_SCENARIO.routes}
            tokenScale={0.76}
            repeatDelay={1.2}
            onCueChange={setCue}
          />
          <div className="mini-pitch__cue" aria-live="polite">
            {cue}
          </div>
          <div className="mini-pitch__caption">
            {BUILD_THROUGH_WIDE_CHANNELS_PIXI_SCENARIO.caption}
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
                onClick={() => setActiveTab(tab)}
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
            <Link className="presentation-link-button" to={boardUrl}>
              Open in live board
            </Link>
          </section>
        </aside>
      </section>
    </PresentationLayout>
  )
}
