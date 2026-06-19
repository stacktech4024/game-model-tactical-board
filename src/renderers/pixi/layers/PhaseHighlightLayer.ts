import { Graphics } from 'pixi.js'
import { PITCH } from '../../../domain/pitch/pitchConstants'
import { pitchToScreen } from '../../../domain/pitch/coordTransforms'
import type { ScenarioPhaseStep } from '../../../domain/scenarios/scenarioTypes'

const ZONE_COLOR = 0xfbbf24
const CHANNEL_COLOR = 0x38bdf8

const ZONE_BOUNDS: Record<number, { startY: number; endY: number }> = {
  1: { startY: 0, endY: 26.25 },
  2: { startY: 26.25, endY: 52.5 },
  3: { startY: 52.5, endY: 78.75 },
  4: { startY: 78.75, endY: 105 },
}

const CHANNEL_BOUNDS: Record<number, Array<{ startX: number; endX: number }>> = {
  1: [
    { startX: 0, endX: 11.33 },
    { startX: 56.66, endX: 68 },
  ],
  2: [
    { startX: 11.33, endX: 22.66 },
    { startX: 45.33, endX: 56.66 },
  ],
  3: [{ startX: 22.66, endX: 45.33 }],
}

function drawPitchRect(
  gfx: Graphics,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  canvasW: number,
  canvasH: number,
  padding: number,
  color: number,
): void {
  const corner1 = pitchToScreen(x1, y1, canvasW, canvasH, padding)
  const corner2 = pitchToScreen(x2, y2, canvasW, canvasH, padding)
  const x = Math.min(corner1.sx, corner2.sx)
  const y = Math.min(corner1.sy, corner2.sy)
  const width = Math.abs(corner2.sx - corner1.sx)
  const height = Math.abs(corner2.sy - corner1.sy)

  gfx.rect(x, y, width, height)
  gfx.fill({ color, alpha: 0.08 })
  gfx.rect(x, y, width, height)
  gfx.stroke({ color, width: 2, alpha: 0.5 })
}

export function drawPhaseHighlights(
  gfx: Graphics,
  activePhaseStep: ScenarioPhaseStep | undefined,
  canvasW: number,
  canvasH: number,
  padding: number,
): void {
  gfx.clear()

  if (!activePhaseStep) {
    return
  }

  activePhaseStep.zoneFocus.forEach((zone) => {
    const bounds = ZONE_BOUNDS[zone]

    if (bounds) {
      drawPitchRect(gfx, 0, bounds.startY, PITCH.WIDTH, bounds.endY, canvasW, canvasH, padding, ZONE_COLOR)
    }
  })

  activePhaseStep.channelFocus.forEach((channelNumber) => {
    CHANNEL_BOUNDS[channelNumber]?.forEach((bounds) => {
      drawPitchRect(gfx, bounds.startX, 0, bounds.endX, PITCH.LENGTH, canvasW, canvasH, padding, CHANNEL_COLOR)
    })
  })
}
