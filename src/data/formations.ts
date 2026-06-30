import type { ScenarioFormationMode } from '../domain/scenarios/scenarioTypes'

type FormationPosition = {
  x: number
  y: number
}

export type FormationPositionMap = Record<number, FormationPosition>

type Formation = {
  label: string
  home: FormationPositionMap
  away: FormationPositionMap
}

export const FORMATIONS: Record<ScenarioFormationMode, Formation> = {
  // Back four, flat midfield four, and two forwards with a support striker.
  //
  // NOTE: the away (defending) shape below is an intentional packed
  // corner-defending box - all ten outfield players sit deep around the
  // box except #9, left forward as the lone out-ball/counter outlet. This
  // shape is shared with 'build-through-wide-channels', which also uses
  // 'attacking-442' for its away side; that scenario is open play, but the
  // away team defending deep inside its own box reads as plausible there
  // too. Do not "fix" this back to a high, spread-out shape without
  // checking both scenarios.
  'attacking-442': {
    label: 'Attacking 1-4-4-2',
    home: {
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
    },
    away: {
      1: { x: 34, y: 99 },
      2: { x: 54, y: 90 },
      3: { x: 14, y: 90 },
      4: { x: 27, y: 87 },
      5: { x: 41, y: 87 },
      6: { x: 34, y: 92 },
      8: { x: 44, y: 84 },
      11: { x: 18, y: 84 },
      10: { x: 34, y: 80 },
      7: { x: 50, y: 84 },
      9: { x: 34, y: 48 },
    },
  },

  // Back four, double pivot, three attacking midfielders, and a lone striker.
  'defensive-4231': {
    label: 'Defending 1-4-2-3-1',
    home: {
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
    },
    away: {
      1: { x: 34, y: 99 },
      2: { x: 57, y: 82 },
      3: { x: 11, y: 82 },
      4: { x: 26, y: 84 },
      5: { x: 42, y: 84 },
      6: { x: 28, y: 67 },
      8: { x: 40, y: 67 },
      11: { x: 14, y: 56 },
      10: { x: 34, y: 55 },
      7: { x: 54, y: 56 },
      9: { x: 34, y: 42 },
    },
  },

  // Back four, advanced wide forwards, a central pivot, and three attacking midfielders.
  'attacking-433': {
    label: 'Attacking 1-4-3-3',
    home: {
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
    },
    away: {
      1: { x: 34, y: 99 },
      2: { x: 58, y: 82 },
      3: { x: 10, y: 82 },
      4: { x: 26, y: 84 },
      5: { x: 42, y: 84 },
      6: { x: 34, y: 69 },
      8: { x: 25, y: 58 },
      10: { x: 43, y: 58 },
      11: { x: 13, y: 43 },
      7: { x: 55, y: 43 },
      9: { x: 34, y: 36 },
    },
  },

  // Back five with a central sweeper, three midfielders, and two forwards.
  'defensive-532': {
    label: 'Defending 1-5-3-2',
    home: {
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
    },
    away: {
      1: { x: 34, y: 99 },
      3: { x: 10, y: 82 },
      4: { x: 24, y: 85 },
      6: { x: 34, y: 86 },
      5: { x: 44, y: 85 },
      2: { x: 58, y: 82 },
      11: { x: 20, y: 66 },
      8: { x: 34, y: 65 },
      7: { x: 48, y: 66 },
      10: { x: 29, y: 49 },
      9: { x: 39, y: 49 },
    },
  },

  // Back three, higher wing-backs, a midfield trio, and two forwards in possession.
  'attacking-352': {
    label: 'Attacking 1-3-5-2',
    home: {
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
    },
    away: {
      1: { x: 34, y: 99 },
      4: { x: 25, y: 84 },
      6: { x: 34, y: 86 },
      5: { x: 43, y: 84 },
      3: { x: 10, y: 63 },
      2: { x: 58, y: 63 },
      8: { x: 34, y: 67 },
      11: { x: 24, y: 54 },
      7: { x: 44, y: 54 },
      10: { x: 29, y: 40 },
      9: { x: 39, y: 40 },
    },
  },
}

function mapFormations<T>(select: (formation: Formation) => T): Record<ScenarioFormationMode, T> {
  return Object.fromEntries(
    Object.entries(FORMATIONS).map(([mode, formation]) => [mode, select(formation)]),
  ) as Record<ScenarioFormationMode, T>
}

export const FORMATION_LABELS: Record<ScenarioFormationMode, string> = mapFormations(
  (formation) => formation.label,
)

export const FORMATION_POSITIONS: Record<ScenarioFormationMode, FormationPositionMap> = mapFormations(
  (formation) => formation.home,
)

export const OPPOSITION_POSITIONS: Record<ScenarioFormationMode, FormationPositionMap> = mapFormations(
  (formation) => formation.away,
)
