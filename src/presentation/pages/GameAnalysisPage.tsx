import { useState } from 'react'
import { SCENARIOS } from '../../data/scenarios'
import { PresentationLayout } from '../PresentationLayout'
import diagram1 from '../../assets/diagram1_attacking_org.png'

const ANALYSIS_SCENARIO_ID = 'build-through-wide-channels'
const ANALYSIS_TABS = ['System', 'Strategy', 'Tactics', 'Skill Set'] as const

type AnalysisTab = (typeof ANALYSIS_TABS)[number]

function getTabCopy(tab: AnalysisTab, scenario: (typeof SCENARIOS)[number]) {
  if (tab === 'System') {
    return {
      headline: scenario.system,
      note: `${scenario.momentOfGame}: ${scenario.fieldGeography.zones.join(' to ')} with ${scenario.fieldGeography.channels[0]}.`,
      chips: scenario.fieldGeography.zones,
    }
  }

  if (tab === 'Strategy') {
    return {
      headline: 'Shared strategy',
      note: scenario.strategy,
      chips: scenario.fieldGeography.channels,
    }
  }

  if (tab === 'Tactics') {
    return {
      headline: 'Key tactical behaviours',
      note: scenario.description,
      chips: scenario.tactics,
    }
  }

  return {
    headline: 'Skill Set under pressure',
    note: 'The technical detail that makes the wide-channel progression repeatable.',
    chips: scenario.skillSet,
  }
}

export function GameAnalysisPage() {
  const scenario = SCENARIOS.find((item) => item.id === ANALYSIS_SCENARIO_ID) ?? SCENARIOS[0]
  const [activeTab, setActiveTab] = useState<AnalysisTab>('System')
  const activeCopy = getTabCopy(activeTab, scenario)

  return (
    <PresentationLayout pageId="game-analysis" noPadding>
      <p className="presentation-eyebrow">Section 2 — the what</p>
      <h1 className="presentation-title">{scenario.momentOfGame}</h1>
      <p className="presentation-body">{scenario.strategy}</p>

      <section className="analysis-lab">
        <div className="analysis-pitch-card">
          <img src={diagram1} alt={`${scenario.title} diagram`} />
          <div className={`analysis-hotspot analysis-hotspot--${activeTab.toLowerCase().replace(' ', '-')}`} aria-hidden="true" />
        </div>

        <aside className="analysis-tabs">
          <div className="analysis-tab-list" role="tablist" aria-label="Attacking organization focus">
            {ANALYSIS_TABS.map((tab) => (
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
          </section>
        </aside>
      </section>
    </PresentationLayout>
  )
}
