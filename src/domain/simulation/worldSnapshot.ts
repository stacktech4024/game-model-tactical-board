import type { PitchPoint } from '../scenarios/scenarioTypes'
import { VIA_SEGMENT_GAP } from './scenarioPlan.ts'
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

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function copyPoint(point: PitchPoint): PitchPoint {
  return { x: point.x, y: point.y }
}

function interpolatePitchPoint(from: PitchPoint, to: PitchPoint, t: number): PitchPoint {
  const clampedT = clamp01(t)

  return {
    x: from.x + (to.x - from.x) * clampedT,
    y: from.y + (to.y - from.y) * clampedT,
  }
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

function getIntentPosition(
  intent: ScheduledAnimationIntent,
  progress: number,
  totalDuration: number,
): PitchPoint {
  if (progress >= intent.timing.endProgress) {
    return copyPoint(intent.to)
  }

  const absoluteTime = progress * totalDuration
  const elapsedTime = absoluteTime - intent.timing.startTime

  if (!intent.via) {
    return interpolatePitchPoint(intent.from, intent.to, elapsedTime / intent.timing.duration)
  }

  const movementDuration = Math.max(0, intent.timing.duration - VIA_SEGMENT_GAP)
  const segmentDuration = movementDuration / 2

  if (segmentDuration === 0) {
    return copyPoint(intent.to)
  }

  if (elapsedTime <= segmentDuration) {
    return interpolatePitchPoint(intent.from, intent.via, elapsedTime / segmentDuration)
  }

  if (elapsedTime <= segmentDuration + VIA_SEGMENT_GAP) {
    return copyPoint(intent.via)
  }

  return interpolatePitchPoint(
    intent.via,
    intent.to,
    (elapsedTime - segmentDuration - VIA_SEGMENT_GAP) / segmentDuration,
  )
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
    releaseKind: intent.releaseKind,
    releasedBy: intent.releasedBy ? { ...intent.releasedBy } : undefined,
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

function getTotalDuration(intents: ScheduledAnimationIntent[]): number {
  return intents.at(-1)?.timing.endTime ?? 0
}

function applyIntentPositions(
  players: PlayerState[],
  ball: BallState | undefined,
  intents: ScheduledAnimationIntent[],
  progress: number,
): {
  players: PlayerState[]
  ball?: BallState
} {
  const totalDuration = getTotalDuration(intents)
  let currentBall = ball
  const playersByKey = new Map(
    players.map((player) => [`${player.side}-${player.number}`, player]),
  )

  intents.forEach((intent) => {
    const playbackState = getIntentPlaybackState(intent, progress)

    if (playbackState === 'pending') {
      return
    }

    // Domain snapshots use linear pitch-coordinate interpolation. GSAP easing
    // remains a renderer/playback adapter concern for now.
    const nextPosition = getIntentPosition(intent, progress, totalDuration)

    if (intent.type === 'ball-movement') {
      currentBall = {
        id: currentBall?.id ?? 'ball',
        position: nextPosition,
      }
      return
    }

    if (intent.playerNumber === undefined) {
      return
    }

    const player = playersByKey.get(`${intent.side}-${intent.playerNumber}`)

    if (!player) {
      return
    }

    player.position = nextPosition
  })

  return {
    players,
    ball: currentBall,
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
  const totalDuration = getTotalDuration(plan.animationIntents)
  const positionedState = applyIntentPositions(
    plan.initialPlayers.map(copyPlayerState),
    plan.initialBall ? copyBallState(plan.initialBall) : undefined,
    plan.animationIntents,
    clampedProgress,
  )

  return {
    scenarioId: plan.scenarioId,
    title: plan.title,
    moment: plan.moment,
    clock: {
      elapsedSeconds: clampedProgress * totalDuration,
      progress: clampedProgress,
    },
    players: positionedState.players,
    ball: positionedState.ball,
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
