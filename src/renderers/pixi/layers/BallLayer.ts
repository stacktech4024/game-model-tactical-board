import { Container, Graphics, Sprite, Texture } from 'pixi.js'
import { getPitchScale, pitchToScreen } from '../../../domain/pitch/coordTransforms'

import ballNikeUrl from '../../../assets/shapers/ball_nike_ORIGINAL.svg'

const BALL_RADIUS_PER_PITCH_METRE = 0.9
const MIN_BALL_RADIUS = 7
const MAX_BALL_RADIUS = 10
const BALL_FOOT_OFFSET_X = 6
const BALL_FOOT_OFFSET_Y = 8

// Aerial-lift visual tuning. The pitch view is flat 2D with no real z-axis,
// so "height" during a cross or header is suggested the way top-down sports
// graphics conventionally do it: the ball grows and rises slightly while the
// shadow drifts away and fades, then both converge back to neutral on
// landing. liftRatio is 0 on the ground, 1 at the peak of the flight.
const AERIAL_SCALE_BOOST = 0.4
const AERIAL_RISE_OFFSET = 9
const AERIAL_SHADOW_DRIFT = 7
const AERIAL_SHADOW_MIN_ALPHA_FACTOR = 0.5

// Stores each ball token's resting (ground-level) sprite scale, captured at
// creation time, so applyBallAerialLift can scale relative to it without
// compounding repeated multiplications across frames.
const baseSpriteScaleByToken = new WeakMap<Container, { x: number; y: number }>()

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

  baseSpriteScaleByToken.set(ballToken, { x: ballSprite.scale.x, y: ballSprite.scale.y })

  return ballToken
}

// Maps a 0-1 flight-progress fraction to a 0-1 lift amount via a single
// smooth arc that's 0 at takeoff/landing and 1 at the midpoint of the
// flight - one continuous hump regardless of how the path is segmented.
export function getAerialLiftAtProgress(progress: number): number {
  const clamped = Math.max(0, Math.min(1, progress))

  return Math.sin(clamped * Math.PI)
}

// Applies (or clears, at liftRatio 0) the aerial-lift visual to a ball
// token built by drawBall. Safe to call every frame from a GSAP onUpdate.
export function applyBallAerialLift(ballToken: Container, liftRatio: number): void {
  const shadow = ballToken.children[0]
  const ballSprite = ballToken.children[1]

  if (!(shadow instanceof Graphics) || !(ballSprite instanceof Sprite)) {
    return
  }

  const baseScale = baseSpriteScaleByToken.get(ballToken)

  if (!baseScale) {
    return
  }

  const lift = Math.max(0, Math.min(1, liftRatio))
  const scaleBoost = 1 + lift * AERIAL_SCALE_BOOST

  ballSprite.scale.set(baseScale.x * scaleBoost, baseScale.y * scaleBoost)
  ballSprite.position.set(0, -lift * AERIAL_RISE_OFFSET)
  shadow.position.set(lift * AERIAL_SHADOW_DRIFT, lift * AERIAL_SHADOW_DRIFT * 0.6)
  shadow.alpha = 1 - lift * AERIAL_SHADOW_MIN_ALPHA_FACTOR
}

export function resetBallAerialLift(ballToken: Container): void {
  applyBallAerialLift(ballToken, 0)
}
