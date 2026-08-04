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
  { id: 'short-option', label: '3', role: 'Short decoy option', start: { x: 7, y: 12 }, facingAngle: 115.0 },
  { id: 'nine', label: '9', role: 'Header threat', start: { x: 46, y: 30 }, facingAngle: -49.9 },
  { id: 'ten', label: '10', role: 'Second-ball support', start: { x: 30, y: 38 }, facingAngle: -29.5 },
  { id: 'eight', label: '8', role: 'Edge second-ball support', start: { x: 22, y: 32 }, facingAngle: -15.0 },
  { id: 'rest-defender', label: '4', role: 'Rest-defence balance', start: { x: 62, y: 48 }, facingAngle: -65.0 },
  { id: 'keeper', label: '1', role: 'Goalkeeper', start: { x: 50, y: 93 }, tone: 'keeper' },
  { id: 'right-back', label: '2', role: 'Rest-defence cover', start: { x: 85, y: 73 } },
  { id: 'right-centre-back', label: '5', role: 'Rest-defence cover', start: { x: 62, y: 76 } },
  { id: 'six', label: '6', role: 'Rest-defence screen', start: { x: 38, y: 50 } },
  { id: 'left-wing', label: '11', role: 'Weak-side balance', start: { x: 15, y: 41 } },
  {
    id: 'opponent-keeper',
    label: '1',
    role: 'Goalkeeper',
    start: { x: 50, y: 3 },
    tone: 'keeper',
    facingAngle: -95.5,
  },
  {
    id: 'opponent-near-post',
    label: '4',
    role: 'Near-post cover',
    start: { x: 40, y: 8 },
    tone: 'opponent',
    facingAngle: -85.4,
  },
  {
    id: 'opponent-marker',
    label: '10',
    role: 'Marker on #9',
    start: { x: 48, y: 24 },
    tone: 'opponent',
    facingAngle: -75.0,
  },
  {
    id: 'opponent-blocker',
    label: '11',
    role: 'Central blocker',
    start: { x: 32, y: 16 },
    tone: 'opponent',
    facingAngle: -82.0,
  },
  {
    id: 'opponent-far-post',
    label: '5',
    role: 'Far-post cover',
    start: { x: 60, y: 8 },
    tone: 'opponent',
    facingAngle: -87.0,
  },
  {
    id: 'opponent-outlet',
    label: '9',
    role: 'Outlet if cleared',
    start: { x: 75, y: 44 },
    tone: 'opponent',
    facingAngle: -115.0,
  },
  { id: 'opponent-two', label: '2', role: 'Back-post cover', start: { x: 79, y: 14 }, tone: 'opponent' },
  { id: 'opponent-three', label: '3', role: 'Short-option pressure', start: { x: 21, y: 14 }, tone: 'opponent' },
  { id: 'opponent-six', label: '6', role: 'Zone screen', start: { x: 50, y: 12 }, tone: 'opponent' },
  { id: 'opponent-seven', label: '7', role: 'Box marker', start: { x: 74, y: 24 }, tone: 'opponent' },
  { id: 'opponent-eight', label: '8', role: 'Box marker', start: { x: 65, y: 20 }, tone: 'opponent' },
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

function getMovement(id: string): CornerPreviewMovement {
  const movement = CORNER_PREVIEW_MOVEMENTS.find((item) => item.id === id)

  if (!movement) {
    throw new Error(`Missing corner preview movement: ${id}`)
  }

  return movement
}

const shortTouch = getMovement('short-touch')
const crossIn = getMovement('cross-in')
const secondBallSupport = getMovement('second-ball-support')
const nineAttacks = getMovement('nine-attacks')
const headerFinish = getMovement('header-finish')

export const CORNER_PREVIEW_STEPS: PixiPitchPreviewStep[] = [
  { id: 'short-touch', cue: 'Short touch decoy', ballFrom: shortTouch.from, ballTo: shortTouch.to, duration: 0.35 },
  {
    id: 'cross-in',
    cue: 'Cross into the corridor',
    ballFrom: crossIn.from,
    ballTo: crossIn.to,
    playerId: secondBallSupport.playerId,
    playerTo: secondBallSupport.to,
    duration: 0.7,
  },
  { id: 'nine-arrives', cue: '#9 attacks the corridor', playerId: nineAttacks.playerId, playerTo: nineAttacks.to, duration: 0.55 },
  {
    id: 'header',
    cue: 'Header on goal',
    ballFrom: headerFinish.from,
    ballTo: headerFinish.to,
    emphasizePlayerId: 'nine',
    emphasisCue: 'Header!',
    duration: 0.4,
  },
  { id: 'goal', cue: 'Goal', emphasizePlayerId: 'nine', duration: 0.3 },
]

const REVEAL_STEP_BY_MOVEMENT_ID: Record<string, string> = {
  'short-touch': 'short-touch',
  'cross-in': 'cross-in',
  'second-ball-support': 'cross-in',
  'nine-attacks': 'nine-arrives',
  'header-finish': 'header',
}

export const CORNER_PREVIEW_ROUTES: PixiPitchPreviewRoute[] = CORNER_PREVIEW_MOVEMENTS.map((movement) => ({
  id: movement.id,
  from: movement.from,
  to: movement.to,
  type: movement.kind === 'support' ? 'recovery' : movement.kind,
  revealOnStepId: REVEAL_STEP_BY_MOVEMENT_ID[movement.id],
}))

export const CORNER_PREVIEW_CAPTION =
  'Short touch to change the angle, loop a cross into the corridor, then attack it for a header.'
import type { PixiPitchPreviewRoute, PixiPitchPreviewStep } from '../../renderers/pixi/PixiPitchPreview'
