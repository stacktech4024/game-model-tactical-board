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

export type DefensiveOrganizationStep = PixiPitchPreviewStep & {
  ballFromPlayerId?: string
  ballToPlayerId?: string
  principle: 'DENY' | 'DIRECT' | 'DELAY' | 'BALANCE' | 'CONTROL & RESTRAINT'
  phaseSummary: string
}

export type DefensiveOrganizationTactic = {
  number: number
  title: string
  detail: string
  stepIds: string[]
}

export type DefensiveOrganizationPageCase = {
  id: 'compact-block'
  opponentProblem: string
  system: { shape: string; description: string }
  strategy: string
  tactics: DefensiveOrganizationTactic[]
  skillSet: string[]
  principles: DefensiveOrganizationStep['principle'][]
  caption: string
  ballPosition: DefensiveOrganizationPoint
  initialPossessorId: 'away-5'
  players: DefensiveOrganizationPreviewPlayer[]
  steps: DefensiveOrganizationStep[]
  routes: PixiPitchPreviewRoute[]
  repeatDelay: number
  tokenScale: number
  liveBoardScenarioId: 'defensive-block-force-wide'
}

const players: DefensiveOrganizationPreviewPlayer[] = [
  { id: 'home-1', label: '1', role: 'Goalkeeper protects Zone 1', start: { x: 50, y: 92 }, tone: 'keeper' },
  { id: 'home-2', label: '2', role: 'Ball-side fullback support', start: { x: 76, y: 75 } },
  { id: 'home-3', label: '3', role: 'Far-side fullback balance', start: { x: 24, y: 75 } },
  { id: 'home-4', label: '4', role: 'Far-side centre-back balance', start: { x: 42, y: 78 } },
  { id: 'home-5', label: '5', role: 'Ball-side centre-back cover', start: { x: 58, y: 78 } },
  { id: 'home-6', label: '6', role: 'Central Channel 3 screen', start: { x: 44, y: 61 } },
  { id: 'home-8', label: '8', role: 'Ball-side Channel 3 support', start: { x: 56, y: 58 } },
  { id: 'home-11', label: '11', role: 'Far-side balance', start: { x: 22, y: 48 } },
  { id: 'home-10', label: '10', role: 'Denies the pivot return', start: { x: 48, y: 48 } },
  { id: 'home-7', label: '7', role: 'Delays then presses Channel 1', start: { x: 78, y: 48 } },
  { id: 'home-9', label: '9', role: 'Curved screen and counter outlet', start: { x: 52, y: 37 } },
  { id: 'away-1', label: '1', role: 'Goalkeeper supports buildup', start: { x: 50, y: 7 }, tone: 'keeper', side: 'away' },
  { id: 'away-2', label: '2', role: 'Wide receiver in Channel 1', start: { x: 86, y: 32 }, tone: 'opponent', side: 'away' },
  { id: 'away-3', label: '3', role: 'Weak-side fullback', start: { x: 16, y: 30 }, tone: 'opponent', side: 'away' },
  { id: 'away-4', label: '4', role: 'Supporting centre-back', start: { x: 40, y: 22 }, tone: 'opponent', side: 'away' },
  { id: 'away-5', label: '5', role: 'Centre-back starts the buildup', start: { x: 60, y: 22 }, tone: 'opponent', side: 'away' },
  { id: 'away-6', label: '6', role: 'Pivot receives centrally', start: { x: 51, y: 42 }, tone: 'opponent', side: 'away' },
  { id: 'away-8', label: '8', role: 'Ball-side midfield support', start: { x: 61, y: 48 }, tone: 'opponent', side: 'away' },
  { id: 'away-11', label: '11', role: 'Weak-side winger', start: { x: 18, y: 50 }, tone: 'opponent', side: 'away' },
  { id: 'away-10', label: '10', role: 'Central connector', start: { x: 46, y: 52 }, tone: 'opponent', side: 'away' },
  { id: 'away-7', label: '7', role: 'Pins the ball-side fullback', start: { x: 84, y: 55 }, tone: 'opponent', side: 'away' },
  { id: 'away-9', label: '9', role: 'Pins the centre-backs', start: { x: 50, y: 67 }, tone: 'opponent', side: 'away' },
]

