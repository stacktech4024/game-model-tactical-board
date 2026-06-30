export type WingBackAttackPoint = {
  x: number
  y: number
}

export type WingBackAttackPlayer = {
  id: string
  label: string
  role: string
  start: WingBackAttackPoint
  tone?: 'primary' | 'support' | 'opponent'
}

export type WingBackAttackMovement = {
  id: string
  playerId?: string
  from: WingBackAttackPoint
  to: WingBackAttackPoint
  kind: 'pass' | 'run' | 'support'
}

export const WING_BACK_ATTACK_PLAYERS: WingBackAttackPlayer[] = [
  { id: 'centre-back', label: '5', role: 'Back three anchor', start: { x: 50, y: 80 }, tone: 'support' },
  { id: 'left-wing-back', label: '3', role: 'Left wing-back', start: { x: 16, y: 68 } },
  { id: 'right-wing-back', label: '2', role: 'Right wing-back', start: { x: 84, y: 68 } },
  { id: 'eight', label: '8', role: 'Central support', start: { x: 50, y: 60 }, tone: 'support' },
  { id: 'ten', label: '10', role: 'Combination forward', start: { x: 42, y: 35 } },
  { id: 'nine', label: '9', role: 'Central finisher', start: { x: 50, y: 22 } },
  { id: 'opponent-left', label: '', role: 'Recovering opponent', start: { x: 30, y: 30 }, tone: 'opponent' },
  { id: 'opponent-right', label: '', role: 'Recovering opponent', start: { x: 60, y: 60 }, tone: 'opponent' },
]

export const WING_BACK_ATTACK_BALL_START: WingBackAttackPoint = { x: 50, y: 80 }

export const WING_BACK_ATTACK_MOVEMENTS: WingBackAttackMovement[] = [
  {
    id: 'release-left-wing-back',
    from: { x: 50, y: 80 },
    to: { x: 16, y: 68 },
    kind: 'pass',
  },
  {
    id: 'left-wing-back-high',
    playerId: 'left-wing-back',
    from: { x: 16, y: 68 },
    to: { x: 12, y: 25 },
    kind: 'run',
  },
  {
    id: 'right-wing-back-high',
    playerId: 'right-wing-back',
    from: { x: 84, y: 68 },
    to: { x: 88, y: 25 },
    kind: 'run',
  },
  {
    id: 'eight-support',
    playerId: 'eight',
    from: { x: 50, y: 60 },
    to: { x: 46, y: 45 },
    kind: 'support',
  },
  {
    id: 'wide-to-ten',
    from: { x: 12, y: 25 },
    to: { x: 42, y: 22 },
    kind: 'pass',
  },
  {
    id: 'ten-to-nine',
    from: { x: 42, y: 22 },
    to: { x: 50, y: 10 },
    kind: 'pass',
  },
]

export const WING_BACK_ATTACK_CAPTION =
  'Back three secures the base while both wing-backs release high and wide, then combine centrally for the finish.'
