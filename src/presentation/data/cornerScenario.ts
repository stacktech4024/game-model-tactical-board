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
  // Static facing in degrees (0 = up the pitch, 90 = toward +x), matching the
  // SquadPlayer.facingAngle convention. Computed as the bearing from each
  // player's start position toward the corner-flag/ball start position, so
  // the defending block and waiting attackers are oriented toward the
  // delivery rather than defaulting to a flat upfield/downfield stance -
  // this is how a real defending unit organizes before a corner: every
  // zonal marker and the keeper turn to track the corner taker and the
  // ball, not face square down the pitch. Once a player's first scripted
  // movement begins, their rotation is driven by that movement instead.
  facingAngle?: number
}

export type CornerPreviewMovement = {
  id: string
  playerId?: string
  from: CornerPreviewPoint
  to: CornerPreviewPoint
  kind: 'pass' | 'run' | 'support'
}

export const CORNER_PREVIEW_PLAYERS: CornerPreviewPlayer[] = [
  { id: 'corner-taker', label: '7', role: 'Corner taker', start: { x: 2, y: 6 }, facingAngle: 102.4 },
  { id: 'nine', label: '9', role: 'Header threat', start: { x: 46, y: 30 }, facingAngle: -49.9 },
  { id: 'ten', label: '10', role: 'Second-ball support', start: { x: 30, y: 38 }, facingAngle: -29.5 },
  {
    id: 'opponent-keeper',
    label: '',
    role: 'Goalkeeper',
    start: { x: 50, y: 3 },
    tone: 'keeper',
    facingAngle: -95.5,
  },
  {
    id: 'opponent-near-post',
    label: '',
    role: 'Near-post cover',
    start: { x: 40, y: 8 },
    tone: 'opponent',
    facingAngle: -85.4,
  },
  {
    id: 'opponent-far-post',
    label: '',
    role: 'Far-post cover',
    start: { x: 60, y: 8 },
    tone: 'opponent',
    facingAngle: -87.0,
  },
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
