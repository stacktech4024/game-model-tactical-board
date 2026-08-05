import { PITCH } from '../../domain/pitch/pitchConstants.ts'

export type TransitionPitchPercentPoint = {
  x: number
  y: number
}

export type TransitionPositionMap = Record<number, TransitionPitchPercentPoint>

/**
 * Transition cases are authored in canonical pitch percentages:
 * x runs left-to-right and y runs from the bottom own goal (0) to the top
 * opponent goal (100). Formation data uses the same axes in metres, so it is
 * normalized before any percentage overrides are applied.
 */
export function formationMetresToPitchPercentPositions(
  positions: TransitionPositionMap,
): TransitionPositionMap {
  return Object.fromEntries(
    Object.entries(positions).map(([number, point]) => [
      Number(number),
      {
        x: (point.x / PITCH.WIDTH) * 100,
        y: (point.y / PITCH.LENGTH) * 100,
      },
    ]),
  )
}

/**
 * PixiPitchPreview's public percentage API uses screen-style y coordinates
 * (0 at the top). Keep that renderer contract isolated at this boundary.
 */
export function pitchPercentToPreviewPoint(
  point: TransitionPitchPercentPoint,
): TransitionPitchPercentPoint {
  return {
    x: point.x,
    y: 100 - point.y,
  }
}

export function previewPointToPitchPercent(
  point: TransitionPitchPercentPoint,
): TransitionPitchPercentPoint {
  return pitchPercentToPreviewPoint(point)
}
