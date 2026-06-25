import type {
  PitchPoint,
  ScenarioArrow,
  ScenarioDefinition,
} from '../scenarios/scenarioTypes'
import type {
  AnimationIntent,
  AnimationIntentType,
  BallState,
  PlayerState,
  ScenarioPlan,
  TeamSide,
} from './worldTypes'

export type FormationPositions = Partial<Record<number, PitchPoint>>

const BALL_INTENT_ARROW_TYPES = new Set<ScenarioArrow['type']>(['pass', 'dribble', 'shot'])
const PLAYER_INTENT_ARROW_TYPES = new Set<ScenarioArrow['type']>(['run', 'press', 'recovery'])

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

function buildInitialPlayers(formationPositions: FormationPositions): PlayerState[] {
  return Object.entries(formationPositions)
    .reduce<PlayerState[]>((players, [number, position]) => {
      if (!position) {
        return players
      }

      const playerNumber = Number(number)

      players.push({
        id: `home-${playerNumber}`,
        side: 'home',
        number: playerNumber,
        position: copyPoint(position),
      })

      return players
    }, [])
    .sort((a, b) => a.number - b.number)
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

function buildAnimationIntents(scenario: ScenarioDefinition): AnimationIntent[] {
  return (scenario.arrows ?? [])
    .map((arrow, originalIndex) => ({ arrow, originalIndex }))
    .sort((a, b) => {
      const orderDiff = (a.arrow.order ?? 0) - (b.arrow.order ?? 0)

      if (orderDiff !== 0) {
        return orderDiff
      }

      return a.originalIndex - b.originalIndex
    })
    .map(({ arrow }, sequenceIndex) => ({
      id: `intent-${arrow.id}`,
      arrowId: arrow.id,
      type: getIntentType(arrow),
      arrowType: arrow.type,
      side: getArrowSide(arrow),
      playerNumber: arrow.playerNumber,
      from: copyPoint(arrow.from),
      via: arrow.via ? copyPoint(arrow.via) : undefined,
      to: copyPoint(arrow.to),
      order: arrow.order ?? 0,
      delay: arrow.delay ?? 0,
      sequenceIndex,
      label: arrow.label,
    }))
}

export function buildScenarioPlan(
  scenario: ScenarioDefinition,
  formationPositions: FormationPositions,
): ScenarioPlan {
  return {
    scenarioId: scenario.id,
    title: scenario.title,
    moment: scenario.moment,
    initialPlayers: buildInitialPlayers(formationPositions),
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
