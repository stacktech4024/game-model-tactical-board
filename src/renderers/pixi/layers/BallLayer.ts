import { Container, Graphics } from 'pixi.js'
import { pitchToScreen } from '../../../domain/pitch/coordTransforms'

const BALL_RADIUS = 6
const BALL_FILL = 0xffffff
const BALL_STROKE = 0x111111

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

  ballShape.circle(0, 0, BALL_RADIUS)
  ballShape.fill({ color: BALL_FILL })
  ballShape.stroke({ color: BALL_STROKE, width: 1.5, alpha: 0.9 })

  ballToken.position.set(point.sx, point.sy)
  ballToken.addChild(ballShape)
  container.addChild(ballToken)

  return ballToken
}
