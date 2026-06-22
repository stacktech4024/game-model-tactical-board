import { Container, Graphics, Sprite, Texture } from 'pixi.js'
import { getPitchScale, pitchToScreen } from '../../../domain/pitch/coordTransforms'

import ballNikeUrl from '../../../assets/shapers/ball_nike_ORIGINAL.svg'

const BALL_RADIUS_PER_PITCH_METRE = 0.9
const MIN_BALL_RADIUS = 7
const MAX_BALL_RADIUS = 10
const BALL_FOOT_OFFSET_X = 6
const BALL_FOOT_OFFSET_Y = 8

// Looked up lazily (not cached at module load) because Texture.from() only
// reads the Assets cache — it must run after preloadTokenAssets() resolves.
function getBallTexture(): Texture {
  return Texture.from(ballNikeUrl)
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
  const pitchScale = getPitchScale(canvasW, canvasH, padding)
  const ballRadius = Math.min(
    MAX_BALL_RADIUS,
    Math.max(MIN_BALL_RADIUS, pitchScale * BALL_RADIUS_PER_PITCH_METRE),
  )
  const ballToken = new Container()
  const shadow = new Graphics()
  const ballSprite = new Sprite(getBallTexture())

  shadow.circle(ballRadius * 0.19, ballRadius * 0.25, ballRadius)
  shadow.fill({ color: 0x000000, alpha: 0.22 })

  ballSprite.anchor.set(0.5)
  ballSprite.width = ballRadius * 2
  ballSprite.height = ballRadius * 2

  ballToken.position.set(point.sx + BALL_FOOT_OFFSET_X, point.sy + BALL_FOOT_OFFSET_Y)
  ballToken.addChild(shadow)
  ballToken.addChild(ballSprite)
  container.addChild(ballToken)

  return ballToken
}
