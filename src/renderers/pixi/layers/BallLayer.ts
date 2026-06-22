import { Container, Graphics, Sprite, Texture } from 'pixi.js'
import { pitchToScreen } from '../../../domain/pitch/coordTransforms'

import ballNikeUrl from '../../../assets/shapers/ball_nike_ORIGINAL.png'

const BALL_RADIUS = 8

const BALL_TEXTURE = Texture.from(ballNikeUrl)

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
  const shadow = new Graphics()
  const ballSprite = new Sprite(BALL_TEXTURE)

  shadow.circle(1.5, 2, BALL_RADIUS)
  shadow.fill({ color: 0x000000, alpha: 0.22 })

  ballSprite.anchor.set(0.5)
  ballSprite.width = BALL_RADIUS * 2
  ballSprite.height = BALL_RADIUS * 2

  ballToken.position.set(point.sx, point.sy)
  ballToken.addChild(shadow)
  ballToken.addChild(ballSprite)
  container.addChild(ballToken)

  return ballToken
}
