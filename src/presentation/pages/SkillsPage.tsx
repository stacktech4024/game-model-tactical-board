import { useState } from 'react'
import { PresentationLayout } from '../PresentationLayout'
import { POSITIONAL_PROFILES } from '../data/positionalProfiles'
import { FullbackSkillScenario } from '../components/FullbackSkillScenario'

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
  const [selectedProfilePosition, setSelectedProfilePosition] = useState<string | null>(null)
  const activeTab = FULLBACK_TABS.find((tab) => tab.id === activeTabId) ?? FULLBACK_TABS[0]
  const fullbackProfile = POSITIONAL_PROFILES.find((profile) => profile.position === 'FB')
  const selectedProfile = POSITIONAL_PROFILES.find(
    (profile) => profile.position === selectedProfilePosition,
  )

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
          <FullbackSkillScenario />
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
              <>
                <div className="profile-chip-grid" aria-label="Position profiles">
                  {POSITIONAL_PROFILES.map((profile) => (
                    <button
                      key={profile.position}
                      type="button"
                      aria-pressed={profile.position === selectedProfilePosition}
                      className={
                        profile.position === selectedProfilePosition
                          ? 'profile-chip is-active'
                          : 'profile-chip'
                      }
                      onClick={() => setSelectedProfilePosition(profile.position)}
                    >
                      <strong>{profile.position}</strong> {profile.numbers}
                    </button>
                  ))}
                </div>
                {selectedProfile && (
                  <section className="profile-detail" aria-live="polite">
                    <span>{selectedProfile.fullName} · {selectedProfile.numbers}</span>
                    <h2>{selectedProfile.style}</h2>
                    <p><strong>In possession:</strong> {selectedProfile.attackingOrg}</p>
                    <p><strong>Out of possession:</strong> {selectedProfile.defensiveOrg}</p>
                  </section>
                )}
              </>
            )}
          </section>
        </aside>
      </section>
    </PresentationLayout>
  )
}
