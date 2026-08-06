export const SHAPER_FORWARD_ROTATION_OFFSET_DEGREES = -90

export function facingAngleToSpriteRotation(facingAngle: number): number {
  return ((facingAngle + SHAPER_FORWARD_ROTATION_OFFSET_DEGREES) * Math.PI) / 180
}

export function getNearestEquivalentFacingAngle(
  currentFacingAngle: number,
  targetFacingAngle: number,
): number {
  const shortestTurn = ((targetFacingAngle - currentFacingAngle + 540) % 360) - 180

  return currentFacingAngle + shortestTurn
}
