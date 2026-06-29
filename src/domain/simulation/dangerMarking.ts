import type { PitchPoint } from '../scenarios/scenarioTypes'
import type { PlayerState, TeamSide, WorldSnapshot } from './worldTypes'

export type DangerArea = {
  id?: string
  defendingSide: TeamSide
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export type CoverDefenderSuggestion = {
  defender: PlayerState
  dangerArea: DangerArea
  areaCenter: PitchPoint
  distanceToArea: number
  distanceToCenter: number
}

function normalizeDangerArea(dangerArea: DangerArea): DangerArea {
  return {
    ...dangerArea,
    minX: Math.min(dangerArea.minX, dangerArea.maxX),
    maxX: Math.max(dangerArea.minX, dangerArea.maxX),
    minY: Math.min(dangerArea.minY, dangerArea.maxY),
    maxY: Math.max(dangerArea.minY, dangerArea.maxY),
  }
}

function getAreaCenter(dangerArea: DangerArea): PitchPoint {
  return {
    x: (dangerArea.minX + dangerArea.maxX) / 2,
    y: (dangerArea.minY + dangerArea.maxY) / 2,
  }
}

function getDistance(first: PitchPoint, second: PitchPoint): number {
  return Math.hypot(first.x - second.x, first.y - second.y)
}

function getDistanceToArea(point: PitchPoint, dangerArea: DangerArea): number {
  const nearestX = Math.max(dangerArea.minX, Math.min(point.x, dangerArea.maxX))
  const nearestY = Math.max(dangerArea.minY, Math.min(point.y, dangerArea.maxY))

  return getDistance(point, { x: nearestX, y: nearestY })
}

function compareCoverSuggestions(
  first: CoverDefenderSuggestion,
  second: CoverDefenderSuggestion,
): number {
  const areaDistanceDelta = first.distanceToArea - second.distanceToArea

  if (areaDistanceDelta !== 0) {
    return areaDistanceDelta
  }

  const centerDistanceDelta = first.distanceToCenter - second.distanceToCenter

  if (centerDistanceDelta !== 0) {
    return centerDistanceDelta
  }

  const numberDelta = first.defender.number - second.defender.number

  if (numberDelta !== 0) {
    return numberDelta
  }

  return first.defender.id.localeCompare(second.defender.id)
}

export function getNearestCoverDefender(
  snapshot: WorldSnapshot,
  dangerArea: DangerArea,
): CoverDefenderSuggestion | null {
  const normalizedDangerArea = normalizeDangerArea(dangerArea)
  const areaCenter = getAreaCenter(normalizedDangerArea)
  const candidates = snapshot.players
    .filter((player) => player.side === normalizedDangerArea.defendingSide)
    .map((defender) => ({
      defender,
      dangerArea: normalizedDangerArea,
      areaCenter,
      distanceToArea: getDistanceToArea(defender.position, normalizedDangerArea),
      distanceToCenter: getDistance(defender.position, areaCenter),
    }))
    .sort(compareCoverSuggestions)

  return candidates[0] ?? null
}
