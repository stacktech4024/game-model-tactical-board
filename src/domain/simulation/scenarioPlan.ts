import type {
  PitchPoint,
  ScenarioArrow,
  ScenarioDefinition,
} from '../scenarios/scenarioTypes'
import type {
  AnimationIntentType,
  BallState,
  IntentEaseHint,
  PlayerState,
  ScenarioPlan,
  ScheduledAnimationIntent,
  TeamSide,
} from './worldTypes'

export type FormationPositions = Partial<Record<number, PitchPoint>>

const BALL_INTENT_ARROW_TYPES = new Set<ScenarioArrow['type']>(['pass', 'dribble', 'shot'])
const PLAYER_INTENT_ARROW_TYPES = new Set<ScenarioArrow['type']>(['run', 'press', 'recovery'])
const PASS_MOVE_DURATION = 0.7
const DRIBBLE_MOVE_DURATION = 0.7
const SHOT_MOVE_DURATION = 0.4
const PLAYER_MOVE_DURATION = 1.15
export const VIA_SEGMENT_GAP = 0.16

function copyPoint(point: PitchPoint): PitchPoint {
  return { x: point.x, y: point.y }
}

function getIntentType(arrow: ScenarioArrow): AnimationIntentType {
  if (BALL_INTENT_ARROW_TYPES.has(arrow.type)) {
    return 'ball-movement'
  }

  if (PLAYER_INTENT_ARROW_TYPES.has(arrow.type)) {
    return 'player-movement'
  }

  return 'player-movement'
}

function getArrowSide(arrow: ScenarioArrow): TeamSide {
  return arrow.side ?? 'home'
}

function getArrowMoveDuration(arrow: ScenarioArrow): number {
  switch (arrow.type) {
    case 'pass':
      return PASS_MOVE_DURATION
    case 'dribble':
      return DRIBBLE_MOVE_DURATION
    case 'shot':
      return SHOT_MOVE_DURATION
    case 'run':
    case 'press':
    case 'recovery':
      return PLAYER_MOVE_DURATION
  }
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
    .map(({ arrow, timing }, sequenceIndex) => ({
      id: `intent-${arrow.id}`,
      arrowId: arrow.id,
      type: getIntentType(arrow),
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
      releasedBy: arrow.releasedBy ? { ...arrow.releasedBy } : undefined,
      timing: {
        ...timing,
        startProgress: totalDuration > 0 ? timing.startTime / totalDuration : 0,
        endProgress: totalDuration > 0 ? timing.endTime / totalDuration : 0,
      },
      label: arrow.label,
    }))
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
