import { pitchToScreen } from '../../../domain/pitch/coordTransforms.ts'
import type { PitchPoint } from '../../../domain/pitch/coordTransforms.ts'
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

// Not wired into playback yet (Phase 3D-1: foundation only). Future
// orientation tweens will call this to derive a tokenSprite.rotation value
// directly from a movement segment's from/to pitch points.
//
// pitchToScreen flips the y-axis (screen y grows downward; pitch y grows
// "up the pitch"), so the screen-space direction for a pitch vector (dx, dy)
// is (dx, -dy). Pixi's rotation convention already matches this: rotating the
// Shapers rest pose (which faces along the local +x axis) by this radian
// value points it at (cos(rotation), sin(rotation)) in screen space - the
// same target direction. This produces the identical value PlayerLayer.ts's
// static (facingAngle + SHAPER_FORWARD_ROTATION_OFFSET_DEGREES) formula
// would for an equivalent direction (e.g. a (0, +1) "up the pitch" pitch
// vector yields -90deg, matching facingAngle 0).
//
// Returns undefined for a zero-length vector (no movement, no defined
// facing direction) rather than calling atan2 on a degenerate input.
export function getRotationFromPitchVector(from: PitchPoint, to: PitchPoint): number | undefined {
  const dx = to.x - from.x
  const dy = to.y - from.y

  if (dx === 0 && dy === 0) {
    return undefined
  }

  return Math.atan2(-dy, dx)
}
