import type { ScenarioFormationMode } from '../domain/scenarios/scenarioTypes'

type FormationPosition = {
  x: number
  y: number
}

export type FormationPositionMap = Record<number, FormationPosition>

// Back four, flat midfield four, and two forwards with a support striker.
export const ATTACKING_442_POSITIONS: FormationPositionMap = {
  1: { x: 34, y: 7 },
  2: { x: 58, y: 28 },
  3: { x: 10, y: 28 },
  4: { x: 26, y: 25 },
  5: { x: 42, y: 25 },
  6: { x: 26, y: 52 },
  8: { x: 42, y: 52 },
  11: { x: 10, y: 62 },
  7: { x: 58, y: 62 },
  10: { x: 28, y: 84 },
  9: { x: 40, y: 84 },
}

// Back four, double pivot, three attacking midfielders, and a lone striker.
export const DEFENSIVE_4231_POSITIONS: FormationPositionMap = {
  1: { x: 34, y: 7 },
  2: { x: 56, y: 24 },
  3: { x: 12, y: 24 },
  4: { x: 26, y: 22 },
  5: { x: 42, y: 22 },
  6: { x: 29, y: 42 },
  8: { x: 39, y: 42 },
  11: { x: 13, y: 58 },
  10: { x: 34, y: 60 },
  7: { x: 55, y: 58 },
  9: { x: 34, y: 76 },
}

// Back four, advanced wide forwards, a central pivot, and three attacking midfielders.
export const ATTACKING_433_POSITIONS: FormationPositionMap = {
  1: { x: 34, y: 7 },
  2: { x: 58, y: 30 },
  3: { x: 10, y: 30 },
  4: { x: 26, y: 25 },
  5: { x: 42, y: 25 },
  6: { x: 34, y: 48 },
  8: { x: 25, y: 62 },
  10: { x: 43, y: 62 },
  11: { x: 9, y: 80 },
  7: { x: 59, y: 80 },
  9: { x: 34, y: 88 },
}

// Back five with a central sweeper, three midfielders, and two forwards.
export const DEFENSIVE_532_POSITIONS: FormationPositionMap = {
  1: { x: 34, y: 7 },
  3: { x: 8, y: 27 },
  4: { x: 23, y: 22 },
  6: { x: 34, y: 20 },
  5: { x: 45, y: 22 },
  2: { x: 60, y: 27 },
  11: { x: 18, y: 46 },
  8: { x: 34, y: 44 },
  7: { x: 50, y: 46 },
  10: { x: 29, y: 70 },
  9: { x: 39, y: 72 },
}

// Back three, higher wing-backs, a midfield trio, and two forwards in possession.
export const ATTACKING_352_POSITIONS: FormationPositionMap = {
  1: { x: 34, y: 7 },
  4: { x: 24, y: 24 },
  6: { x: 34, y: 22 },
  5: { x: 44, y: 24 },
  3: { x: 8, y: 58 },
  2: { x: 60, y: 58 },
  8: { x: 34, y: 54 },
  11: { x: 23, y: 66 },
  7: { x: 45, y: 66 },
  10: { x: 29, y: 84 },
  9: { x: 39, y: 86 },
}

export const FORMATION_LABELS: Record<ScenarioFormationMode, string> = {
  'attacking-442': 'Attacking 1-4-4-2',
  'defensive-4231': 'Defending 1-4-2-3-1',
  'attacking-433': 'Attacking 1-4-3-3',
  'defensive-532': 'Defending 1-5-3-2',
  'attacking-352': 'Attacking 1-3-5-2',
}

export const FORMATION_POSITIONS: Record<ScenarioFormationMode, FormationPositionMap> = {
  'attacking-442': ATTACKING_442_POSITIONS,
  'defensive-4231': DEFENSIVE_4231_POSITIONS,
  'attacking-433': ATTACKING_433_POSITIONS,
  'defensive-532': DEFENSIVE_532_POSITIONS,
  'attacking-352': ATTACKING_352_POSITIONS,
}
