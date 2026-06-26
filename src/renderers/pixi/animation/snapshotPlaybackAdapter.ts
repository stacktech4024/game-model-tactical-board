import { pitchToScreen } from '../../../domain/pitch/coordTransforms.ts'
import { getWorldSnapshotAtProgress } from '../../../domain/simulation/worldSnapshot.ts'
import type { ScenarioPlan, TeamSide } from '../../../domain/simulation/worldTypes.ts'

export type BallPlaybackTween = {
  targetScreenPosition: { sx: number; sy: number }
  durationSeconds: number
  ease: string
}

export type PlayerPlaybackTween = {
  targetScreenPosition: { sx: number; sy: number }
  durationSeconds: number
  ease: string
}

// worldTypes.ts has no easeHint field on AnimationIntent - ease is not part
// of the domain layer yet. This mirrors scenarioAnimator.ts's existing
// shot/non-shot ease split (the only ease distinction ball arrows have today)
// rather than reading a field that doesn't exist.
const SHOT_BALL_EASE = 'power3.out'
const DEFAULT_BALL_EASE = 'power1.inOut'
const DEFAULT_PLAYER_EASE = 'power2.inOut'

export function getBallPlaybackTween(
  plan: ScenarioPlan,
  progressNow: number,
  progressTarget: number,
  canvasW: number,
  canvasH: number,
  padding: number,
): BallPlaybackTween | undefined {
  const ballIntents = plan.animationIntents.filter((intent) => intent.type === 'ball-movement')

  if (ballIntents.length === 0) {
    return undefined
  }

  const snapshot = getWorldSnapshotAtProgress(plan, progressTarget)

  if (!snapshot.ball) {
    return undefined
  }

  const targetScreenPosition = pitchToScreen(
    snapshot.ball.position.x,
    snapshot.ball.position.y,
    canvasW,
    canvasH,
    padding,
  )
  const totalDuration = plan.animationIntents.at(-1)?.timing.endTime ?? 0
  const activeBallIntent = ballIntents.find((intent) => (
    progressTarget >= intent.timing.startProgress &&
    progressTarget <= intent.timing.endProgress
  ))

  const ease = activeBallIntent?.arrowType === 'shot' ? SHOT_BALL_EASE : DEFAULT_BALL_EASE

  return {
    targetScreenPosition,
    durationSeconds: Math.max(0, progressTarget - progressNow) * totalDuration,
    ease,
  }
}

export function getPlayerPlaybackTween(
  plan: ScenarioPlan,
  side: TeamSide,
  playerNumber: number,
  progressNow: number,
  progressTarget: number,
  canvasW: number,
  canvasH: number,
  padding: number,
): PlayerPlaybackTween | undefined {
  const playerIntents = plan.animationIntents.filter((intent) => (
    intent.type === 'player-movement' &&
    intent.side === side &&
    intent.playerNumber === playerNumber
  ))

  if (playerIntents.length === 0) {
    return undefined
  }

  const snapshot = getWorldSnapshotAtProgress(plan, progressTarget)
  const player = snapshot.players.find((item) => (
    item.side === side &&
    item.number === playerNumber
  ))

  if (!player) {
    return undefined
  }

  const targetScreenPosition = pitchToScreen(
    player.position.x,
    player.position.y,
    canvasW,
    canvasH,
    padding,
  )
  const totalDuration = plan.animationIntents.at(-1)?.timing.endTime ?? 0
  const activePlayerIntent = playerIntents.find((intent) => (
    progressTarget >= intent.timing.startProgress &&
    progressTarget <= intent.timing.endProgress
  ))

  return {
    targetScreenPosition,
    durationSeconds: Math.max(0, progressTarget - progressNow) * totalDuration,
    ease: activePlayerIntent?.easeHint ?? DEFAULT_PLAYER_EASE,
  }
}
