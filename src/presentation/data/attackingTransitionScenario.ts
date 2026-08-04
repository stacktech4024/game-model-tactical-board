export type AttackingTransitionPoint = {
  x: number
  y: number
}

export type AttackingTransitionPlayer = {
  id: string
  label: string
  role: string
  start: AttackingTransitionPoint
  tone?: 'primary' | 'support' | 'opponent' | 'keeper'
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
  { id: 'rest-defender', label: '4', role: 'Rest-defence cover', start: { x: 50, y: 80 }, tone: 'support' },
  { id: 'opponent-lost-ball', label: '8', role: 'Player dispossessed', start: { x: 54, y: 66 }, tone: 'opponent' },
  { id: 'opponent-counterpress', label: '6', role: 'Nearest counter-press', start: { x: 45, y: 60 }, tone: 'opponent' },
  { id: 'opponent-left', label: '3', role: 'Recovering opponent', start: { x: 36, y: 34 }, tone: 'opponent' },
  { id: 'opponent-right', label: '2', role: 'Recovering opponent', start: { x: 64, y: 35 }, tone: 'opponent' },
  { id: 'opponent-cover', label: '5', role: 'Covering centre-back', start: { x: 50, y: 19 }, tone: 'opponent' },
  { id: 'keeper', label: '1', role: 'Goalkeeper', start: { x: 50, y: 93 }, tone: 'keeper' },
  { id: 'right-back', label: '2', role: 'Holds position', start: { x: 85, y: 71 } },
  { id: 'left-back', label: '3', role: 'Holds position', start: { x: 15, y: 71 } },
  { id: 'right-centre-back', label: '5', role: 'Holds position', start: { x: 62, y: 76 } },
  { id: 'opponent-keeper', label: '1', role: 'Goalkeeper', start: { x: 50, y: 6 }, tone: 'keeper' },
  { id: 'opponent-four', label: '4', role: 'Holds position', start: { x: 38, y: 20 }, tone: 'opponent' },
  { id: 'opponent-seven', label: '7', role: 'Holds position', start: { x: 81, y: 59 }, tone: 'opponent' },
  { id: 'opponent-nine', label: '9', role: 'Holds position', start: { x: 50, y: 66 }, tone: 'opponent' },
  { id: 'opponent-ten', label: '10', role: 'Holds position', start: { x: 63, y: 45 }, tone: 'opponent' },
  { id: 'opponent-eleven', label: '11', role: 'Holds position', start: { x: 19, y: 59 }, tone: 'opponent' },
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
