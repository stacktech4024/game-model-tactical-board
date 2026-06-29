import { useMemo, useState } from 'react'
import { PICKERING_SQUAD } from '../../data/squad'
import type { SquadPlayer } from '../../domain/players/playerTypes'
import { PresentationLayout } from '../PresentationLayout'
import { POSITIONAL_PROFILES } from '../data/positionalProfiles'
import type { PositionalProfile } from '../data/positionalProfiles'

type PositionalProfileGroup = 'GK' | 'CB' | 'FB' | 'CDM' | 'CAM' | 'WF' | 'ST'

const PLAYER_LAYOUT_CLASS_BY_NUMBER: Record<number, string> = {
  1: 'players-board__spot--gk',
  2: 'players-board__spot--rb',
  3: 'players-board__spot--lb',
  4: 'players-board__spot--rcb',
  5: 'players-board__spot--lcb',
  6: 'players-board__spot--cdm',
  7: 'players-board__spot--rw',
  8: 'players-board__spot--cm',
  9: 'players-board__spot--st',
  10: 'players-board__spot--cam',
  11: 'players-board__spot--lw',
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

  return (
    <PresentationLayout pageId="players" noPadding>
      <p className="presentation-eyebrow">Section 3 - the who</p>
      <h1 className="presentation-title">Player roles</h1>
      <p className="presentation-body">
        Select a shirt number to connect the player to their role profile in and out of possession.
      </p>

      <section className="players-lab">
        <div className="players-board" aria-label="Pickering squad numbers">
          {players.map((player) => {
            const isActive = player.number === selectedPlayerNumber

            return (
              <button
                key={player.id}
                type="button"
                className={[
                  'players-board__spot',
                  PLAYER_LAYOUT_CLASS_BY_NUMBER[player.number],
                  isActive ? 'is-active' : '',
                ].join(' ')}
                aria-pressed={isActive}
                onClick={() => setSelectedPlayerNumber(player.number)}
              >
                <span>{player.number}</span>
              </button>
            )
          })}
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
