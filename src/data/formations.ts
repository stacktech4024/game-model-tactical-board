type FormationPosition = {
  x: number
  y: number
}

export type FormationPositionMap = Record<number, FormationPosition>

export const ATTACKING_442_POSITIONS: FormationPositionMap = {
  1: { x: 34, y: 6 },
  2: { x: 56, y: 24 },
  3: { x: 12, y: 24 },
  4: { x: 24, y: 22 },
  5: { x: 44, y: 22 },
  6: { x: 34, y: 36 },
  7: { x: 56, y: 72 },
  8: { x: 34, y: 60 },
  9: { x: 36, y: 88 },
  10: { x: 34, y: 72 },
  11: { x: 12, y: 72 },
}

export const DEFENSIVE_4231_POSITIONS: FormationPositionMap = {
  1: { x: 34, y: 6 },
  2: { x: 54, y: 22 },
  3: { x: 14, y: 22 },
  4: { x: 24, y: 20 },
  5: { x: 44, y: 20 },
  6: { x: 31, y: 34 },
  7: { x: 54, y: 56 },
  8: { x: 34, y: 48 },
  9: { x: 34, y: 84 },
  10: { x: 34, y: 64 },
  11: { x: 14, y: 56 },
}
