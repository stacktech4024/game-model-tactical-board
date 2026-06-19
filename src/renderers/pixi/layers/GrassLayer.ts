import { Graphics } from 'pixi.js'
import { pitchToScreen } from '../../../domain/pitch/coordTransforms'
import { PITCH } from '../../../domain/pitch/pitchConstants'

const STRIPE_HEIGHT_M = 5
const STRIPE_DARK = 0x2d5a1b
const STRIPE_LIGHT = 0x316320

export function drawGrass(
  grassLayer: Graphics,
  canvasW: number,
  canvasH: number,
  padding: number,
): void {
  grassLayer.clear()

  let stripeIndex = 0

  for (let y = 0; y < PITCH.LENGTH; y += STRIPE_HEIGHT_M) {
    const bandEndY = Math.min(y + STRIPE_HEIGHT_M, PITCH.LENGTH)
    const corner1 = pitchToScreen(0, y, canvasW, canvasH, padding)
    const corner2 = pitchToScreen(PITCH.WIDTH, bandEndY, canvasW, canvasH, padding)
    const x = Math.min(corner1.sx, corner2.sx)
    const rectY = Math.min(corner1.sy, corner2.sy)
    const width = Math.abs(corner2.sx - corner1.sx)
    const height = Math.abs(corner2.sy - corner1.sy)

    grassLayer.rect(x, rectY, width, height)
    grassLayer.fill({
      color: stripeIndex % 2 === 0 ? STRIPE_DARK : STRIPE_LIGHT,
      alpha: 1,
    })

    stripeIndex += 1
  }
}