const steps: DefensiveOrganizationStep[] = [
  {
    id: 'opponent-centre-back-possession',
    cue: 'Opponent buildup — centre-back #5 scans while Canada holds a compact 1-4-2-3-1.',
    emphasizePlayerId: 'away-5',
    principle: 'CONTROL & RESTRAINT',
    phaseSummary: 'Hold the compact block until the opponent shows a clear passing trigger.',
    duration: 0.32,
  },
  {
    id: 'centre-back-to-pivot',
    cue: 'Opponent buildup — #5 connects into pivot #6 as Canada closes around Channel 3.',
    ballFrom: { x: 61.5, y: 22 },
    ballTo: { x: 52.5, y: 42 },
    ballFromPlayerId: 'away-5',
    ballToPlayerId: 'away-6',
    playerId: 'away-6',
    playerTo: { x: 51, y: 42 },
    playerMoves: [
      { playerId: 'home-9', to: { x: 56, y: 40 }, startDelay: 0.04 },
      { playerId: 'away-2', to: { x: 86, y: 36 }, startDelay: 0.06 },
      { playerId: 'away-8', to: { x: 62, y: 50 }, startDelay: 0.1 },
      { playerId: 'home-10', to: { x: 49, y: 50 }, startDelay: 0.14 },
      { playerId: 'away-9', to: { x: 50, y: 68 }, startDelay: 0.2 },
    ],
    principle: 'DENY',
    phaseSummary: '#9 curves across the ball while #10 prepares to remove the pivot return.',
    duration: 0.48,
  },
  {
    id: 'deny-central-return',
    cue: 'DENY — #9 screens the centre-back switch, #10 locks the pivot, and #6/#8 protect Channel 3.',
    emphasizePlayerId: 'home-9',
    playerMoves: [
      { playerId: 'home-9', to: { x: 61, y: 36 } },
      { playerId: 'home-10', to: { x: 50, y: 46 }, startDelay: 0.05 },
      { playerId: 'home-6', to: { x: 45, y: 59 }, startDelay: 0.1 },
      { playerId: 'home-8', to: { x: 58, y: 56 }, startDelay: 0.16 },
    ],
    principle: 'DENY',
    phaseSummary: 'Separate cover shadows remove the switch, pivot return, and forward central lane.',
    duration: 0.44,
  },
  {
    id: 'direct-channel-one',
    cue: 'DIRECT — the central route closes, so pivot #6 releases #2 into Channel 1.',
    ballFrom: { x: 52.5, y: 42 },
    ballTo: { x: 87.5, y: 36 },
    ballFromPlayerId: 'away-6',
    ballToPlayerId: 'away-2',
    playerId: 'away-2',
    playerTo: { x: 86, y: 36 },
    playerMoves: [
      { playerId: 'home-7', to: { x: 80, y: 47 }, startDelay: 0.04, facingAngle: 90 },
      { playerId: 'away-7', to: { x: 84, y: 57 }, startDelay: 0.08 },
      { playerId: 'home-8', to: { x: 60, y: 57 }, startDelay: 0.12 },
      { playerId: 'away-8', to: { x: 64, y: 51 }, startDelay: 0.16 },
    ],
    principle: 'DIRECT',
    phaseSummary: 'Canada protects inside and deliberately leaves the touchline as the predictable outlet.',
    duration: 0.5,
  },
  {
    id: 'wide-first-touch',
    cue: 'DELAY — #7 stays controlled while the wide receiver takes the first touch down Channel 1.',
    ballFrom: { x: 87.5, y: 36 },
    ballTo: { x: 87.5, y: 48 },
    ballFromPlayerId: 'away-2',
    ballToPlayerId: 'away-2',
    playerId: 'away-2',
    playerTo: { x: 86, y: 48 },
    playerMoves: [
      { playerId: 'home-7', to: { x: 80, y: 50 }, facingAngle: 90 },
      { playerId: 'home-2', to: { x: 77, y: 69 }, startDelay: 0.12, facingAngle: 45 },
      { playerId: 'home-8', to: { x: 60, y: 59 }, startDelay: 0.18 },
    ],
    principle: 'DELAY',
    phaseSummary: '#7 jockeys instead of diving in, giving the covering unit time to arrive.',
    duration: 0.5,
  },
  {
    id: 'wide-pressure',
    cue: 'DELAY — #7 now presses from inside-out and keeps the receiver against the touchline.',
    emphasizePlayerId: 'home-7',
    playerId: 'home-7',
    playerTo: { x: 83, y: 50 },
    facingAngle: 90,
    principle: 'DELAY',
    phaseSummary: 'The press activates only after the wide touch, with inside access still denied.',
    duration: 0.38,
  },
  {
    id: 'cover-behind-pressure',
    cue: 'BALANCE — #2 supports behind #7, #5 covers the gap, and #8 protects the ball-side Channel 3 lane.',
    emphasizePlayerId: 'home-2',
    playerMoves: [
      { playerId: 'home-2', to: { x: 78, y: 64 } },
      { playerId: 'home-8', to: { x: 61, y: 60 }, startDelay: 0.05 },
      { playerId: 'home-5', to: { x: 61, y: 72 }, startDelay: 0.1 },
      { playerId: 'home-6', to: { x: 47, y: 60 }, startDelay: 0.16 },
    ],
    principle: 'BALANCE',
    phaseSummary: 'Fullback, centre-back, and pivot protect three different depths behind pressure.',
    duration: 0.44,
  },
  {
    id: 'far-side-balance',
    cue: 'BALANCE — the far-side centre-back and fullback narrow later while #11 holds the weak-side lane.',
    emphasizePlayerId: 'home-4',
    playerMoves: [
      { playerId: 'home-6', to: { x: 48, y: 59 } },
      { playerId: 'home-11', to: { x: 30, y: 52 }, startDelay: 0.08 },
      { playerId: 'home-4', to: { x: 47, y: 75 }, startDelay: 0.14 },
      { playerId: 'home-3', to: { x: 31, y: 73 }, startDelay: 0.22 },
    ],
    principle: 'BALANCE',
    phaseSummary: 'The far side narrows after ball-side pressure and cover are established.',
    duration: 0.48,
  },
  {
    id: 'compact-reset',
    cue: 'CONTROL & RESTRAINT — pressure forces the reset and Canada restores the compact 1-4-2-3-1.',
    ballFrom: { x: 87.5, y: 48 },
    ballTo: { x: 61.5, y: 26 },
    ballFromPlayerId: 'away-2',
    ballToPlayerId: 'away-5',
    playerId: 'away-5',
    playerTo: { x: 60, y: 26 },
    playerMoves: [
      { playerId: 'home-7', to: { x: 76, y: 48 } },
      { playerId: 'home-10', to: { x: 48, y: 48 }, startDelay: 0.05 },
      { playerId: 'home-2', to: { x: 75, y: 72 }, startDelay: 0.08 },
      { playerId: 'home-8', to: { x: 56, y: 58 }, startDelay: 0.11 },
      { playerId: 'home-5', to: { x: 58, y: 77 }, startDelay: 0.14 },
      { playerId: 'home-6', to: { x: 44, y: 61 }, startDelay: 0.17 },
      { playerId: 'home-4', to: { x: 42, y: 78 }, startDelay: 0.2 },
      { playerId: 'home-9', to: { x: 52, y: 37 }, startDelay: 0.23 },
      { playerId: 'home-3', to: { x: 24, y: 75 }, startDelay: 0.26 },
      { playerId: 'home-11', to: { x: 22, y: 48 }, startDelay: 0.3 },
    ],
    principle: 'CONTROL & RESTRAINT',
    phaseSummary: 'The team accepts the backward pass and reconnects without chasing unnecessarily.',
    duration: 0.54,
  },
]

