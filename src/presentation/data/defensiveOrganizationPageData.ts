import type { PixiPitchPreviewRoute, PixiPitchPreviewStep } from '../../renderers/pixi/PixiPitchPreview'

export type DefensiveOrganizationPoint = { x: number; y: number }

export type DefensiveOrganizationPreviewPlayer = {
  id: string
  label: string
  role: string
  start: DefensiveOrganizationPoint
  tone?: 'primary' | 'opponent' | 'keeper'
  side?: 'home' | 'away'
}

export type DefensiveOrganizationPageCase = {
  id: 'compact-block'
  system: { shape: string; description: string }
  strategy: string
  tactics: string[]
  skillSet: string[]
  principles: string[]
  caption: string
  ballPosition: DefensiveOrganizationPoint
  players: DefensiveOrganizationPreviewPlayer[]
  steps: PixiPitchPreviewStep[]
  routes: PixiPitchPreviewRoute[]
  repeatDelay: number
  tokenScale: number
  liveBoardScenarioId: 'defensive-block-force-wide'
}

const players: DefensiveOrganizationPreviewPlayer[] = [
  { id: 'home-1', label: '1', role: 'Goalkeeper protects Zone 1', start: { x: 50, y: 92 }, tone: 'keeper' },
  { id: 'home-2', label: '2', role: 'Right-back connected to the line', start: { x: 76, y: 72 } },
  { id: 'home-3', label: '3', role: 'Left-back protects the box', start: { x: 24, y: 72 } },
  { id: 'home-4', label: '4', role: 'Central box protection', start: { x: 42, y: 75 } },
  { id: 'home-5', label: '5', role: 'Central box protection', start: { x: 58, y: 75 } },
  { id: 'home-6', label: '6', role: 'Screens Channel 2/3', start: { x: 43, y: 57 } },
  { id: 'home-8', label: '8', role: 'Screens Channel 2/3', start: { x: 57, y: 57 } },
  { id: 'home-11', label: '11', role: 'Weak-side balance', start: { x: 23, y: 45 } },
  { id: 'home-10', label: '10', role: 'Central connection', start: { x: 50, y: 43 } },
  { id: 'home-7', label: '7', role: 'Wide delay and press trigger', start: { x: 77, y: 45 } },
  { id: 'home-9', label: '9', role: 'Counter outlet', start: { x: 50, y: 30 } },
  { id: 'away-1', label: '1', role: 'Goalkeeper', start: { x: 50, y: 7 }, tone: 'keeper', side: 'away' },
  { id: 'away-2', label: '2', role: 'Wide possession outlet in Channel 1', start: { x: 84, y: 27 }, tone: 'opponent' },
  { id: 'away-3', label: '3', role: 'Weak-side fullback', start: { x: 16, y: 27 }, tone: 'opponent' },
  { id: 'away-4', label: '4', role: 'Backline support', start: { x: 39, y: 22 }, tone: 'opponent' },
  { id: 'away-5', label: '5', role: 'Ball carrier', start: { x: 59, y: 20 }, tone: 'opponent' },
  { id: 'away-6', label: '6', role: 'Central support', start: { x: 42, y: 37 }, tone: 'opponent' },
  { id: 'away-8', label: '8', role: 'Central support', start: { x: 58, y: 37 }, tone: 'opponent' },
  { id: 'away-11', label: '11', role: 'Weak-side winger', start: { x: 17, y: 45 }, tone: 'opponent' },
  { id: 'away-10', label: '10', role: 'Central connector', start: { x: 50, y: 43 }, tone: 'opponent' },
  { id: 'away-7', label: '7', role: 'High wide option', start: { x: 82, y: 45 }, tone: 'opponent' },
  { id: 'away-9', label: '9', role: 'Central forward', start: { x: 50, y: 58 }, tone: 'opponent' },
]

