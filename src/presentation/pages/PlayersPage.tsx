import { useMemo, useState } from 'react'
import { FULLBACK_WIDE_CHANNEL_OVERLAP_SCENARIO } from '../../data/fullbackWideChannelOverlapScenario'
import { PICKERING_SQUAD } from '../../data/squad'
import type { SquadPlayer } from '../../domain/players/playerTypes'
import { PresentationLayout } from '../PresentationLayout'
import { POSITIONAL_PROFILES } from '../data/positionalProfiles'
import type { PositionalProfile } from '../data/positionalProfiles'
import { FORMATION_POSITIONS, OPPOSITION_POSITIONS } from '../../data/formations'
import { PITCH } from '../../domain/pitch/pitchConstants'
import { pitchToScreen } from '../../domain/pitch/coordTransforms'
import type { ScenarioArrow, ScenarioDefinition, ScenarioPlayerArrowType } from '../../domain/scenarios/scenarioTypes'
import {
  PixiPitchPreview,
  PITCH_PADDING,
  type PixiPitchPreviewRoute,
  type PixiPitchPreviewStep,
} from '../../renderers/pixi/PixiPitchPreview'

type PositionalProfileGroup = 'GK' | 'CB' | 'FB' | 'CDM' | 'CAM' | 'WF' | 'ST'

const BOARD_WIDTH = 480
const BOARD_HEIGHT = 741
const FULLBACK_PREVIEW_PLAYERS = [
  { side: 'home' as const, number: 7 },
  { side: 'home' as const, number: 2 },
  { side: 'home' as const, number: 10 },
  { side: 'home' as const, number: 9 },
  { side: 'away' as const, number: 3 },
  { side: 'away' as const, number: 6 },
  { side: 'away' as const, number: 5 },
]
const PLAYER_ARROW_TYPES: ScenarioPlayerArrowType[] = ['run', 'press', 'recovery']

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

function getScenarioArrow(scenario: ScenarioDefinition, arrowId: string): ScenarioArrow {
  const arrow = scenario.arrows?.find((item) => item.id === arrowId)

  if (!arrow) {
    throw new Error(`Missing ${scenario.id} arrow: ${arrowId}`)
  }

  return arrow
}

function getScenarioPlayerId(side: 'home' | 'away', number: number) {
  return `${side}-${number}`
}

function getScenarioPlayerStart(
  scenario: ScenarioDefinition,
  side: 'home' | 'away',
  number: number,
) {
  const authoredMovement = scenario.arrows?.find((arrow) => {
    const arrowSide = arrow.side ?? 'home'

    return arrowSide === side && arrow.playerNumber === number && PLAYER_ARROW_TYPES.includes(arrow.type as ScenarioPlayerArrowType)
  })

  if (authoredMovement) {
    return authoredMovement.from
  }

  const formation = side === 'home'
    ? FORMATION_POSITIONS[scenario.formationMode]
    : OPPOSITION_POSITIONS[scenario.formationMode]

  return formation[number]
}

