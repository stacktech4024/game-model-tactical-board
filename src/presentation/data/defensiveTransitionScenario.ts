export type DefensiveTransitionPoint = {
  x: number
  y: number
}

export type DefensiveTransitionPlayer = {
  id: string
  label: string
  role: string
  start: DefensiveTransitionPoint
  tone?: 'primary' | 'support'
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
