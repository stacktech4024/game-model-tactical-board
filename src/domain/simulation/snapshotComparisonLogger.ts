import { pitchToScreen, type ScreenPoint } from '../pitch/coordTransforms.ts'
import { getWorldSnapshotAtProgress } from './worldSnapshot.ts'
import type {
  IntentEaseHint,
  PlannedIntentTiming,
  ScenarioPlan,
  ScheduledAnimationIntent,
} from './worldTypes.ts'

export type LiveScreenPosition = {
  sx: number
  sy: number
}

export type SnapshotComparisonEntityType = 'ball' | 'player'

export type SnapshotComparisonRow = {
  entityId: string
  entityType: SnapshotComparisonEntityType
  domainScreenPosition: ScreenPoint
  liveScreenPosition: LiveScreenPosition
  deltaPx: number
  note?: string
}

export type CompareSnapshotToLivePositionsArgs = {
  plan: ScenarioPlan
  progress: number
  canvasWidth: number
  canvasHeight: number
  canvasPadding: number
  liveHomePlayerScreenPositions: Map<number, LiveScreenPosition>
  liveBallScreenPosition?: LiveScreenPosition
  // Home player numbers considered ambient/idle-affected right now (e.g. not
  // a key player in the active phase step). Idle wander and ambient shape
  // shift intentionally drift these tokens, so large deltas for them are
  // annotated rather than reported as a hard mismatch.
  ambientPlayerNumbers?: ReadonlySet<number>
}

const AMBIENT_DRIFT_NOTE = 'ambient/idle drift expected for non-key player'
const EASED_DIVERGENCE_NOTE = 'eased-vs-linear divergence expected mid-tween'
const UNEXPLAINED_MISMATCH_NOTE = 'unexplained mismatch'
const NO_SCRIPTED_PLAYER_MOVEMENT_NOTE =
  'no scripted player movement for this entity — position reflects static formation slot'

// Below this, two positions are considered the same point for annotation
// purposes (floating point/rounding noise, not a real divergence).
const MIN_NONTRIVIAL_DELTA_PX = 1

function distancePx(a: ScreenPoint, b: LiveScreenPosition): number {
  return Math.hypot(a.sx - b.sx, a.sy - b.sy)
}

function isIntentActiveAtProgress(timing: PlannedIntentTiming, progress: number): boolean {
  return progress >= timing.startProgress && progress <= timing.endProgress
}

// Looks up the ease hint (descriptive metadata only, see IntentEaseHint) of
// whichever scheduled intent is currently mid-tween for this entity, so the
// logger can explain - not interpolate - eased-vs-linear divergence.
function findActiveEaseHint(
  intents: ScheduledAnimationIntent[],
  progress: number,
  predicate: (intent: ScheduledAnimationIntent) => boolean,
): IntentEaseHint | undefined {
  return intents.find(
    (intent) => predicate(intent) && isIntentActiveAtProgress(intent.timing, progress),
  )?.easeHint
}

// A shot arrow's playerNumber is cosmetic only (scale pulse) - it never
// drives a position tween, so only true 'player-movement' intents count
// here. Pending and completed intents both count: the player was scripted,
// even if that script isn't active at the current progress.
function hasPlayerMovementIntent(
  intents: ScheduledAnimationIntent[],
  side: ScheduledAnimationIntent['side'],
  playerNumber: number,
): boolean {
  return intents.some(
    (intent) =>
      intent.type === 'player-movement' &&
      intent.side === side &&
      intent.playerNumber === playerNumber,
  )
}

function buildComparisonNote(args: {
  isAmbient: boolean
  easeHint: IntentEaseHint | undefined
  deltaPx: number
  hasScriptedMovement: boolean
}): string | undefined {
  const { isAmbient, easeHint, deltaPx, hasScriptedMovement } = args
  const notes: string[] = []

  // Ambient/idle drift is reported unconditionally for ambient entities,
  // independent of delta size, matching prior behavior - this note must
  // never be replaced by a generic one (see Checkpoint 2.4D rule 6).
  if (isAmbient) {
    notes.push(AMBIENT_DRIFT_NOTE)
  }

  if (deltaPx >= MIN_NONTRIVIAL_DELTA_PX) {
    if (easeHint && easeHint !== 'linear') {
      notes.push(EASED_DIVERGENCE_NOTE)
    } else if (!isAmbient) {
      notes.push(hasScriptedMovement ? UNEXPLAINED_MISMATCH_NOTE : NO_SCRIPTED_PLAYER_MOVEMENT_NOTE)
    }
  }

  return notes.length > 0 ? notes.join('; ') : undefined
}

