export type CornerPreviewPoint = {
  x: number
  y: number
}

export type CornerPreviewPlayer = {
  id: string
  label: string
  role: string
  start: CornerPreviewPoint
  tone?: 'primary' | 'support' | 'opponent' | 'keeper'
}

export type CornerPreviewMovement = {
  id: string
  playerId?: string
  from: CornerPreviewPoint
  to: CornerPreviewPoint
  kind: 'pass' | 'run' | 'support'
}

export const CORNER_PREVIEW_PLAYERS: CornerPreviewPlayer[] = [
  { id: 'corner-taker', label: '7', role: 'Corner taker', start: { x: 2, y: 6 } },
  { id: 'nine', label: '9', role: 'Header threat', start: { x: 46, y: 30 } },
  { id: 'ten', label: '10', role: 'Second-ball support', start: { x: 30, y: 38 } },
  { id: 'opponent-keeper', label: '', role: 'Goalkeeper', start: { x: 50, y: 3 }, tone: 'keeper' },
  { id: 'opponent-near-post', label: '', role: 'Near-post cover', start: { x: 40, y: 8 }, tone: 'opponent' },
  { id: 'opponent-far-post', label: '', role: 'Far-post cover', start: { x: 60, y: 8 }, tone: 'opponent' },
]

export const CORNER_PREVIEW_BALL_START: CornerPreviewPoint = { x: 2, y: 6 }

export const CORNER_PREVIEW_MOVEMENTS: CornerPreviewMovement[] = [
  {
    id: 'short-touch',
    from: { x: 2, y: 6 },
    to: { x: 6, y: 10 },
    kind: 'pass',
  },
  {
    id: 'cross-in',
    from: { x: 6, y: 10 },
    to: { x: 44, y: 12 },
    kind: 'pass',
  },
  {
    id: 'second-ball-support',
    playerId: 'ten',
    from: { x: 30, y: 38 },
    to: { x: 30, y: 18 },
    kind: 'support',
  },
  {
    id: 'nine-attacks',
    playerId: 'nine',
    from: { x: 46, y: 30 },
    to: { x: 44, y: 12 },
    kind: 'run',
  },
  {
    id: 'header-finish',
    from: { x: 44, y: 12 },
    to: { x: 50, y: 0 },
    kind: 'pass',
  },
]

export const CORNER_PREVIEW_CAPTION =
  'Short touch to change the angle, loop a cross into the corridor, then attack it for a header.'