const routes: PixiPitchPreviewRoute[] = [
  { id: 'do-centre-back-pivot', from: { x: 61.5, y: 22 }, to: { x: 52.5, y: 42 }, type: 'pass', revealOnStepId: 'centre-back-to-pivot' },
  { id: 'do-nine-curved-screen', from: { x: 52, y: 37 }, to: { x: 61, y: 36 }, type: 'press', revealOnStepId: 'deny-central-return' },
  { id: 'do-ten-pivot-denial', from: { x: 48, y: 48 }, to: { x: 50, y: 46 }, type: 'recovery', revealOnStepId: 'deny-central-return' },
  { id: 'do-six-central-screen', from: { x: 44, y: 61 }, to: { x: 45, y: 59 }, type: 'recovery', revealOnStepId: 'deny-central-return' },
  { id: 'do-direct-channel-one', from: { x: 52.5, y: 42 }, to: { x: 87.5, y: 36 }, type: 'pass', revealOnStepId: 'direct-channel-one' },
  { id: 'do-wide-carry', from: { x: 87.5, y: 36 }, to: { x: 87.5, y: 48 }, type: 'dribble', revealOnStepId: 'wide-first-touch' },
  { id: 'do-seven-delay', from: { x: 78, y: 48 }, to: { x: 80, y: 50 }, type: 'recovery', revealOnStepId: 'wide-first-touch' },
  { id: 'do-seven-wide-pressure', from: { x: 80, y: 50 }, to: { x: 83, y: 50 }, type: 'press', revealOnStepId: 'wide-pressure' },
  { id: 'do-two-cover', from: { x: 77, y: 69 }, to: { x: 78, y: 64 }, type: 'recovery', revealOnStepId: 'cover-behind-pressure' },
  { id: 'do-five-cover', from: { x: 58, y: 78 }, to: { x: 61, y: 72 }, type: 'recovery', revealOnStepId: 'cover-behind-pressure' },
  { id: 'do-far-side-balance', from: { x: 42, y: 78 }, to: { x: 47, y: 75 }, type: 'recovery', revealOnStepId: 'far-side-balance' },
  { id: 'do-opponent-reset', from: { x: 87.5, y: 48 }, to: { x: 61.5, y: 26 }, type: 'pass', revealOnStepId: 'compact-reset' },
]