// Pure comparison: builds a WorldSnapshot for the given plan/progress and
// diffs its pitch-derived screen positions against the live Pixi/GSAP
// screen positions the caller observed. Does not touch Pixi, GSAP, or React,
// and does not mutate any of its inputs.
export function compareSnapshotToLivePositions({
  plan,
  progress,
  canvasWidth,
  canvasHeight,
  canvasPadding,
  liveHomePlayerScreenPositions,
  liveBallScreenPosition,
  ambientPlayerNumbers,
}: CompareSnapshotToLivePositionsArgs): SnapshotComparisonRow[] {
  const snapshot = getWorldSnapshotAtProgress(plan, progress)
  const rows: SnapshotComparisonRow[] = []

  if (snapshot.ball && liveBallScreenPosition) {
    const domainScreenPosition = pitchToScreen(
      snapshot.ball.position.x,
      snapshot.ball.position.y,
      canvasWidth,
      canvasHeight,
      canvasPadding,
    )
    const deltaPx = distancePx(domainScreenPosition, liveBallScreenPosition)
    const easeHint = findActiveEaseHint(
      plan.animationIntents,
      progress,
      (intent) => intent.type === 'ball-movement',
    )

    rows.push({
      entityId: snapshot.ball.id,
      entityType: 'ball',
      domainScreenPosition,
      liveScreenPosition: liveBallScreenPosition,
      deltaPx,
      note: buildComparisonNote({ isAmbient: false, easeHint, deltaPx, hasScriptedMovement: true }),
    })
  }

  snapshot.players
    .filter((player) => player.side === 'home')
    .forEach((player) => {
      const liveScreenPosition = liveHomePlayerScreenPositions.get(player.number)

      if (!liveScreenPosition) {
        return
      }

      const domainScreenPosition = pitchToScreen(
        player.position.x,
        player.position.y,
        canvasWidth,
        canvasHeight,
        canvasPadding,
      )
      const deltaPx = distancePx(domainScreenPosition, liveScreenPosition)
      const isAmbient = ambientPlayerNumbers?.has(player.number) ?? false
      const easeHint = findActiveEaseHint(
        plan.animationIntents,
        progress,
        (intent) =>
          intent.type === 'player-movement' &&
          intent.side === player.side &&
          intent.playerNumber === player.number,
      )
      const hasScriptedMovement = hasPlayerMovementIntent(
        plan.animationIntents,
        player.side,
        player.number,
      )

      rows.push({
        entityId: player.id,
        entityType: 'player',
        domainScreenPosition,
        liveScreenPosition,
        deltaPx,
        note: buildComparisonNote({ isAmbient, easeHint, deltaPx, hasScriptedMovement }),
      })
    })

  return rows
}

export type LogSnapshotComparisonArgs = CompareSnapshotToLivePositionsArgs & {
  scenarioId: string
}

// Console-only reporting wrapper around compareSnapshotToLivePositions.
// Intentionally side-effecting (console.debug) - callers gate invocation
// behind their own enable flag rather than this module deciding for them.
export function logSnapshotComparison(args: LogSnapshotComparisonArgs): SnapshotComparisonRow[] {
  const rows = compareSnapshotToLivePositions(args)

  console.debug(
    `[snapshotComparisonLogger] scenario=${args.scenarioId} progress=${args.progress.toFixed(3)}`,
    rows.map((row) => ({
      entityId: row.entityId,
      entityType: row.entityType,
      domainScreenPosition: row.domainScreenPosition,
      liveScreenPosition: row.liveScreenPosition,
      deltaPx: Number(row.deltaPx.toFixed(2)),
      note: row.note,
    })),
  )

  return rows
}
