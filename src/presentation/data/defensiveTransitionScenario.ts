export type DefensiveTransitionPoint = {
  x: number
  y: number
}

export type DefensiveTransitionPlayer = {
  id: string
  label: string
  role: string
  start: DefensiveTransitionPoint
  tone?: 'primary' | 'support' | 'opponent' | 'keeper'
}

export type DefensiveTransitionMovement = {
  id: string
  playerId: string
  from: DefensiveTransitionPoint
  to: DefensiveTransitionPoint
  kind: 'press' | 'recovery'
}

export const DEFENSIVE_TRANSITION_PLAYERS: DefensiveTransitionPlayer[] = [
  { id: 'loss-player', label: '7', role: 'Ball-loss trigger', start: { x: 72, y: 40 } },
  { id: 'nearest-presser', label: '10', role: 'Nearest pressure', start: { x: 57, y: 51 } },
  { id: 'lane-blocker', label: '8', role: 'Escape-lane blocker', start: { x: 43, y: 55 } },
  { id: 'six', label: '6', role: 'Counter-lane cover', start: { x: 48, y: 67 }, tone: 'support' },
  { id: 'left-back', label: '3', role: 'Compact back line', start: { x: 24, y: 79 } },
  { id: 'left-centre-back', label: '4', role: 'Compact back line', start: { x: 41, y: 81 } },
  { id: 'right-centre-back', label: '5', role: 'Compact back line', start: { x: 59, y: 81 } },
  { id: 'right-back', label: '2', role: 'Compact back line', start: { x: 76, y: 79 } },
  { id: 'opponent-carrier', label: '8', role: 'Ball carrier', start: { x: 72, y: 43 }, tone: 'opponent' },
  { id: 'opponent-support', label: '10', role: 'Immediate support', start: { x: 61, y: 49 }, tone: 'opponent' },
  { id: 'opponent-outlet', label: '7', role: 'Counter-attacking outlet', start: { x: 84, y: 35 }, tone: 'opponent' },
  { id: 'opponent-runner', label: '9', role: 'Central runner', start: { x: 47, y: 34 }, tone: 'opponent' },
  { id: 'keeper', label: '1', role: 'Goalkeeper', start: { x: 50, y: 93 }, tone: 'keeper' },
  { id: 'nine', label: '9', role: 'Holds position', start: { x: 50, y: 16 } },
  { id: 'eleven', label: '11', role: 'Holds position', start: { x: 13, y: 24 } },
  { id: 'opponent-keeper', label: '1', role: 'Goalkeeper', start: { x: 50, y: 6 }, tone: 'keeper' },
  { id: 'opponent-two', label: '2', role: 'Holds position', start: { x: 85, y: 22 }, tone: 'opponent' },
  { id: 'opponent-three', label: '3', role: 'Holds position', start: { x: 15, y: 22 }, tone: 'opponent' },
  { id: 'opponent-four', label: '4', role: 'Holds position', start: { x: 38, y: 20 }, tone: 'opponent' },
  { id: 'opponent-five', label: '5', role: 'Holds position', start: { x: 62, y: 20 }, tone: 'opponent' },
  { id: 'opponent-six', label: '6', role: 'Holds position', start: { x: 50, y: 34 }, tone: 'opponent' },
  { id: 'opponent-eleven', label: '11', role: 'Holds position', start: { x: 19, y: 59 }, tone: 'opponent' },
]

export const DEFENSIVE_TRANSITION_BALL: DefensiveTransitionPoint = { x: 72, y: 43 }

export const DEFENSIVE_TRANSITION_MOVEMENTS: DefensiveTransitionMovement[] = [
  {
    id: 'nearest-press',
    playerId: 'nearest-presser',
    from: { x: 57, y: 51 },
    to: { x: 68, y: 45 },
    kind: 'press',
  },
  {
    id: 'block-escape',
    playerId: 'lane-blocker',
    from: { x: 43, y: 55 },
    to: { x: 59, y: 48 },
    kind: 'recovery',
  },
  {
    id: 'six-cover',
    playerId: 'six',
    from: { x: 48, y: 67 },
    to: { x: 53, y: 59 },
    kind: 'recovery',
  },
]

export const DEFENSIVE_TRANSITION_CAPTION =
  'React for five seconds: pressure the first touch, lock the forward lane, and secure compact cover behind the press.'
