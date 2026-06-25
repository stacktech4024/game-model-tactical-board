import type { PitchPoint } from '../scenarios/scenarioTypes'
import type {
  BallState,
  IntentPlaybackState,
  PlannedPhaseStep,
  PlayerReference,
  PlayerState,
  ScenarioPlan,
  ScheduledAnimationIntent,
  SnapshotAnimationIntent,
  WorldSnapshot,
} from './worldTypes'

function clampProgress(progress: number): number {
  return Math.min(1, Math.max(0, progress))
}

function copyPoint(point: PitchPoint): PitchPoint {
  return { x: point.x, y: point.y }
}

function copyPlayerReference(player: PlayerReference): PlayerReference {
  return {
    side: player.side,
    number: player.number,
  }
}

function copyPlayerState(player: PlayerState): PlayerState {
  return {
    id: player.id,
    side: player.side,
    number: player.number,
    position: copyPoint(player.position),
  }
}

function copyBallState(ball: BallState): BallState {
  return {
    id: ball.id,
    position: copyPoint(ball.position),
  }
}

function copyPhaseStep(phaseStep: PlannedPhaseStep): PlannedPhaseStep {
  return {
    id: phaseStep.id,
    label: phaseStep.label,
    coachingCue: phaseStep.coachingCue,
    keyPlayers: phaseStep.keyPlayers.map(copyPlayerReference),
    zoneFocus: [...phaseStep.zoneFocus],
    channelFocus: [...phaseStep.channelFocus],
    relatedArrows: [...phaseStep.relatedArrows],
  }
}

function getIntentPlaybackState(
  intent: ScheduledAnimationIntent,
  progress: number,
): IntentPlaybackState {
  if (progress < intent.timing.startProgress) {
    return 'pending'
  }

  if (progress > intent.timing.endProgress) {
    return 'completed'
  }

  return 'active'
}

function copyAnimationIntent(
  intent: ScheduledAnimationIntent,
  progress: number,
): SnapshotAnimationIntent {
  return {
    id: intent.id,
    arrowId: intent.arrowId,
    type: intent.type,
    arrowType: intent.arrowType,
    side: intent.side,
    playerNumber: intent.playerNumber,
    from: copyPoint(intent.from),
    via: intent.via ? copyPoint(intent.via) : undefined,
    to: copyPoint(intent.to),
    order: intent.order,
    delay: intent.delay,
    sequenceIndex: intent.sequenceIndex,
    timing: {
      startTime: intent.timing.startTime,
      endTime: intent.timing.endTime,
      duration: intent.timing.duration,
      startProgress: intent.timing.startProgress,
      endProgress: intent.timing.endProgress,
    },
    playbackState: getIntentPlaybackState(intent, progress),
    label: intent.label,
  }
}

function getActivePhaseStep(
  phaseSteps: PlannedPhaseStep[],
  progress: number,
): PlannedPhaseStep | undefined {
  if (phaseSteps.length === 0) {
    return undefined
  }

  const activeIndex = Math.round(progress * (phaseSteps.length - 1))

  return phaseSteps[activeIndex]
}

export function getWorldSnapshotAtProgress(
  plan: ScenarioPlan,
  progress: number,
): WorldSnapshot {
  const clampedProgress = clampProgress(progress)
  const activePhaseStep = getActivePhaseStep(plan.phaseSteps, clampedProgress)
  const copiedActivePhaseStep = activePhaseStep ? copyPhaseStep(activePhaseStep) : undefined

  return {
    scenarioId: plan.scenarioId,
    title: plan.title,
    moment: plan.moment,
    clock: {
      elapsedSeconds: 0,
      progress: clampedProgress,
    },
    players: plan.initialPlayers.map(copyPlayerState),
    ball: plan.initialBall ? copyBallState(plan.initialBall) : undefined,
    activePhaseStep: copiedActivePhaseStep,
    focus: {
      keyPlayers: copiedActivePhaseStep?.keyPlayers.map(copyPlayerReference) ?? [],
      zoneFocus: [...(copiedActivePhaseStep?.zoneFocus ?? [])],
      channelFocus: [...(copiedActivePhaseStep?.channelFocus ?? [])],
      relatedArrows: [...(copiedActivePhaseStep?.relatedArrows ?? [])],
    },
    animationIntents: plan.animationIntents.map((intent) => (
      copyAnimationIntent(intent, clampedProgress)
    )),
  }
}
