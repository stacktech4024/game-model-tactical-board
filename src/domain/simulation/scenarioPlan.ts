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

const BALL_INTENT_ARROW_TYPES = new Set<ScenarioArrow['type']>(['pass', 'dribble', 'shot', 'cross', 'header'])
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

// ~17 m/s sits between tracking-data's measured average ground-pass speed
// (~16.2 m/s, Pfaff et al. 2022, Allsvenskan tracking data) and a firmly
// struck pass - closer to a typical pass than the original 20 m/s estimate.
export const PASS_SPEED_PROFILE: ArrowSpeedProfile = {
  speedMetersPerSecond: 17,
  minDurationSeconds: 0.35,
  maxDurationSeconds: 1.5,
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

// Two tiers replace the old single 6.5 m/s constant shared by every
// player-movement arrow. Match-tracking data shows most off-ball movement is
// a jog/run pace, not a sprint - a single flat speed made routine
// repositioning (run) look as urgent as a defensive recovery sprint.
//
// 'run' = positional/attacking movement (overlaps, off-ball repositioning,
// runs into space) - a purposeful run, not a sprint. ~5.5 m/s sits at the
// commonly used high-speed-running threshold (19.8 km/h).
export const RUN_SPEED_PROFILE: ArrowSpeedProfile = {
  speedMetersPerSecond: 5.5,
  minDurationSeconds: 0.4,
  maxDurationSeconds: 3.2,
}

// 'press' / 'recovery' = urgent defensive actions (closing down, recovery
// runs, tracking back) - meaningfully quicker than a regular run, closer to
// the ~7 m/s (25.2 km/h) sprint threshold used in match-physical-demands
// research, without exceeding realistic mean max sprint speed (~8.6-8.9 m/s).
export const PRESS_RECOVERY_SPEED_PROFILE: ArrowSpeedProfile = {
  speedMetersPerSecond: 7.5,
  minDurationSeconds: 0.3,
  maxDurationSeconds: 2.6,
}

function copyPoint(point: PitchPoint): PitchPoint {
  return { x: point.x, y: point.y }
}

// A lofted corner/out-swinging delivery hangs in the air far longer than a
// driven ground pass covers the same plan-view distance - the ball is
// travelling a curved 3D arc, not a straight line, even though the x/y path
// authored here is the same shape a flat pass would use. ~15 m/s and a much
// higher duration ceiling give the aerial-lift visual (see BallLayer) enough
// hang time to read clearly instead of resolving in well under a second.
export const CROSS_SPEED_PROFILE: ArrowSpeedProfile = {
  speedMetersPerSecond: 15,
  minDurationSeconds: 0.6,
  maxDurationSeconds: 2.5,
}

// A header is a touched/glanced redirect, not a fully-struck shot - meaningfully
// slower than SHOT_SPEED_PROFILE's firmly-struck-shot pace, but still a quick,
// decisive contact rather than a controlled pass.
export const HEADER_SPEED_PROFILE: ArrowSpeedProfile = {
  speedMetersPerSecond: 18,
  minDurationSeconds: 0.2,
  maxDurationSeconds: 1.0,
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
    case 'cross':
      return CROSS_SPEED_PROFILE
    case 'header':
      return HEADER_SPEED_PROFILE
    case 'run':
      return RUN_SPEED_PROFILE
    case 'press':
    case 'recovery':
      return PRESS_RECOVERY_SPEED_PROFILE
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
    case 'cross':
      return 'power1.inOut'
    case 'shot':
    case 'header':
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
  const scheduledArrows: Array<{
    arrow: AuthoredScenarioArrow
    originalIndex: number
    timing: {
      startTime: number
      endTime: number
      duration: number
      startProgress: number
      endProgress: number
    }
  }> = []
  const arrowsByOrder = new Map<number, typeof orderedArrows>()

  orderedArrows.forEach((item) => {
    const order = item.arrow.order ?? Number.MAX_SAFE_INTEGER
    const group = arrowsByOrder.get(order) ?? []

    group.push(item)
    arrowsByOrder.set(order, group)
  })

  // An order is a coordinated football action: the pass, supporting run,
  // pressure, cover, and balance movements in that order start together.
  // The next action waits for the slowest movement in the current group.
  arrowsByOrder.forEach((group) => {
    const groupStartTime = currentTime
    let groupEndTime = groupStartTime

    group.forEach(({ arrow, originalIndex }) => {
      const delay = arrow.delay ?? 0
      const duration = getArrowMoveDuration(arrow) + (arrow.via ? VIA_SEGMENT_GAP : 0)
      const startTime = groupStartTime + delay
      const endTime = startTime + duration

      groupEndTime = Math.max(groupEndTime, endTime)
      scheduledArrows.push({
        arrow,
        originalIndex,
        timing: {
          startTime,
          endTime,
          duration,
          startProgress: 0,
          endProgress: 0,
        },
      })
    })

    currentTime = groupEndTime
  })
  const totalDuration = currentTime

  return scheduledArrows
    .sort((a, b) => (
      a.timing.startTime - b.timing.startTime ||
      a.timing.endTime - b.timing.endTime ||
      a.originalIndex - b.originalIndex
    ))
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
  const animationIntents = buildAnimationIntents(scenario)
  const totalDuration = animationIntents.reduce(
    (maximum, intent) => Math.max(maximum, intent.timing.endTime),
    0,
  )
  const orderStartTimes = new Map<number, number>()

  animationIntents.forEach((intent) => {
    const existing = orderStartTimes.get(intent.order)

    orderStartTimes.set(
      intent.order,
      existing === undefined ? intent.timing.startTime : Math.min(existing, intent.timing.startTime),
    )
  })

  const rawPhaseStarts = scenario.phaseSteps.map((phaseStep, index) => {
    if (index === 0) {
      return 0
    }

    if (phaseStep.startOrder !== undefined) {
      return orderStartTimes.get(phaseStep.startOrder) ?? 0
    }

    const relatedArrowIds = new Set(phaseStep.relatedArrows ?? [])
    const relatedStarts = animationIntents
      .filter((intent) => relatedArrowIds.has(intent.arrowId))
      .map((intent) => intent.timing.startTime)

    return relatedStarts.length > 0 ? Math.min(...relatedStarts) : 0
  })
  const phaseStarts: number[] = []

  rawPhaseStarts.forEach((startTime, index) => {
    phaseStarts.push(index === 0 ? 0 : Math.max(startTime, phaseStarts[index - 1] ?? 0))
  })

  const phaseSteps = scenario.phaseSteps.map((phaseStep, index) => {
    const startTime = phaseStarts[index] ?? 0
    const endTime = phaseStarts[index + 1] ?? totalDuration

    return {
      id: phaseStep.id,
      label: phaseStep.label,
      coachingCue: phaseStep.coachingCue,
      keyPlayers: phaseStep.keyPlayers.map((number) => ({
        side: 'home' as const,
        number,
      })),
      zoneFocus: [...phaseStep.zoneFocus],
      channelFocus: [...phaseStep.channelFocus],
      relatedArrows: [...(phaseStep.relatedArrows ?? [])],
      playerOrientations: (phaseStep.playerOrientations ?? []).map((orientation) => ({
        side: orientation.side ?? 'home',
        playerNumber: orientation.playerNumber,
        facingAngle: orientation.facingAngle,
      })),
      timing: {
        startTime,
        endTime,
        startProgress: totalDuration > 0 ? startTime / totalDuration : 0,
        endProgress: totalDuration > 0 ? endTime / totalDuration : 1,
      },
    }
  })

  return {
    scenarioId: scenario.id,
    title: scenario.title,
    moment: scenario.moment,
    initialPlayers: buildInitialPlayers(formationPositions, awayFormationPositions),
    initialBall: buildInitialBall(scenario),
    animationIntents,
    phaseSteps,
  }
}

export function getScenarioPlanTotalDuration(plan: ScenarioPlan): number {
  return plan.animationIntents.reduce(
    (maximum, intent) => Math.max(maximum, intent.timing.endTime),
    0,
  )
}

export function getPhaseStepIndexAtProgress(plan: ScenarioPlan, progress: number): number {
  if (plan.phaseSteps.length === 0) {
    return 0
  }

  const clampedProgress = Math.min(1, Math.max(0, progress))
  // GSAP can report a value a few floating-point units below the progress
  // supplied to timeline.progress(). Treat that value as the authored phase
  // boundary so explicit Previous/Next navigation cannot remain one step behind.
  const boundaryProgress = clampedProgress + 0.000001
  let activeIndex = 0

  plan.phaseSteps.forEach((phaseStep, index) => {
    if (boundaryProgress >= phaseStep.timing.startProgress) {
      activeIndex = index
    }
  })

  return activeIndex
}
