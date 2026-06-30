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
  kind: 'pass' | 'run' | 'support' | 'press'
}

export const WING_BACK_PREVIEW_PLAYERS: WingBackPreviewPlayer[] = [
  { id: 'nine', label: '9', role: 'High outlet', start: { x: 50, y: 27 }, tone: 'support' },
  { id: 'ten', label: '10', role: 'Screen into Channel 3', start: { x: 50, y: 42 } },
  { id: 'left-wing', label: '11', role: 'Ball-side wide pressure', start: { x: 22, y: 48 } },
  { id: 'six', label: '6', role: 'Central screen', start: { x: 42, y: 58 }, tone: 'support' },
  { id: 'eight', label: '8', role: 'Balance and cover', start: { x: 58, y: 58 }, tone: 'support' },
  { id: 'left-back', label: '3', role: 'Back-line compactness', start: { x: 24, y: 74 } },
  { id: 'left-centre-back', label: '4', role: 'Deny central entry', start: { x: 42, y: 78 } },
  { id: 'right-centre-back', label: '5', role: 'Deny central entry', start: { x: 58, y: 78 } },
  { id: 'right-back', label: '2', role: 'Weak-side balance', start: { x: 76, y: 74 } },
  { id: 'opponent-carrier', label: '', role: 'Wide ball carrier', start: { x: 16, y: 45 }, tone: 'opponent' },
  { id: 'opponent-wide', label: '', role: 'Wide outlet', start: { x: 10, y: 32 }, tone: 'opponent' },
  { id: 'opponent-central', label: '', role: 'Central option', start: { x: 46, y: 38 }, tone: 'opponent' },
  { id: 'opponent-centre-back', label: '', role: 'Supporting centre-back', start: { x: 54, y: 64 }, tone: 'opponent' },
]

export const WING_BACK_PREVIEW_BALL_START: WingBackPreviewPoint = { x: 16, y: 45 }

export const WING_BACK_PREVIEW_MOVEMENTS: WingBackPreviewMovement[] = [
  {
    id: 'force-wide-pass',
    from: { x: 46, y: 38 },
    to: { x: 16, y: 45 },
    kind: 'pass',
  },
  {
    id: 'wide-pressure',
    playerId: 'left-wing',
    from: { x: 22, y: 48 },
    to: { x: 18, y: 45 },
    kind: 'press',
  },
  {
    id: 'ten-screen',
    playerId: 'ten',
    from: { x: 50, y: 42 },
    to: { x: 44, y: 43 },
    kind: 'support',
  },
  {
    id: 'six-slide',
    playerId: 'six',
    from: { x: 42, y: 58 },
    to: { x: 36, y: 55 },
    kind: 'support',
  },
  {
    id: 'back-line-shift',
    playerId: 'left-back',
    from: { x: 24, y: 74 },
    to: { x: 20, y: 70 },
    kind: 'support',
  },
]

export const WING_BACK_PREVIEW_CAPTION =
  'Stay compact, deny Channel 2/3, force the opponent wide, and keep a high outlet ready.'
