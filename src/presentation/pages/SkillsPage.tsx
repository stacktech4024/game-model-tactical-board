import { useMemo, useState } from 'react'
import { PresentationLayout } from '../PresentationLayout'
import { POSITIONAL_PROFILES } from '../data/positionalProfiles'
import { getFullbackSkillPixiScenario } from '../data/fullbackSkillPixiAdapter'
import type { FullbackSkillVariant } from '../data/fullbackSkillScenario'
import { PITCH } from '../../domain/pitch/pitchConstants'
import { PixiPitchPreview } from '../../renderers/pixi/PixiPitchPreview'

const PIXI_PREVIEW_WIDTH = 360
const PIXI_PREVIEW_HEIGHT = Math.round(
  PIXI_PREVIEW_WIDTH * (PITCH.LENGTH / PITCH.WIDTH),
)

const FULLBACK_TABS: {
  id: FullbackSkillVariant
  label: string
  headline: string
  cues: string[]
}[] = [
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
  const [activeCue, setActiveCue] = useState(
    getFullbackSkillPixiScenario(FULLBACK_TABS[0].id).steps?.[0]?.cue ?? '',
  )
  const [showAllProfiles, setShowAllProfiles] = useState(false)
  const [selectedProfilePosition, setSelectedProfilePosition] = useState<string | null>(null)
  const activeTab = FULLBACK_TABS.find((tab) => tab.id === activeTabId) ?? FULLBACK_TABS[0]
  const pixiScenario = useMemo(
    () => getFullbackSkillPixiScenario(activeTabId),
    [activeTabId],
  )
  const fullbackProfile = POSITIONAL_PROFILES.find((profile) => profile.position === 'FB')
  const selectedProfile = POSITIONAL_PROFILES.find(
    (profile) => profile.position === selectedProfilePosition,
  )

  const handleTabChange = (tabId: FullbackSkillVariant) => {
    const nextScenario = getFullbackSkillPixiScenario(tabId)

    setActiveTabId(tabId)
    setActiveCue(nextScenario.steps?.[0]?.cue ?? '')
  }

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
          <div className="mini-pitch fullback-skill-pitch">
            <PixiPitchPreview
              key={activeTabId}
              width={PIXI_PREVIEW_WIDTH}
              height={PIXI_PREVIEW_HEIGHT}
              players={pixiScenario.players}
              ballPosition={pixiScenario.ballPosition}
              steps={pixiScenario.steps}
              onCueChange={setActiveCue}
            />
            <div className="mini-pitch__cue" aria-live="polite">{activeCue}</div>
            <div className="mini-pitch__caption">{pixiScenario.caption}</div>
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
                onClick={() => handleTabChange(tab.id)}
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
