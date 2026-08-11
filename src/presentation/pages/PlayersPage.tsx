import { useMemo, useState } from 'react'
import { FORMATION_POSITIONS } from '../../data/formations'
import { PICKERING_SQUAD } from '../../data/squad'
import { PITCH } from '../../domain/pitch/pitchConstants'
import { pitchToScreen } from '../../domain/pitch/coordTransforms'
import { PixiPitchPreview, PITCH_PADDING } from '../../renderers/pixi/PixiPitchPreview'
import { PresentationLayout } from '../PresentationLayout'
import {
  POSITIONAL_PROFILES,
  PROFILE_MOMENT_LABELS,
  getProfileForPosition,
  getPositionalProfile,
  type PositionalProfileId,
  type ProfileMomentId,
} from '../data/positionalProfiles'

const BOARD_WIDTH = 540
const BOARD_HEIGHT = Math.round(BOARD_WIDTH * (PITCH.LENGTH / PITCH.WIDTH))
const BOARD_TOKEN_SCALE = 1.48
const AO_REFERENCE_FORMATION = FORMATION_POSITIONS['attacking-442']
const BALL_OFFSET_METERS = 1.6
const MOMENT_IDS = Object.keys(PROFILE_MOMENT_LABELS) as ProfileMomentId[]

const PRIORITY_CATEGORIES = [
  { id: 'physical', label: 'Physical' },
  { id: 'social', label: 'Social' },
  { id: 'mental', label: 'Mental' },
  { id: 'skillSet', label: 'Skill Set' },
] as const

function pitchToPercentage(point: { x: number; y: number }) {
  return {
    x: (point.x / PITCH.WIDTH) * 100,
    y: ((PITCH.LENGTH - point.y) / PITCH.LENGTH) * 100,
  }
}

