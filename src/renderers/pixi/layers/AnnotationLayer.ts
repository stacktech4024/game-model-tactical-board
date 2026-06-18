import { Graphics } from 'pixi.js'
import { PITCH } from '../../../domain/pitch/pitchConstants'
import { pitchToScreen } from '../../../domain/pitch/coordTransforms'
import type { HighlightChannel, HighlightZone, ScenarioAnnotations } from '../../../domain/scenarios/scenarioTypes'

const ZONE_FILL = 0xf59e0b
const ZONE_ALPHA = 0.12
const CHANNEL_FILL = 0x22d3ee
const CHANNEL_ALPHA = 0.1

const ZONE_BOUNDS: Record<HighlightZone, { startY: number; endY: number }> = {
  1: { startY: 0, endY: 26.25 },
  2: { startY: 26.25, endY: 52.5 },
  3: { startY: 52.5, endY: 78.75 },
  4: { startY: 78.75, endY: 105 },
}

const CHANNEL_INDEXES: Record<HighlightChannel, number> = {
  'wide-left': 0,
  'half-space-left': 1,
  'central-left': 2,
  'central-right': 3,
  'half-space-right': 4,
  'wide-right': 5,
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
  alpha: number,
): void {
  const bottomLeft = pitchToScreen(x1, y1, canvasW, canvasH, padding)
  const topRight = pitchToScreen(x2, y2, canvasW, canvasH, padding)

  gfx.rect(bottomLeft.sx, topRight.sy, topRight.sx - bottomLeft.sx, bottomLeft.sy - topRight.sy)
  gfx.fill({ color, alpha })
}

export function drawAnnotations(
  gfx: Graphics,
  annotations: ScenarioAnnotations | undefined,
  canvasW: number,
  canvasH: number,
  padding: number,
): void {
  gfx.clear()

  if (!annotations) {
    return
  }

  annotations.highlightZones?.forEach((zone) => {
    const bounds = ZONE_BOUNDS[zone]

    drawPitchRect(gfx, 0, bounds.startY, PITCH.WIDTH, bounds.endY, canvasW, canvasH, padding, ZONE_FILL, ZONE_ALPHA)
  })

  annotations.highlightChannels?.forEach((channelName) => {
    const channel = PITCH.CHANNELS[CHANNEL_INDEXES[channelName]]

    drawPitchRect(
      gfx,
      channel.startX,
      0,
      channel.endX,
      PITCH.LENGTH,
      canvasW,
      canvasH,
      padding,
      CHANNEL_FILL,
      CHANNEL_ALPHA,
    )
  })
}
