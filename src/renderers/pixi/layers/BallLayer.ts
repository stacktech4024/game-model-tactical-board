import { Container, Graphics } from 'pixi.js'
import { pitchToScreen } from '../../../domain/pitch/coordTransforms'

const BALL_RADIUS = 8
const BALL_FILL = 0xf8fafc
const BALL_STROKE = 0x111827
const PANEL_FILL = 0x1f2937
const HIGHLIGHT_FILL = 0xffffff

function drawPanelShape(gfx: Graphics, radius: number): void {
  const points = [
    { x: 0, y: -radius },
    { x: radius * 0.95, y: -radius * 0.3 },
    { x: radius * 0.58, y: radius * 0.85 },
    { x: -radius * 0.58, y: radius * 0.85 },
    { x: -radius * 0.95, y: -radius * 0.3 },
  ]

  gfx.moveTo(points[0].x, points[0].y)

  points.slice(1).forEach((point) => {
    gfx.lineTo(point.x, point.y)
  })

  gfx.lineTo(points[0].x, points[0].y)
}

function drawSeam(gfx: Graphics, x1: number, y1: number, x2: number, y2: number): void {
  gfx.moveTo(x1, y1)
  gfx.lineTo(x2, y2)
  gfx.stroke({ color: BALL_STROKE, width: 1, alpha: 0.82 })
}

export function drawBall(
  container: Container,
  ballPosition: { x: number; y: number } | undefined,
  canvasW: number,
  canvasH: number,
  padding: number,
): Container | undefined {
  container.removeChildren()

  if (!ballPosition) {
    return undefined
  }

  const point = pitchToScreen(ballPosition.x, ballPosition.y, canvasW, canvasH, padding)
  const ballToken = new Container()
  const ballShape = new Graphics()
  const shadow = new Graphics()
  const centerPanel = new Graphics()
  const highlight = new Graphics()

  shadow.circle(1.5, 2, BALL_RADIUS)
  shadow.fill({ color: 0x000000, alpha: 0.22 })

  ballShape.circle(0, 0, BALL_RADIUS)
  ballShape.fill({ color: BALL_FILL })
  ballShape.stroke({ color: BALL_STROKE, width: 1.5, alpha: 0.9 })

  drawPanelShape(centerPanel, 3)
  centerPanel.fill({ color: PANEL_FILL, alpha: 0.92 })

  drawSeam(ballShape, -2.8, -2.5, -6.4, -5.8)
  drawSeam(ballShape, 2.8, -2.5, 6.4, -5.8)
  drawSeam(ballShape, -3, 2.3, -6.5, 5.6)
  drawSeam(ballShape, 3, 2.3, 6.5, 5.6)

  highlight.circle(-3, -3.2, 1.6)
  highlight.fill({ color: HIGHLIGHT_FILL, alpha: 0.65 })

  ballToken.position.set(point.sx, point.sy)
  ballToken.addChild(shadow)
  ballToken.addChild(ballShape)
  ballToken.addChild(centerPanel)
  ballToken.addChild(highlight)
  container.addChild(ballToken)

  return ballToken
}