function buildFullbackScenarioPreview(scenario: ScenarioDefinition) {
  const overlap = getScenarioArrow(scenario, 'fullback-overlap-run')
  const tenLate = getScenarioArrow(scenario, 'wide-overlap-ten-late-arrival')
  const nearPost = getScenarioArrow(scenario, 'wide-overlap-nine-near-post')
  const cutback = getScenarioArrow(scenario, 'wide-overlap-cutback-to-ten')
  const finish = getScenarioArrow(scenario, 'wide-overlap-ten-finish')

  const steps: PixiPitchPreviewStep[] = [
    {
      id: 'hold-width',
      cue: '#7 holds the wide channel',
      emphasizePlayerId: getScenarioPlayerId('home', 7),
      duration: 0.22,
    },
    {
      id: 'overlap',
      cue: '#2 overlaps from deep',
      playerId: getScenarioPlayerId('home', 2),
      playerTo: pitchToPercentage(overlap.to),
      duration: 0.68,
    },
    {
      id: 'late-arrival',
      cue: '#10 arrives late; #9 attacks near post',
      playerId: getScenarioPlayerId('home', 10),
      playerTo: pitchToPercentage(tenLate.to),
      playerMoves: [{ playerId: getScenarioPlayerId('home', 9), to: pitchToPercentage(nearPost.to) }],
      duration: 0.56,
    },
    {
      id: 'cutback',
      cue: 'Cutback into the late runner',
      ballFrom: pitchToPercentage(cutback.from),
      ballTo: pitchToPercentage(cutback.to),
      duration: 0.52,
    },
    {
      id: 'finish',
      cue: '#10 finishes; #9 remains the secondary option',
      ballFrom: pitchToPercentage(finish.from),
      ballTo: pitchToPercentage(finish.to),
      emphasizePlayerId: getScenarioPlayerId('home', 10),
      duration: 0.42,
    },
  ]

  const routes: PixiPitchPreviewRoute[] = (scenario.arrows ?? [])
    .filter((arrow) => arrow.type !== 'shot')
    .map((arrow) => ({
      id: arrow.id,
      from: pitchToPercentage(arrow.from),
      to: pitchToPercentage(arrow.to),
      type: arrow.type as PixiPitchPreviewRoute['type'],
      revealOnStepId:
        arrow.id === 'fullback-overlap-run' || arrow.id === 'wide-overlap-away-three-delay'
          ? 'overlap'
          : arrow.id === 'wide-overlap-ten-late-arrival'
            || arrow.id === 'wide-overlap-nine-near-post'
            || arrow.id === 'wide-overlap-away-six-screen'
            || arrow.id === 'wide-overlap-away-five-track-nine'
            ? 'late-arrival'
            : 'cutback',
    }))

  return {
    players: FULLBACK_PREVIEW_PLAYERS.map((player) => {
      const start = getScenarioPlayerStart(scenario, player.side, player.number)
      const percentage = pitchToPercentage(start)

      return {
        id: getScenarioPlayerId(player.side, player.number),
        label: player.side === 'home' ? `#${player.number}` : `A${player.number}`,
        x: percentage.x,
        y: percentage.y,
        tone: player.side === 'away' ? ('opponent' as const) : ('primary' as const),
      }
    }),
    ballPosition: pitchToPercentage(scenario.ballStart ?? CENTER_SPOT),
    steps,
    routes,
    caption: scenario.description,
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
  const [isFullbackScenarioOpen, setIsFullbackScenarioOpen] = useState(false)
  const [fullbackScenarioCue, setFullbackScenarioCue] = useState('#7 holds the wide channel')
  const players = useMemo(
    () => [...PICKERING_SQUAD].sort((first, second) => first.number - second.number),
    [],
  )
  const fullbackScenario = FULLBACK_WIDE_CHANNEL_OVERLAP_SCENARIO
  const fullbackScenarioPreview = useMemo(
    () => buildFullbackScenarioPreview(fullbackScenario),
    [fullbackScenario],
  )
  const selectedPlayer = players.find((player) => player.number === selectedPlayerNumber) ?? null
  const selectedProfile = selectedPlayer ? getProfileForPlayer(selectedPlayer) : null
  const showFullbackScenario = selectedProfile?.position === 'FB'

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
              {showFullbackScenario && (
                <button
                  type="button"
                  className="presentation-diagram-card presentation-diagram-card--button"
                  onClick={() => {
                    setFullbackScenarioCue('#7 holds the wide channel')
                    setIsFullbackScenarioOpen(true)
                  }}
                >
                  <div style={{ display: 'grid', minHeight: 250, placeItems: 'center' }}>
                    <PixiPitchPreview
                      width={160}
                      height={247}
                      players={fullbackScenarioPreview.players}
                      ballPosition={fullbackScenarioPreview.ballPosition}
                      routes={fullbackScenarioPreview.routes}
                    />
                  </div>
                  <span className="presentation-diagram-card__caption">
                    {fullbackScenario.title}
                  </span>
                </button>
              )}
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

      {isFullbackScenarioOpen && fullbackScenario && fullbackScenarioPreview && (
        <div
          className="diagram-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`${fullbackScenario.momentOfGame} details`}
        >
          <button
            type="button"
            className="diagram-modal__backdrop"
            aria-label="Close diagram details"
            onClick={() => setIsFullbackScenarioOpen(false)}
          />
          <section className="diagram-modal__panel">
            <button
              type="button"
              className="diagram-modal__close"
              aria-label="Close diagram details"
              onClick={() => setIsFullbackScenarioOpen(false)}
            >
              Close
            </button>
            <div
              className="transition-modal-pitch"
              style={{ display: 'grid', placeItems: 'center', overflow: 'hidden' }}
            >
              <div className="transition-modal-pitch__preview">
                <PixiPitchPreview
                  width={480}
                  height={741}
                  players={fullbackScenarioPreview.players}
                  ballPosition={fullbackScenarioPreview.ballPosition}
                  steps={fullbackScenarioPreview.steps}
                  routes={fullbackScenarioPreview.routes}
                  repeatDelay={1.1}
                  onCueChange={setFullbackScenarioCue}
                />
                <div className="mini-pitch__cue" aria-live="polite">
                  {fullbackScenarioCue}
                </div>
                <div className="mini-pitch__caption">
                  {fullbackScenarioPreview.caption}
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
            </div>
            <div className="diagram-modal__content">
              <span>Moment of the Game: {fullbackScenario.momentOfGame}</span>
              <h2>{fullbackScenario.system.shape}</h2>
              <p><strong>System:</strong> {fullbackScenario.system.description}</p>
              <p><strong>Field Geography:</strong> {fullbackScenario.fieldGeography.description}</p>
              <p><strong>Strategy:</strong> {fullbackScenario.strategy}</p>
              <div>
                <strong>Tactics</strong>
                <div className="presentation-chip-row">
                  {fullbackScenario.tactics.map((tactic) => (
                    <span key={tactic} className="presentation-chip presentation-chip--small">
                      {tactic}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <strong>Skill Set</strong>
                <div className="presentation-chip-row">
                  {fullbackScenario.skillSet.map((skill) => (
                    <span key={skill} className="presentation-chip presentation-chip--small">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <p><strong>Key coaching point:</strong> {fullbackScenario.phaseSteps[0]?.coachingCue}</p>
            </div>
          </section>
        </div>
      )}
    </PresentationLayout>
  )
}
