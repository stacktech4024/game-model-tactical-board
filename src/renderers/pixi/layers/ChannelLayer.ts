import { Graphics } from 'pixi.js'
import { PITCH } from '../../../domain/pitch/pitchConstants'
import { pitchToScreen } from '../../../domain/pitch/coordTransforms'

export function drawChannels(
  gfx: Graphics,
  canvasW: number,
  canvasH: number,
  padding: number,
): void {
  gfx.clear()

  for (const channel of PITCH.CHANNELS.slice(0, -1)) {
    const x = channel.endX

    if (x <= 0 || x >= PITCH.WIDTH) {
      continue
    }

    const start = pitchToScreen(x, 0, canvasW, canvasH, padding)
    const end = pitchToScreen(x, PITCH.LENGTH, canvasW, canvasH, padding)

    gfx.moveTo(start.sx, start.sy)
    gfx.lineTo(end.sx, end.sy)
    gfx.stroke({ color: 0xffffff, width: 1, alpha: 0.2 })
  }
}
