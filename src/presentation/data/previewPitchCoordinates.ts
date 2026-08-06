import { PITCH } from '../../domain/pitch/pitchConstants.ts'

export type PitchPercentPoint = {
  x: number
  y: number
}

export type PitchPercentPositionMap = Record<number, PitchPercentPoint>

export function formationMetresToPitchPercentPositions(
  positions: PitchPercentPositionMap,
): PitchPercentPositionMap {
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
 * Tactical data is authored with y=0 at the bottom own goal and y=100 at
 * the top opponent goal. PixiPitchPreview exposes screen-style percentages,
 * so its y axis is inverted exactly once at this boundary.
 */
export function pitchPercentToPreviewPoint(point: PitchPercentPoint): PitchPercentPoint {
  return {
    x: point.x,
    y: 100 - point.y,
  }
}

export function previewPointToPitchPercent(point: PitchPercentPoint): PitchPercentPoint {
  return pitchPercentToPreviewPoint(point)
}