export const DEFENSIVE_ORGANIZATION_PAGE_CASE: DefensiveOrganizationPageCase = {
  id: 'compact-block',
  opponentProblem: 'The opponent uses a centre-back, pivot, wide receiver, supporting midfielder, and pinning forward to test central access before progressing outside.',
  system: {
    shape: '1-4-2-3-1 block',
    description: 'GK, connected back four, staggered #6/#8, #10 central screen, #7/#11 wide midfielders, and #9 screening while staying available as the counter outlet.',
  },
  strategy: 'Protect Zones 1/2, deny central Channels 2/3, direct play into Channel 1, and press only when the wide touch creates the trigger.',
  tactics: [
    { number: 1, title: 'Screen central access', detail: '#9 curves to deny the switch while remaining the counter outlet; #10 denies the pivot return.', stepIds: ['centre-back-to-pivot', 'deny-central-return'] },
    { number: 2, title: 'Protect Channels 2/3', detail: '#6/#8 stagger across separate inside depths.', stepIds: ['deny-central-return', 'direct-channel-one'] },
    { number: 3, title: 'Delay wide', detail: '#7 controls the first touch, then presses in Channel 1.', stepIds: ['wide-first-touch', 'wide-pressure'] },
    { number: 4, title: 'Balance behind', detail: 'Fullback supports, centre-back covers, and the far side narrows later.', stepIds: ['cover-behind-pressure', 'far-side-balance', 'compact-reset'] },
  ],
  skillSet: ['Cover shadow', 'Delay and jockey', 'Inside-out press angle', 'Cover and balance', 'Unit shifting'],
  principles: ['DENY', 'DIRECT', 'DELAY', 'BALANCE', 'CONTROL & RESTRAINT'],
  caption: 'Opponent buildup is screened centrally, directed into Channel 1, delayed at the touchline, and contained by layered cover before the 1-4-2-3-1 resets.',
  ballPosition: { x: 61.5, y: 22 },
  initialPossessorId: 'away-5',
  players,
  steps,
  routes,
  repeatDelay: 1.35,
  tokenScale: 0.74,
  liveBoardScenarioId: 'defensive-block-force-wide',
}
