import { pitchToScreen, type ScreenPoint } from '../pitch/coordTransforms'
import { getWorldSnapshotAtProgress } from './worldSnapshot'
import type { ScenarioPlan } from './worldTypes'

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

function distancePx(a: ScreenPoint, b: LiveScreenPosition): number {
  return Math.hypot(a.sx - b.sx, a.sy - b.sy)
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

    rows.push({
      entityId: snapshot.ball.id,
      entityType: 'ball',
      domainScreenPosition,
      liveScreenPosition: liveBallScreenPosition,
      deltaPx: distancePx(domainScreenPosition, liveBallScreenPosition),
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

      rows.push({
        entityId: player.id,
        entityType: 'player',
        domainScreenPosition,
        liveScreenPosition,
        deltaPx: distancePx(domainScreenPosition, liveScreenPosition),
        note: ambientPlayerNumbers?.has(player.number) ? AMBIENT_DRIFT_NOTE : undefined,
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
