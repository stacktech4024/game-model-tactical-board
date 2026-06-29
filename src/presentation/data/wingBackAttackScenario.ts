export type WingBackPreviewPoint = {
  x: number
  y: number
}

export type WingBackPreviewPlayer = {
  id: string
  label: string
  role: string
  start: WingBackPreviewPoint
  tone?: 'primary' | 'support' | 'opponent'
}

export type WingBackPreviewMovement = {
  id: string
  playerId?: string
  from: WingBackPreviewPoint
  to: WingBackPreviewPoint
  kind: 'pass' | 'run' | 'support'
}

export const WING_BACK_PREVIEW_PLAYERS: WingBackPreviewPlayer[] = [
  { id: 'centre-back', label: '5', role: 'Back-three passer', start: { x: 50, y: 78 } },
  { id: 'left-wing-back', label: '3', role: 'Left wing-back', start: { x: 14, y: 62 } },
  { id: 'right-wing-back', label: '2', role: 'Right wing-back', start: { x: 84, y: 62 } },
  { id: 'ten', label: '10', role: 'Central finisher', start: { x: 54, y: 32 } },
  { id: 'opponent-tracker', label: '', role: 'Tracks left wing-back', start: { x: 16, y: 58 }, tone: 'opponent' },
  { id: 'opponent-screen', label: '', role: 'Screens the middle', start: { x: 50, y: 50 }, tone: 'opponent' },
]

export const WING_BACK_PREVIEW_BALL_START: WingBackPreviewPoint = { x: 50, y: 78 }

export const WING_BACK_PREVIEW_MOVEMENTS: WingBackPreviewMovement[] = [
  {
    id: 'release-left',
    from: { x: 50, y: 78 },
    to: { x: 14, y: 62 },
    kind: 'pass',
  },
  {
    id: 'right-wing-back-high',
    playerId: 'right-wing-back',
    from: { x: 84, y: 62 },
    to: { x: 88, y: 30 },
    kind: 'run',
  },
  {
    id: 'left-wing-back-carries',
    playerId: 'left-wing-back',
    from: { x: 14, y: 62 },
    to: { x: 10, y: 30 },
    kind: 'run',
  },
  {
    id: 'combine-central',
    from: { x: 10, y: 30 },
    to: { x: 46, y: 22 },
    kind: 'pass',
  },
  {
    id: 'ten-arrives',
    playerId: 'ten',
    from: { x: 54, y: 32 },
    to: { x: 46, y: 18 },
    kind: 'run',
  },
  {
    id: 'finish',
    from: { x: 46, y: 22 },
    to: { x: 50, y: 8 },
    kind: 'pass',
  },
]

export const WING_BACK_PREVIEW_CAPTION =
  'Secure the base with the back three, release both wing-backs high, then combine centrally to finish.'
