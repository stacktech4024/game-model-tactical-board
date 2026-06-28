import type {
  AuthoredScenarioArrow,
  PitchPoint,
  ScenarioArrow,
  ScenarioBallArrow,
  ScenarioDefinition,
} from '../scenarios/scenarioTypes'
import type {
  BallState,
  IntentEaseHint,
  PlayerState,
  ScenarioPlan,
  ScheduledAnimationIntent,
  TeamSide,
} from './worldTypes'

export type FormationPositions = Partial<Record<number, PitchPoint>>

const BALL_INTENT_ARROW_TYPES = new Set<ScenarioArrow['type']>(['pass', 'dribble', 'shot'])
export const VIA_SEGMENT_GAP = 0.16

// Distance-based duration replaces the old flat per-type constants
// (PASS_MOVE_DURATION/DRIBBLE_MOVE_DURATION/SHOT_MOVE_DURATION/PLAYER_MOVE_DURATION).
// Those produced identical durations regardless of how far an arrow actually
// traveled, so a 5m recovery shuffle and a 35m switch of play took the same
// time - short actions looked frozen, long actions looked like teleports.
//
// Each profile models a real-world speed in metres per second (pitch
// coordinates are already in metres, see pitchConstants.ts PITCH.LENGTH/WIDTH),
// with min/max clamps so very short moves don't feel instant and very long
// moves don't feel sluggish.
export type ArrowSpeedProfile = {
  speedMetersPerSecond: number
  minDurationSeconds: number
  maxDurationSeconds: number
}

// ~20 m/s is a brisk, controlled ground pass - between a short crisp lay-off
// and a hit long ball, well under max recorded pass speeds.
export const PASS_SPEED_PROFILE: ArrowSpeedProfile = {
  speedMetersPerSecond: 20,
  minDurationSeconds: 0.35,
  maxDurationSeconds: 1.4,
}

// Dribbling speed is the player-and-ball-together pace, well below a struck
// pass - roughly a controlled running pace with the ball at feet.
export const DRIBBLE_SPEED_PROFILE: ArrowSpeedProfile = {
  speedMetersPerSecond: 5,
  minDurationSeconds: 0.3,
  maxDurationSeconds: 2.5,
}

// ~28 m/s (100.8 km/h) sits just under the hardest strikes ever recorded
// (~30-35 m/s), giving headroom for the longer-range max clamp without ever
// implying a physically impossible shot speed.
export const SHOT_SPEED_PROFILE: ArrowSpeedProfile = {
  speedMetersPerSecond: 28,
  minDurationSeconds: 0.25,
  maxDurationSeconds: 0.9,
}

// ~6.5 m/s is a hard running pace for repositioning/pressing/recovering -
// quicker than a jog, below a flat-out sprint (human sprint top speed is
// ~12 m/s), which keeps short and long runs both inside a believable range.
export const PLAYER_SPEED_PROFILE: ArrowSpeedProfile = {
  speedMetersPerSecond: 6.5,
  minDurationSeconds: 0.4,
  maxDurationSeconds: 3.0,
}

function copyPoint(point: PitchPoint): PitchPoint {
  return { x: point.x, y: point.y }
}

function isBallArrow(arrow: AuthoredScenarioArrow): arrow is ScenarioBallArrow {
  return BALL_INTENT_ARROW_TYPES.has(arrow.type)
}

function getArrowSide(arrow: ScenarioArrow): TeamSide {
  return arrow.side ?? 'home'
}

