export type FullbackScenarioPoint = {
  x: number
  y: number
}

export type FullbackScenarioPlayer = {
  id: string
  label: string
  role: string
  start: FullbackScenarioPoint
  tone?: 'primary' | 'keeper'
}

export type FullbackScenarioStep = {
  id: string
  cue: string
  kind: 'pass' | 'run' | 'cross'
  ballFrom?: FullbackScenarioPoint
  ballTo?: FullbackScenarioPoint
  playerId?: string
  playerTo?: FullbackScenarioPoint
  duration: number
}

export const FULLBACK_SKILL_PLAYERS: FullbackScenarioPlayer[] = [
  {
    id: 'six',
    label: '6',
    role: 'Central support',
    start: { x: 33, y: 68 },
    tone: 'keeper',
  },
  {
    id: 'ten',
    label: '10',
    role: 'Link / switch',
    start: { x: 51, y: 52 },
  },
  {
    id: 'winger',
    label: '7/11',
    role: 'Wide receiver',
    start: { x: 83, y: 39 },
  },
  {
    id: 'fullback',
    label: '2/3',
    role: 'Wide-channel release',
    start: { x: 82, y: 61 },
  },
  {
    id: 'nine',
    label: '9',
    role: 'Finishing space',
    start: { x: 52, y: 18 },
  },
]

export const FULLBACK_SKILL_BALL_START: FullbackScenarioPoint = { x: 33, y: 68 }

export const FULLBACK_SKILL_STEPS: FullbackScenarioStep[] = [
  {
    id: 'six-to-ten',
    cue: 'Link',
    kind: 'pass',
    ballFrom: { x: 33, y: 68 },
    ballTo: { x: 51, y: 52 },
    duration: 0.85,
  },
  {
    id: 'ten-to-winger',
    cue: 'Wide release',
    kind: 'pass',
    ballFrom: { x: 51, y: 52 },
    ballTo: { x: 83, y: 39 },
    duration: 0.95,
  },
  {
    id: 'fullback-run',
    cue: 'Overlap',
    kind: 'run',
    playerId: 'fullback',
    playerTo: { x: 82, y: 48 },
    duration: 0.95,
  },
  {
    id: 'winger-to-fullback',
    cue: 'Combine',
    kind: 'pass',
    ballFrom: { x: 83, y: 39 },
    ballTo: { x: 82, y: 48 },
    duration: 0.7,
  },
  {
    id: 'fullback-to-nine',
    cue: 'Final ball',
    kind: 'cross',
    ballFrom: { x: 82, y: 48 },
    ballTo: { x: 52, y: 18 },
    duration: 1,
  },
  {
    id: 'nine-attack',
    cue: 'Attack space',
    kind: 'run',
    playerId: 'nine',
    playerTo: { x: 52, y: 15 },
    duration: 0.45,
  },
]

export const FULLBACK_SKILL_CAPTION =
  'This pattern shows #2/#3 delivering after the wide combination; in match play, #7/#11 can also be the final server.'
