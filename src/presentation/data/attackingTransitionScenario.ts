export type AttackingTransitionPoint = {
  x: number
  y: number
}

export type AttackingTransitionPlayer = {
  id: string
  label: string
  role: string
  start: AttackingTransitionPoint
  tone?: 'primary' | 'support' | 'opponent'
}

export type AttackingTransitionMovement = {
  id: string
  playerId?: string
  from: AttackingTransitionPoint
  to: AttackingTransitionPoint
  kind: 'pass' | 'run' | 'support'
}

export const ATTACKING_TRANSITION_PLAYERS: AttackingTransitionPlayer[] = [
  { id: 'regainer', label: '6', role: 'Ball regainer', start: { x: 50, y: 67 }, tone: 'support' },
  { id: 'ten', label: '10', role: 'First forward option', start: { x: 50, y: 43 } },
  { id: 'nine', label: '9', role: 'Central depth', start: { x: 50, y: 25 } },
  { id: 'left-wing', label: '11', role: 'Left transition runner', start: { x: 27, y: 38 } },
  { id: 'right-wing', label: '7', role: 'Right transition runner', start: { x: 73, y: 38 } },
  { id: 'eight', label: '8', role: 'Support underneath', start: { x: 38, y: 68 } },
  { id: 'opponent-left', label: '', role: 'Recovering opponent', start: { x: 36, y: 34 }, tone: 'opponent' },
  { id: 'opponent-right', label: '', role: 'Recovering opponent', start: { x: 64, y: 35 }, tone: 'opponent' },
]

export const ATTACKING_TRANSITION_BALL_START: AttackingTransitionPoint = { x: 50, y: 67 }

export const ATTACKING_TRANSITION_MOVEMENTS: AttackingTransitionMovement[] = [
  {
    id: 'first-pass',
    from: { x: 50, y: 67 },
    to: { x: 50, y: 43 },
    kind: 'pass',
  },
  {
    id: 'nine-stretch',
    playerId: 'nine',
    from: { x: 50, y: 25 },
    to: { x: 50, y: 14 },
    kind: 'run',
  },
  {
    id: 'left-run',
    playerId: 'left-wing',
    from: { x: 27, y: 38 },
    to: { x: 18, y: 19 },
    kind: 'run',
  },
  {
    id: 'right-run',
    playerId: 'right-wing',
    from: { x: 73, y: 38 },
    to: { x: 82, y: 19 },
    kind: 'run',
  },
  {
    id: 'eight-support',
    playerId: 'eight',
    from: { x: 38, y: 68 },
    to: { x: 42, y: 55 },
    kind: 'support',
  },
]

export const ATTACKING_TRANSITION_CAPTION =
  'Regain and play forward immediately: #9 gives depth, wide forwards run beyond, and #8 supports the next action.'