function distanceBetween(a: PitchPoint, b: PitchPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

// Total straight-line path length for the arrow, including the via-point
// detour if present. This is the distance actually traveled on screen, not
// just the from->to displacement.
function getArrowPathDistance(arrow: ScenarioArrow): number {
  if (arrow.via) {
    return distanceBetween(arrow.from, arrow.via) + distanceBetween(arrow.via, arrow.to)
  }

  return distanceBetween(arrow.from, arrow.to)
}

function clampDuration(value: number, profile: ArrowSpeedProfile): number {
  return Math.min(profile.maxDurationSeconds, Math.max(profile.minDurationSeconds, value))
}

function getSpeedProfileForArrow(arrow: ScenarioArrow): ArrowSpeedProfile {
  switch (arrow.type) {
    case 'pass':
      return PASS_SPEED_PROFILE
    case 'dribble':
      return DRIBBLE_SPEED_PROFILE
    case 'shot':
      return SHOT_SPEED_PROFILE
    case 'run':
    case 'press':
    case 'recovery':
      return PLAYER_SPEED_PROFILE
  }
}

export function getArrowMoveDuration(arrow: ScenarioArrow): number {
  const profile = getSpeedProfileForArrow(arrow)
  const distance = getArrowPathDistance(arrow)

  return clampDuration(distance / profile.speedMetersPerSecond, profile)
}

// Mirrors the GSAP ease scenarioAnimator.ts applies for each arrow type, as
// descriptive metadata only - see the IntentEaseHint doc comment.
function getArrowEaseHint(arrow: ScenarioArrow): IntentEaseHint {
  switch (arrow.type) {
    case 'pass':
    case 'dribble':
      return 'power1.inOut'
    case 'shot':
      return 'power3.out'
    case 'run':
    case 'press':
    case 'recovery':
      return 'power2.inOut'
  }
}

function buildInitialPlayersForSide(
  side: TeamSide,
  formationPositions: FormationPositions,
): PlayerState[] {
  return Object.entries(formationPositions)
    .reduce<PlayerState[]>((players, [number, position]) => {
      if (!position) {
        return players
      }

      const playerNumber = Number(number)

      players.push({
        id: `${side}-${playerNumber}`,
        side,
        number: playerNumber,
        position: copyPoint(position),
      })

      return players
    }, [])
    .sort((a, b) => a.number - b.number)
}

function buildInitialPlayers(
  homeFormationPositions: FormationPositions,
  awayFormationPositions: FormationPositions = {},
): PlayerState[] {
  return [
    ...buildInitialPlayersForSide('home', homeFormationPositions),
    ...buildInitialPlayersForSide('away', awayFormationPositions),
  ]
}

function buildInitialBall(scenario: ScenarioDefinition): BallState | undefined {
  if (!scenario.ballStart) {
    return undefined
  }

  return {
    id: 'ball',
    position: copyPoint(scenario.ballStart),
  }
}

function buildAnimationIntents(scenario: ScenarioDefinition): ScheduledAnimationIntent[] {
  const orderedArrows = (scenario.arrows ?? [])
    .map((arrow, originalIndex) => ({ arrow, originalIndex }))
    .sort((a, b) => {
      const orderDiff =
        (a.arrow.order ?? Number.MAX_SAFE_INTEGER) -
        (b.arrow.order ?? Number.MAX_SAFE_INTEGER)

      if (orderDiff !== 0) {
        return orderDiff
      }

      return a.originalIndex - b.originalIndex
    })

  let currentTime = 0
  const scheduledArrows = orderedArrows.map(({ arrow }) => {
    const delay = arrow.delay ?? 0
    const duration = getArrowMoveDuration(arrow) + (arrow.via ? VIA_SEGMENT_GAP : 0)
    const startTime = currentTime + delay
    const endTime = startTime + duration

    currentTime = endTime

    return {
      arrow,
      timing: {
        startTime,
        endTime,
        duration,
        startProgress: 0,
        endProgress: 0,
      },
    }
  })
  const totalDuration = currentTime

  return scheduledArrows
    .map(({ arrow, timing }, sequenceIndex) => {
      const baseIntent = {
        id: `intent-${arrow.id}`,
        arrowId: arrow.id,
        arrowType: arrow.type,
        side: getArrowSide(arrow),
        playerNumber: arrow.playerNumber,
        from: copyPoint(arrow.from),
        via: arrow.via ? copyPoint(arrow.via) : undefined,
        to: copyPoint(arrow.to),
        order: arrow.order ?? Number.MAX_SAFE_INTEGER,
        delay: arrow.delay ?? 0,
        sequenceIndex,
        easeHint: getArrowEaseHint(arrow),
        timing: {
          ...timing,
          startProgress: totalDuration > 0 ? timing.startTime / totalDuration : 0,
          endProgress: totalDuration > 0 ? timing.endTime / totalDuration : 0,
        },
        label: arrow.label,
      }

      if (isBallArrow(arrow)) {
        if (arrow.releaseKind === 'player') {
          return {
            ...baseIntent,
            type: 'ball-movement',
            arrowType: arrow.type,
            releaseKind: 'player',
            releasedBy: { ...arrow.releasedBy },
          }
        }

        return {
          ...baseIntent,
          type: 'ball-movement',
          arrowType: arrow.type,
          releaseKind: 'loose-ball',
        }
      }

      return {
        ...baseIntent,
        type: 'player-movement',
        arrowType: arrow.type,
      }
    })
}

export function buildScenarioPlan(
  scenario: ScenarioDefinition,
  formationPositions: FormationPositions,
  awayFormationPositions?: FormationPositions,
): ScenarioPlan {
  return {
    scenarioId: scenario.id,
    title: scenario.title,
    moment: scenario.moment,
    initialPlayers: buildInitialPlayers(formationPositions, awayFormationPositions),
    initialBall: buildInitialBall(scenario),
    animationIntents: buildAnimationIntents(scenario),
    phaseSteps: scenario.phaseSteps.map((phaseStep) => ({
      id: phaseStep.id,
      label: phaseStep.label,
      coachingCue: phaseStep.coachingCue,
      keyPlayers: phaseStep.keyPlayers.map((number) => ({
        side: 'home',
        number,
      })),
      zoneFocus: [...phaseStep.zoneFocus],
      channelFocus: [...phaseStep.channelFocus],
      relatedArrows: [...(phaseStep.relatedArrows ?? [])],
    })),
  }
}
