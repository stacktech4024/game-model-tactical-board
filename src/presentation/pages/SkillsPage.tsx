import { useState } from 'react'
import { PresentationLayout } from '../PresentationLayout'
import { POSITIONAL_PROFILES } from '../data/positionalProfiles'

const FULLBACK_TABS = [
  {
    id: 'in-possession',
    label: 'In Possession',
    headline: 'Be the wide-channel release',
    cues: ['Scan before receiving', 'Support wide channel', 'Overlap or underlap on cue', 'Cross, combine, or reset'],
  },
  {
    id: 'out-of-possession',
    label: 'Out of Possession',
    headline: 'Win the wide duel first',
    cues: ['Defend 1v1 wide', 'Communicate with centre-back', 'Protect Channel 1', 'Prevent easy entry inside'],
  },
  {
    id: 'transition',
    label: 'Transition',
    headline: 'Attack high, recover honestly',
    cues: ['Recover quickly on loss', 'Recognize counter-support moments', 'Balance overlap with rest defence'],
  },
]

export function SkillsPage() {
  const [activeTabId, setActiveTabId] = useState(FULLBACK_TABS[0].id)
  const [showAllProfiles, setShowAllProfiles] = useState(false)
  const activeTab = FULLBACK_TABS.find((tab) => tab.id === activeTabId) ?? FULLBACK_TABS[0]
  const fullbackProfile = POSITIONAL_PROFILES.find((profile) => profile.position === 'FB')
  const secondaryProfiles = POSITIONAL_PROFILES.filter((profile) => profile.position !== 'FB')

  return (
    <PresentationLayout pageId="skills" noPadding>
      <p className="presentation-eyebrow">Section 3 — the how</p>
      <h1 className="presentation-title">Skill development: fullback #2/#3</h1>
      <p className="presentation-body">
        The wide-channel build depends on the fullback's scanning, timing, and decision — overlap,
        underlap, cross, or reset.
      </p>

      <section className="skill-lab">
        <div className="fullback-visual-card" aria-label="Fullback role visual">
          <div className="mini-pitch">
            <div className="mini-pitch__zone mini-pitch__zone--wide" aria-hidden="true" />
            <div className="mini-pitch__zone-label mini-pitch__zone-label--one">Zone 1: Build Up</div>
            <div className="mini-pitch__zone-label mini-pitch__zone-label--two">Zone 2: Unbalance</div>
            <div className="mini-pitch__zone-label mini-pitch__zone-label--three">Zone 3: Supply</div>
            <div className="mini-pitch__zone-label mini-pitch__zone-label--four">Zone 4: Penetrate</div>
            <div className="mini-pitch__channel-label mini-pitch__channel-label--wide">Channel 1: Wide</div>
            <div className="mini-pitch__channel-label mini-pitch__channel-label--half">Channel 2: Half Space</div>
            <div className="mini-pitch__channel-label mini-pitch__channel-label--central">Channel 3: Central</div>
            <div className="mini-pitch__action mini-pitch__action--pass mini-pitch__action--six-ten" aria-label="Pass from 6 to 10" />
            <div className="mini-pitch__action mini-pitch__action--pass mini-pitch__action--ten-winger" aria-label="Pass from 10 to 7 or 11" />
            <div className="mini-pitch__action mini-pitch__action--pass mini-pitch__action--winger-fullback" aria-label="Wide-channel pass from 7 or 11 to 2 or 3" />
            <div className="mini-pitch__action mini-pitch__action--run mini-pitch__action--overlap" aria-label="Overlapping or underlapping fullback run" />
            <div className="mini-pitch__action mini-pitch__action--cross mini-pitch__action--final-ball" aria-label="Final ball from wide channel to 9" />
            <div className="mini-pitch__token mini-pitch__token--fullback">2/3</div>
            <div className="mini-pitch__token mini-pitch__token--winger">7/11</div>
            <div className="mini-pitch__token mini-pitch__token--ten">10</div>
            <div className="mini-pitch__token mini-pitch__token--six">6</div>
            <div className="mini-pitch__token mini-pitch__token--nine">9</div>
            <div className="mini-pitch__legend" aria-label="Diagram key">
              <span><i className="mini-pitch__legend-mark mini-pitch__legend-mark--pass" />Pass</span>
              <span><i className="mini-pitch__legend-mark mini-pitch__legend-mark--run" />Player run</span>
              <span><i className="mini-pitch__legend-mark mini-pitch__legend-mark--cross" />Cross or cutback</span>
            </div>
          </div>
          <div>
            <span className="skill-role-label">{fullbackProfile?.fullName ?? 'Full back'} · {fullbackProfile?.numbers ?? '#2/#3'}</span>
            <h2>{activeTab.headline}</h2>
            <p>{fullbackProfile?.style}</p>
          </div>
        </div>

        <aside className="skill-tabs">
          <div className="analysis-tab-list" role="tablist" aria-label="Fullback skill moments">
            {FULLBACK_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={tab.id === activeTabId}
                className={tab.id === activeTabId ? 'analysis-tab is-active' : 'analysis-tab'}
                onClick={() => setActiveTabId(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <section className="analysis-detail" aria-live="polite">
            <span>Fullback coaching cues</span>
            <h2>{activeTab.headline}</h2>
            <div className="presentation-chip-row">
              {activeTab.cues.map((cue) => (
                <span key={cue} className="presentation-chip presentation-chip--small">
                  {cue}
                </span>
              ))}
            </div>
          </section>

          <section className="profile-drawer">
            <button
              type="button"
              className="profile-drawer__toggle"
              onClick={() => setShowAllProfiles((current) => !current)}
            >
              {showAllProfiles ? 'Hide all profiles' : 'View all profiles'}
            </button>
            {showAllProfiles && (
              <div className="profile-chip-grid">
                {secondaryProfiles.map((profile) => (
                  <span key={profile.position} className="profile-chip">
                    <strong>{profile.position}</strong> {profile.numbers}
                  </span>
                ))}
              </div>
            )}
          </section>
        </aside>
      </section>
    </PresentationLayout>
  )
}