const steps: PixiPitchPreviewStep[] = [
  { id: 'compact-block', cue: 'Compact 1-4-2-3-1 protects Zone 1/2', emphasizePlayerId: 'home-6', duration: 0.32 },
  {
    id: 'deny-central',
    cue: '#6 and #8 deny Channel 2/3; #9 screens the central pass',
    playerMoves: [
      { playerId: 'home-6', to: { x: 45, y: 55 } },
      { playerId: 'home-8', to: { x: 55, y: 55 } },
      { playerId: 'home-9', to: { x: 50, y: 35 } },
    ],
    duration: 0.46,
  },
  {
    id: 'force-wide',
    cue: 'DENY central access and force the ball into Channel 1',
    ballFrom: { x: 59, y: 20 },
    ballTo: { x: 84, y: 27 },
    playerId: 'away-2',
    playerTo: { x: 84, y: 27 },
    duration: 0.48,
  },
  {
    id: 'wide-control',
    cue: '#7 delays, then presses wide with CONTROL & RESTRAINT',
    playerMoves: [
      { playerId: 'home-7', to: { x: 80, y: 34 } },
      { playerId: 'home-2', to: { x: 70, y: 63 } },
      { playerId: 'home-5', to: { x: 60, y: 72 } },
      { playerId: 'home-11', to: { x: 30, y: 47 } },
    ],
    duration: 0.52,
  },
  { id: 'counter-outlet', cue: '#9 remains available as the counter outlet', emphasizePlayerId: 'home-9', duration: 0.3 },
]

const routes: PixiPitchPreviewRoute[] = [
  { id: 'do-six-screen', from: { x: 43, y: 57 }, to: { x: 45, y: 55 }, type: 'recovery', revealOnStepId: 'deny-central' },
  { id: 'do-eight-screen', from: { x: 57, y: 57 }, to: { x: 55, y: 55 }, type: 'recovery', revealOnStepId: 'deny-central' },
  { id: 'do-nine-screen', from: { x: 50, y: 30 }, to: { x: 50, y: 35 }, type: 'recovery', revealOnStepId: 'deny-central' },
  { id: 'do-force-channel-one', from: { x: 59, y: 20 }, to: { x: 84, y: 27 }, type: 'pass', revealOnStepId: 'force-wide' },
  { id: 'do-seven-wide-pressure', from: { x: 77, y: 45 }, to: { x: 80, y: 34 }, type: 'press', revealOnStepId: 'wide-control' },
  { id: 'do-backline-shift', from: { x: 58, y: 75 }, to: { x: 60, y: 72 }, type: 'recovery', revealOnStepId: 'wide-control' },
]

export const DEFENSIVE_ORGANIZATION_PAGE_CASE: DefensiveOrganizationPageCase = {
  id: 'compact-block',
  system: {
    shape: 'Compact 1-4-2-3-1 block',
    description: 'A connected 1-4-2-3-1 protects Zone 1/2, with #6/#8 screening Channel 2/3, the front line showing play wide, and the back line compact around central and box spaces.',
  },
  strategy: 'DENY central access, DELAY the ball into Channel 1, then apply DIRECT but controlled wide pressure while BALANCE protects the centre and #9 remains ready to counter.',
  tactics: [
    '#6 and #8 stay connected to deny Channel 2/3',
    '#9 screens the central pass while remaining the counter outlet',
    'Wide player delays first, then presses only when the ball enters Channel 1',
    'Back line shifts together to protect Zone 1/2, central spaces, and the box',
    '#10 and the weak-side wide player tuck in for BALANCE',
  ],
  skillSet: ['Cover shadow', 'Delay and jockey', 'Wide press angle', 'Unit shifting', 'Box protection'],
  principles: ['DENY', 'DELAY', 'DIRECT', 'BALANCE', 'CONTROL & RESTRAINT'],
  caption: 'Compact in Zone 1/2, deny Channel 2/3, show play into Channel 1, and press the wide trigger without losing the central block.',
  ballPosition: { x: 59, y: 20 },
  players,
  steps,
  routes,
  repeatDelay: 1.2,
  tokenScale: 0.76,
  liveBoardScenarioId: 'defensive-block-force-wide',
}
