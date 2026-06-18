import { Graphics } from 'pixi.js'
import { PITCH } from '../../../domain/pitch/pitchConstants'
import { pitchToScreen } from '../../../domain/pitch/coordTransforms'

const DARK_GRASS = 0x2d5a27
const LIGHT_GRASS = 0x356b2e
const STRIPE_WIDTH_METERS = 5

export function drawGrass(
  gfx: Graphics,
  canvasW: number,
  canvasH: number,
  padding: number,
): void {
  gfx.clear()

  let stripeIndex = 0

  for (let startX = 0; startX < PITCH.WIDTH; startX += STRIPE_WIDTH_METERS) {
    const endX = Math.min(startX + STRIPE_WIDTH_METERS, PITCH.WIDTH)
    const topLeft = pitchToScreen(startX, PITCH.LENGTH, canvasW, canvasH, padding)
    const bottomRight = pitchToScreen(endX, 0, canvasW, canvasH, padding)
    const stripeColor = stripeIndex % 2 === 0 ? DARK_GRASS : LIGHT_GRASS

    gfx.rect(topLeft.sx, topLeft.sy, bottomRight.sx - topLeft.sx, bottomRight.sy - topLeft.sy)
    gfx.fill({ color: stripeColor })

    stripeIndex += 1
  }
}
