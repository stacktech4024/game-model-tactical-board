import { PITCH } from './pitchConstants'

export type ScreenPoint = {
  sx: number
  sy: number
}

export type PitchPoint = {
  x: number
  y: number
}

function getPitchLayout(canvasW: number, canvasH: number, padding: number) {
  const availableW = canvasW - padding * 2
  const availableH = canvasH - padding * 2
  const scale = Math.min(availableW / PITCH.WIDTH, availableH / PITCH.LENGTH)
  const pitchScreenW = PITCH.WIDTH * scale
  const pitchScreenH = PITCH.LENGTH * scale
  const offsetX = padding + (availableW - pitchScreenW) / 2
  const offsetY = padding + (availableH - pitchScreenH) / 2

  return { scale, offsetX, offsetY }
}

export function pitchToScreen(
  x: number,
  y: number,
  canvasW: number,
  canvasH: number,
  padding: number,
): ScreenPoint {
  const { scale, offsetX, offsetY } = getPitchLayout(canvasW, canvasH, padding)

  return {
    sx: offsetX + x * scale,
    sy: offsetY + (PITCH.LENGTH - y) * scale,
  }
}

export function screenToPitch(
  sx: number,
  sy: number,
  canvasW: number,
  canvasH: number,
  padding: number,
): PitchPoint {
  const { scale, offsetX, offsetY } = getPitchLayout(canvasW, canvasH, padding)

  return {
    x: (sx - offsetX) / scale,
    y: PITCH.LENGTH - (sy - offsetY) / scale,
  }
}
