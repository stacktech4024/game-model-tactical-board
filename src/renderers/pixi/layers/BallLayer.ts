import { Graphics } from 'pixi.js'
import { pitchToScreen } from '../../../domain/pitch/coordTransforms'

const BALL_RADIUS = 6
const BALL_FILL = 0xffffff
const BALL_STROKE = 0x111111

export function drawBall(
  gfx: Graphics,
  ballPosition: { x: number; y: number } | undefined,
  canvasW: number,
  canvasH: number,
  padding: number,
): void {
  gfx.clear()

  if (!ballPosition) {
    return
  }

  const point = pitchToScreen(ballPosition.x, ballPosition.y, canvasW, canvasH, padding)

  gfx.circle(point.sx, point.sy, BALL_RADIUS)
  gfx.fill({ color: BALL_FILL })
  gfx.stroke({ color: BALL_STROKE, width: 1.5, alpha: 0.9 })
}
