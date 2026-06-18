import { Graphics } from 'pixi.js'
import { PITCH } from '../../../domain/pitch/pitchConstants'
import { pitchToScreen } from '../../../domain/pitch/coordTransforms'

const FAINT_WHITE = 0xffffff
const BOLD_WHITE = 0xffffff

function drawLine(
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
  alpha = 1,
): void {
  const start = pitchToScreen(x1, y1, canvasW, canvasH, padding)
  const end = pitchToScreen(x2, y2, canvasW, canvasH, padding)

  gfx.moveTo(start.sx, start.sy)
  gfx.lineTo(end.sx, end.sy)
  gfx.stroke({ color, width, alpha })
}

function drawGoal(
  gfx: Graphics,
  canvasW: number,
  canvasH: number,
  padding: number,
  frontY: number,
  backY: number,
): void {
  const leftX = (PITCH.WIDTH - PITCH.GOAL_WIDTH) / 2
  const rightX = leftX + PITCH.GOAL_WIDTH
  const gridX1 = leftX + PITCH.GOAL_WIDTH / 3
  const gridX2 = leftX + (PITCH.GOAL_WIDTH * 2) / 3
  const gridY1 = frontY + (backY - frontY) / 3
  const gridY2 = frontY + ((backY - frontY) * 2) / 3

  drawLine(gfx, leftX, backY, rightX, backY, canvasW, canvasH, padding, FAINT_WHITE, 1, 0.4)
  drawLine(gfx, leftX, frontY, leftX, backY, canvasW, canvasH, padding, FAINT_WHITE, 1, 0.4)
  drawLine(gfx, rightX, frontY, rightX, backY, canvasW, canvasH, padding, FAINT_WHITE, 1, 0.4)

  drawLine(gfx, leftX, frontY, rightX, frontY, canvasW, canvasH, padding, BOLD_WHITE, 2)
  drawLine(gfx, leftX, frontY, leftX, backY, canvasW, canvasH, padding, BOLD_WHITE, 2)
  drawLine(gfx, rightX, frontY, rightX, backY, canvasW, canvasH, padding, BOLD_WHITE, 2)

  drawLine(gfx, leftX, backY, leftX, gridY1, canvasW, canvasH, padding, FAINT_WHITE, 0.5, 0.15)
  drawLine(gfx, leftX, gridY1, leftX, gridY2, canvasW, canvasH, padding, FAINT_WHITE, 0.5, 0.15)
  drawLine(gfx, leftX, gridY2, leftX, frontY, canvasW, canvasH, padding, FAINT_WHITE, 0.5, 0.15)
  drawLine(gfx, rightX, backY, rightX, gridY1, canvasW, canvasH, padding, FAINT_WHITE, 0.5, 0.15)
  drawLine(gfx, rightX, gridY1, rightX, gridY2, canvasW, canvasH, padding, FAINT_WHITE, 0.5, 0.15)
  drawLine(gfx, rightX, gridY2, rightX, frontY, canvasW, canvasH, padding, FAINT_WHITE, 0.5, 0.15)

  drawLine(gfx, leftX, gridY1, rightX, gridY1, canvasW, canvasH, padding, FAINT_WHITE, 0.5, 0.15)
  drawLine(gfx, leftX, gridY2, rightX, gridY2, canvasW, canvasH, padding, FAINT_WHITE, 0.5, 0.15)
  drawLine(gfx, gridX1, backY, gridX1, frontY, canvasW, canvasH, padding, FAINT_WHITE, 0.5, 0.15)
  drawLine(gfx, gridX2, backY, gridX2, frontY, canvasW, canvasH, padding, FAINT_WHITE, 0.5, 0.15)
}

export function drawGoals(
  gfx: Graphics,
  canvasW: number,
  canvasH: number,
  padding: number,
): void {
  gfx.clear()

  drawGoal(gfx, canvasW, canvasH, padding, 0, -PITCH.GOAL_DEPTH)
  drawGoal(gfx, canvasW, canvasH, padding, PITCH.LENGTH, PITCH.LENGTH + PITCH.GOAL_DEPTH)
}
