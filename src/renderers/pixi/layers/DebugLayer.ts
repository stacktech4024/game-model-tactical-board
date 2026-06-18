import { Container, Graphics, Text } from 'pixi.js'
import { PITCH } from '../../../domain/pitch/pitchConstants'
import { pitchToScreen } from '../../../domain/pitch/coordTransforms'

const GRID_COLOR = 0xffffff
const GRID_ALPHA = 0.1
const GRID_WIDTH = 0.5
const ZONE_DEBUG_COLOR = 0xf59e0b
const CHANNEL_DEBUG_COLOR = 0xffffff
const CORNER_CENTRE_MARKER = 0xff0000
const PENALTY_MARKER = 0xffff00
const MARKER_RADIUS = 4
const GRID_STEP = 10
const LABEL_OFFSET = 4

function drawPitchLine(
  gfx: Graphics,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  canvasW: number,
  canvasH: number,
  padding: number,
  color: number,
  width: number,
  alpha: number,
): void {
  const start = pitchToScreen(x1, y1, canvasW, canvasH, padding)
  const end = pitchToScreen(x2, y2, canvasW, canvasH, padding)

  gfx.moveTo(start.sx, start.sy)
  gfx.lineTo(end.sx, end.sy)
  gfx.stroke({ color, width, alpha })
}

function drawMarker(
  gfx: Graphics,
  x: number,
  y: number,
  canvasW: number,
  canvasH: number,
  padding: number,
  color: number,
): void {
  const point = pitchToScreen(x, y, canvasW, canvasH, padding)

  gfx.circle(point.sx, point.sy, MARKER_RADIUS)
  gfx.fill({ color, alpha: 1 })
}

function addLabel(
  container: Container,
  textValue: string,
  x: number,
  y: number,
  offsetX: number,
  offsetY: number,
  canvasW: number,
  canvasH: number,
  padding: number,
): void {
  const point = pitchToScreen(x, y, canvasW, canvasH, padding)
  const text = new Text({
    text: textValue,
    style: {
      fill: 0xffffff,
      fontSize: 9,
      fontFamily: 'Arial',
    },
  })

  text.alpha = 0.5
  text.position.set(point.sx + offsetX, point.sy + offsetY)
  container.addChild(text)
}

export function drawDebug(
  gfx: Graphics,
  container: Container,
  canvasW: number,
  canvasH: number,
  padding: number,
): void {
  gfx.clear()

  for (let x = 0; x <= PITCH.WIDTH; x += GRID_STEP) {
    drawPitchLine(gfx, x, 0, x, PITCH.LENGTH, canvasW, canvasH, padding, GRID_COLOR, GRID_WIDTH, GRID_ALPHA)
    addLabel(container, `${x}`, x, 0, -LABEL_OFFSET, LABEL_OFFSET, canvasW, canvasH, padding)
  }

  for (let y = 0; y <= PITCH.LENGTH; y += GRID_STEP) {
    drawPitchLine(gfx, 0, y, PITCH.WIDTH, y, canvasW, canvasH, padding, GRID_COLOR, GRID_WIDTH, GRID_ALPHA)
    addLabel(container, `${y}`, 0, y, LABEL_OFFSET, -LABEL_OFFSET, canvasW, canvasH, padding)
  }

  for (const y of [26.25, 52.5, 78.75]) {
    drawPitchLine(gfx, 0, y, PITCH.WIDTH, y, canvasW, canvasH, padding, ZONE_DEBUG_COLOR, 1.5, 0.8)
  }

  for (const x of [11.33, 22.66, 34, 45.33, 56.66]) {
    drawPitchLine(gfx, x, 0, x, PITCH.LENGTH, canvasW, canvasH, padding, CHANNEL_DEBUG_COLOR, 1, 0.5)
  }

  drawMarker(gfx, 0, 0, canvasW, canvasH, padding, CORNER_CENTRE_MARKER)
  drawMarker(gfx, PITCH.WIDTH, 0, canvasW, canvasH, padding, CORNER_CENTRE_MARKER)
  drawMarker(gfx, 0, PITCH.LENGTH, canvasW, canvasH, padding, CORNER_CENTRE_MARKER)
  drawMarker(gfx, PITCH.WIDTH, PITCH.LENGTH, canvasW, canvasH, padding, CORNER_CENTRE_MARKER)
  drawMarker(gfx, PITCH.WIDTH / 2, PITCH.LENGTH / 2, canvasW, canvasH, padding, CORNER_CENTRE_MARKER)

  drawMarker(gfx, PITCH.WIDTH / 2, PITCH.PENALTY_SPOT_DIST, canvasW, canvasH, padding, PENALTY_MARKER)
  drawMarker(
    gfx,
    PITCH.WIDTH / 2,
    PITCH.LENGTH - PITCH.PENALTY_SPOT_DIST,
    canvasW,
    canvasH,
    padding,
    PENALTY_MARKER,
  )
}
