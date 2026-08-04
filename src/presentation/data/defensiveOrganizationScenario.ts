export type DefensiveOrganizationPoint = {
  x: number
  y: number
}

export type DefensiveOrganizationPlayer = {
  id: string
  label: string
  role: string
  start: DefensiveOrganizationPoint
  tone?: 'primary' | 'support' | 'opponent' | 'keeper'
}

export type DefensiveOrganizationMovement = {
  id: string
  playerId: string
  from: DefensiveOrganizationPoint
  to: DefensiveOrganizationPoint
  kind: 'press' | 'recovery' | 'run'
}

export const DEFENSIVE_ORGANIZATION_PLAYERS: DefensiveOrganizationPlayer[] = [
  { id: 'keeper', label: '1', role: 'Sweeper-keeper', start: { x: 50, y: 85 }, tone: 'keeper' },
  { id: 'left-centre-back', label: '4', role: 'Backline shift', start: { x: 41, y: 55 } },
  { id: 'right-centre-back', label: '5', role: 'Backline shift', start: { x: 59, y: 55 } },
  { id: 'left-back', label: '3', role: 'Cover shift', start: { x: 24, y: 53 } },
  { id: 'right-back', label: '2', role: 'Shift to cover', start: { x: 77, y: 53 } },
  { id: 'six', label: '6', role: 'Screen central lane', start: { x: 40, y: 43 }, tone: 'support' },
  { id: 'eight', label: '8', role: 'Screen central lane', start: { x: 60, y: 43 }, tone: 'support' },
  { id: 'left-wing', label: '11', role: 'Weak-side tuck', start: { x: 27, y: 37 } },
  { id: 'right-wing', label: '7', role: 'Press trigger', start: { x: 74, y: 37 } },
  { id: 'nine', label: '9', role: 'Screen the pivot', start: { x: 50, y: 41 } },
  { id: 'opponent-carrier', label: '5', role: 'Ball carrier', start: { x: 59, y: 20 }, tone: 'opponent' },
  { id: 'opponent-outlet', label: '2', role: 'Wide outlet', start: { x: 88, y: 30 }, tone: 'opponent' },
  { id: 'ten', label: '10', role: 'Holds position', start: { x: 50, y: 41 } },
  { id: 'opponent-keeper', label: '1', role: 'Goalkeeper', start: { x: 50, y: 6 }, tone: 'keeper' },
  { id: 'opponent-three', label: '3', role: 'Holds position', start: { x: 84, y: 22 }, tone: 'opponent' },
  { id: 'opponent-four', label: '4', role: 'Holds position', start: { x: 38, y: 20 }, tone: 'opponent' },
  { id: 'opponent-six', label: '6', role: 'Holds position', start: { x: 41, y: 34 }, tone: 'opponent' },
  { id: 'opponent-seven', label: '7', role: 'Holds position', start: { x: 79, y: 46 }, tone: 'opponent' },
  { id: 'opponent-eight', label: '8', role: 'Holds position', start: { x: 59, y: 46 }, tone: 'opponent' },
  { id: 'opponent-nine', label: '9', role: 'Holds position', start: { x: 50, y: 60 }, tone: 'opponent' },
  { id: 'opponent-ten', label: '10', role: 'Holds position', start: { x: 50, y: 42 }, tone: 'opponent' },
  { id: 'opponent-eleven', label: '11', role: 'Holds position', start: { x: 15, y: 46 }, tone: 'opponent' },
]

export const DEFENSIVE_ORGANIZATION_BALL: DefensiveOrganizationPoint = { x: 59, y: 20 }

export const DEFENSIVE_ORGANIZATION_MOVEMENTS: DefensiveOrganizationMovement[] = [
  {
    id: 'screen-pivot',
    playerId: 'nine',
    from: { x: 50, y: 41 },
    to: { x: 50, y: 33 },
    kind: 'recovery',
  },
  {
    id: 'press-wide',
    playerId: 'right-wing',
    from: { x: 74, y: 37 },
    to: { x: 86, y: 26 },
    kind: 'press',
  },
  {
    id: 'gk-sweep',
    playerId: 'keeper',
    from: { x: 50, y: 85 },
    to: { x: 50, y: 76 },
    kind: 'run',
  },
]

export const DEFENSIVE_ORGANIZATION_CAPTION =
  'Screen the pivot, force play into the wide channel, press on the trigger, and shift compactly behind a high line with the GK sweeping.'