export function PlayersPage() {
  const [selectedProfileId, setSelectedProfileId] = useState<PositionalProfileId>('goalkeeper')
  const [activeMomentId, setActiveMomentId] = useState<ProfileMomentId>('attackingOrganization')
  const players = useMemo(
    () => [...PICKERING_SQUAD].sort((first, second) => first.number - second.number),
    [],
  )
  const selectedProfile = getPositionalProfile(selectedProfileId)
  const selectedNumbers = new Set(selectedProfile.occupants.map((occupant) => occupant.number))
  const primaryOccupant = selectedProfile.occupants[0]
  const primaryOccupantNumber = primaryOccupant.number

  const pixiPlayers = useMemo(
    () => players.map((player) => {
      const percentage = pitchToPercentage(AO_REFERENCE_FORMATION[player.number])

      return {
        id: player.id,
        label: player.name,
        x: percentage.x,
        y: percentage.y,
        tone: player.isGoalkeeper ? ('keeper' as const) : undefined,
      }
    }),
    [players],
  )

  const primaryFormationSpot = AO_REFERENCE_FORMATION[primaryOccupantNumber]
  const ballPosition = pitchToPercentage({
    x: primaryFormationSpot.x,
    y: Math.min(PITCH.LENGTH, primaryFormationSpot.y + BALL_OFFSET_METERS),
  })

  const overlaySpots = useMemo(
    () => players.map((player) => {
      const position = AO_REFERENCE_FORMATION[player.number]
      const screen = pitchToScreen(position.x, position.y, BOARD_WIDTH, BOARD_HEIGHT, PITCH_PADDING)

      return { player, screen }
    }),
    [players],
  )

  const selectProfile = (profileId: PositionalProfileId) => {
    setSelectedProfileId(profileId)
    setActiveMomentId('attackingOrganization')
  }

  const handleMomentKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      return
    }

    event.preventDefault()
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? MOMENT_IDS.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + MOMENT_IDS.length) % MOMENT_IDS.length
    const nextMomentId = MOMENT_IDS[nextIndex]

    setActiveMomentId(nextMomentId)
    document.getElementById(`profile-moment-tab-${nextMomentId}`)?.focus()
  }

  return (
    <PresentationLayout pageId="players" noPadding>
      <header className="positional-profiles-header">
        <div>
          <p className="presentation-eyebrow">Section 3 - the who</p>
          <h1 className="presentation-title">Positional profiles</h1>
        </div>
        <p className="presentation-body">
          Select a role to connect Canada Soccer priorities with responsibilities in all four Moments.
        </p>
      </header>

      <nav className="profile-selector" aria-label="Select a positional profile">
        {POSITIONAL_PROFILES.map((profile) => {
          const isActive = profile.id === selectedProfileId

          return (
            <button
              key={profile.id}
              type="button"
              className={isActive ? 'profile-selector__button is-active' : 'profile-selector__button'}
              aria-pressed={isActive}
              aria-label={`${profile.positionName}, ${profile.numbers}`}
              onClick={() => selectProfile(profile.id)}
            >
              <strong>{profile.shortLabel}</strong>
              <span>{profile.numbers}</span>
            </button>
          )
        })}
      </nav>

      <section className="positional-profile-lab">
        <aside className="profile-formation-card" aria-label="Attacking Organization 1-4-4-2 reference">
          <div className="profile-formation-card__header">
            <span>AO reference</span>
            <strong>1-4-4-2</strong>
          </div>
          <div className="profile-formation-card__pitch">
            <PixiPitchPreview
              width={BOARD_WIDTH}
              height={BOARD_HEIGHT}
              players={pixiPlayers}
              ballPosition={ballPosition}
              tokenScale={BOARD_TOKEN_SCALE}
            />
            {overlaySpots.map(({ player, screen }) => {
              const isActive = selectedNumbers.has(player.number)

              return (
                <button
                  key={player.id}
                  type="button"
                  className={isActive ? 'profile-formation-card__spot is-active' : 'profile-formation-card__spot'}
                  style={{
                    left: `${(screen.sx / BOARD_WIDTH) * 100}%`,
                    top: `${(screen.sy / BOARD_HEIGHT) * 100}%`,
                  }}
                  aria-pressed={isActive}
                  aria-label={`Select ${getProfileForPosition(player.position).positionName}: #${player.number} ${player.name}`}
                  onClick={() => selectProfile(getProfileForPosition(player.position).id)}
                />
              )
            })}
          </div>
          <p>Select a player or role. Highlighted players share the active profile.</p>
        </aside>

        <article className="positional-profile-detail" aria-live="polite">
          <div className="positional-profile-detail__identity">
            <div>
              <span>{selectedProfile.numbers}</span>
              <h2>{selectedProfile.positionName}</h2>
              <p>{selectedProfile.style}</p>
            </div>
            <div className="profile-occupants" aria-label={`${selectedProfile.positionName} squad occupants`}>
              {selectedProfile.occupants.map((occupant) => (
                <span key={occupant.id}>
                  <strong>#{occupant.number}</strong> {occupant.name}
                  <small>{occupant.position}</small>
                </span>
              ))}
            </div>
          </div>

          <div
            className={selectedProfile.roleEmphases
              ? 'positional-profile-detail__body has-role-emphases'
              : 'positional-profile-detail__body'}
          >
            {selectedProfile.roleEmphases && (
              <div className="profile-role-emphases" aria-label="Central midfield role emphases">
                {selectedProfile.roleEmphases.map((emphasis) => (
                  <div key={emphasis.number}>
                    <strong>{emphasis.label}</strong>
                    <span>{emphasis.priorities.join(' / ')}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="profile-priority-grid" aria-label={`${selectedProfile.positionName} profile priorities`}>
              {PRIORITY_CATEGORIES.map((category) => (
                <section
                  key={category.id}
                  className={category.id === 'skillSet' ? 'profile-priority-card profile-priority-card--skills' : 'profile-priority-card'}
                >
                  <h3>{category.label}</h3>
                  <ul>
                    {selectedProfile[category.id].map((priority) => <li key={priority}>{priority}</li>)}
                  </ul>
                </section>
              ))}
            </div>

            <section className="profile-moments">
              <div className="profile-moment-tabs" role="tablist" aria-label={`${selectedProfile.positionName} responsibilities by Moment`}>
                {MOMENT_IDS.map((momentId, index) => {
                  const moment = PROFILE_MOMENT_LABELS[momentId]
                  const isActive = momentId === activeMomentId

                  return (
                    <button
                      key={momentId}
                      id={`profile-moment-tab-${momentId}`}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-controls="profile-moment-panel"
                      tabIndex={isActive ? 0 : -1}
                      className={isActive ? 'profile-moment-tab is-active' : 'profile-moment-tab'}
                      onClick={() => setActiveMomentId(momentId)}
                      onKeyDown={(event) => handleMomentKeyDown(event, index)}
                    >
                      <strong>{moment.short}</strong>
                      <span>{moment.full}</span>
                    </button>
                  )
                })}
              </div>

              <div
                id="profile-moment-panel"
                className="profile-moment-panel"
                role="tabpanel"
                aria-labelledby={`profile-moment-tab-${activeMomentId}`}
              >
                <div>
                  <span>{PROFILE_MOMENT_LABELS[activeMomentId].full}</span>
                  <ul>
                    {selectedProfile.moments[activeMomentId].map((responsibility) => (
                      <li key={responsibility}>{responsibility}</li>
                    ))}
                  </ul>
                </div>
                <p className="profile-evidence">
                  <strong>Training evidence:</strong> {selectedProfile.evidence[0].session} - {selectedProfile.evidence[0].focus}
                </p>
              </div>
            </section>
          </div>
        </article>
      </section>
    </PresentationLayout>
  )
}
