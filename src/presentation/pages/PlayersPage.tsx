import { useMemo, useState } from 'react'
import { PICKERING_SQUAD } from '../../data/squad'
import type { SquadPlayer } from '../../domain/players/playerTypes'
import { PresentationLayout } from '../PresentationLayout'
import { POSITIONAL_PROFILES } from '../data/positionalProfiles'
import type { PositionalProfile } from '../data/positionalProfiles'
import { FORMATION_POSITIONS } from '../../data/formations'
import { PITCH } from '../../domain/pitch/pitchConstants'
import { pitchToScreen } from '../../domain/pitch/coordTransforms'
import { PixiPitchPreview, PITCH_PADDING } from '../../renderers/pixi/PixiPitchPreview'

type PositionalProfileGroup = 'GK' | 'CB' | 'FB' | 'CDM' | 'CAM' | 'WF' | 'ST'

const BOARD_WIDTH = 480
const BOARD_HEIGHT = 741

// Resting 1-4-1-2-3 shape, reusing the same real formation data the
// tactical board itself uses - keeps this page's pitch geometry consistent
// with everywhere else instead of inventing a separate layout. #6 sits
// alone as the deep pivot, #8/#10 as the two midfielders ahead of him,
// #7/#9/#11 across the front three.
const REST_FORMATION = FORMATION_POSITIONS['attacking-433']

// How far in front of a selected player (in pitch metres, toward the
// attacking goal) the ball sits - just enough to read as "at his feet"
// rather than dead-center on the shirt number.
const BALL_OFFSET_METERS = 1.6

const CENTER_SPOT = { x: PITCH.WIDTH / 2, y: PITCH.LENGTH / 2 }

function pitchToPercentage(point: { x: number; y: number }) {
  return {
    x: (point.x / PITCH.WIDTH) * 100,
    y: ((PITCH.LENGTH - point.y) / PITCH.LENGTH) * 100,
  }
}

function getProfileGroup(position: string): PositionalProfileGroup {
  if (position === 'RB' || position === 'LB') {
    return 'FB'
  }

  if (position === 'RW' || position === 'LW') {
    return 'WF'
  }

  if (position === 'CM') {
    return 'CDM'
  }

  return position as PositionalProfileGroup
}

function getProfileForPlayer(player: SquadPlayer): PositionalProfile {
  const profileGroup = getProfileGroup(player.position)
  const profile = POSITIONAL_PROFILES.find((item) => item.position === profileGroup)

  if (!profile) {
    throw new Error(`No positional profile found for ${player.position}`)
  }

  return profile
}

export function PlayersPage() {
  const [selectedPlayerNumber, setSelectedPlayerNumber] = useState<number | null>(null)
  const players = useMemo(
    () => [...PICKERING_SQUAD].sort((first, second) => first.number - second.number),
    [],
  )
  const selectedPlayer = players.find((player) => player.number === selectedPlayerNumber) ?? null
  const selectedProfile = selectedPlayer ? getProfileForPlayer(selectedPlayer) : null

  // PixiPitchPreview infers each token's displayed shirt number from this
  // array's index (index 0 -> #1, index 1 -> #2, ...), so the squad must be
  // provided in strict number order for the rendered numbers to be correct.
  const pixiPlayers = useMemo(
    () =>
      players.map((player) => {
        const position = REST_FORMATION[player.number]
        const percentage = pitchToPercentage(position)

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

  const ballPosition = useMemo(() => {
    const formationSpot = selectedPlayerNumber ? REST_FORMATION[selectedPlayerNumber] : null

    if (!formationSpot) {
      return pitchToPercentage(CENTER_SPOT)
    }

    return pitchToPercentage({
      x: formationSpot.x,
      y: Math.min(PITCH.LENGTH, formationSpot.y + BALL_OFFSET_METERS),
    })
  }, [selectedPlayerNumber])

  const overlaySpots = useMemo(
    () =>
      players.map((player) => {
        const position = REST_FORMATION[player.number]
        const screen = pitchToScreen(position.x, position.y, BOARD_WIDTH, BOARD_HEIGHT, PITCH_PADDING)

        return { player, screen }
      }),
    [players],
  )

  return (
    <PresentationLayout pageId="players" noPadding>
      <p className="presentation-eyebrow">Section 3 - the who</p>
      <h1 className="presentation-title">Player roles</h1>
      <p className="presentation-body">
        Select a shirt number to connect the player to their role profile in and out of possession.
      </p>

      <section className="players-lab">
        <div className="players-board" aria-label="Pickering squad numbers">
          <div className="players-board__canvas" style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT }}>
            <PixiPitchPreview width={BOARD_WIDTH} height={BOARD_HEIGHT} players={pixiPlayers} ballPosition={ballPosition} />
            {overlaySpots.map(({ player, screen }) => {
              const isActive = player.number === selectedPlayerNumber

              return (
                <button
                  key={player.id}
                  type="button"
                  className={['players-board__spot', isActive ? 'is-active' : ''].join(' ')}
                  style={{ left: screen.sx, top: screen.sy }}
                  aria-pressed={isActive}
                  aria-label={`#${player.number} ${player.name}, ${player.position}`}
                  onClick={() => setSelectedPlayerNumber(player.number)}
                />
              )
            })}
          </div>
        </div>

        <aside className="players-detail" aria-live="polite">
          {selectedPlayer && selectedProfile ? (
            <>
              <span>{selectedProfile.fullName} role</span>
              <h2>
                #{selectedPlayer.number} {selectedPlayer.name} - {selectedPlayer.position}
              </h2>
              <p><strong>Style:</strong> {selectedProfile.style}</p>
              <p><strong>In possession:</strong> {selectedProfile.attackingOrg}</p>
              <p><strong>Out of possession:</strong> {selectedProfile.defensiveOrg}</p>
              <div className="players-detail__traits" aria-label={`${selectedProfile.fullName} key qualities`}>
                {selectedProfile.traits.map((trait) => (
                  <div key={trait.label} className="players-detail__trait">
                    <span className="players-detail__trait-icon" aria-hidden="true">
                      {trait.icon}
                    </span>
                    <span className="players-detail__trait-label">{trait.label}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <span>Squad role profile</span>
              <h2>Select a player number to see their role.</h2>
              <p>
                The profile panel uses the squad's specific position and maps it to the shared
                positional role library.
              </p>
            </>
          )}
        </aside>
      </section>
    </PresentationLayout>
  )
}
