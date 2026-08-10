import type { PixiPitchPreviewProps } from '../../renderers/pixi/PixiPitchPreview'
import { CORNER_PIXI_SCENARIO } from './cornerPixiAdapter.ts'

type PreviewPlayer = PixiPitchPreviewProps['players'][number]
type PreviewStep = NonNullable<PixiPitchPreviewProps['steps']>[number]
type PreviewRoute = NonNullable<PixiPitchPreviewProps['routes']>[number]

export type SetPieceCaseId =
  | 'attacking-corner'
  | 'defending-corner'
  | 'wide-free-kick'
  | 'throw-in'

export type SetPiecePageCase = {
  id: SetPieceCaseId
  tabLabel: string
  setPieceType: string
  organization: string
  strategy: string
  tactics: string[]
  skillSet: string[]
  principles: string[]
  caption: string
  realityReference: string
  implementation: 'Full animation' | 'Short presentation sequence'
  preview: {
    players: PreviewPlayer[]
    ballPosition: { x: number; y: number }
    steps: PreviewStep[]
    routes: PreviewRoute[]
  }
  tokenScale: number
  repeatDelay: number
  liveBoardScenarioId?: 'corner-short-decoy-wide-delivery'
}

const home = (
  id: string,
  label: string,
  x: number,
  y: number,
  tone: PreviewPlayer['tone'] = 'primary',
): PreviewPlayer => ({ id, label, x, y, tone })

const away = (id: string, label: string, x: number, y: number): PreviewPlayer => ({
  id,
  label,
  x,
  y,
  tone: 'opponent',
  side: 'away',
})

const defendingCornerPlayers: PreviewPlayer[] = [
  home('dc-home-1', '1', 50, 96, 'keeper'),
  home('dc-home-2', '2', 64, 88),
  home('dc-home-3', '3', 38, 76),
  home('dc-home-4', '4', 38, 90),
  home('dc-home-5', '5', 48, 90),
  home('dc-home-6', '6', 58, 89),
  home('dc-home-7', '7', 88, 86),
  home('dc-home-8', '8', 46, 78),
  home('dc-home-9', '9', 50, 55),
  home('dc-home-10', '10', 54, 76),
  home('dc-home-11', '11', 50, 68),
  away('dc-away-1', '1', 50, 5),
  away('dc-away-2', '2', 72, 60),
  away('dc-away-3', '3', 91, 89),
  away('dc-away-4', '4', 36, 74),
  away('dc-away-5', '5', 41, 73),
  away('dc-away-6', '6', 60, 58),
  away('dc-away-7', '7', 98.5, 97),
  away('dc-away-8', '8', 50, 66),
  away('dc-away-9', '9', 46, 74),
  away('dc-away-10', '10', 51, 73),
  away('dc-away-11', '11', 56, 74),
]

const defendingCornerSteps: PreviewStep[] = [
  {
    id: 'dc-set',
    cue: 'SET — #1 organizes a hybrid block: four zonal defenders, three markers, short watcher, edge player, and #9 outlet.',
    emphasizePlayerId: 'dc-home-1',
    duration: 0.38,
  },
  {
    id: 'dc-trigger',
    cue: 'TRIGGER — the short option moves, the attacking cluster releases, and each defender protects a defined responsibility.',
    playerMoves: [
      { playerId: 'dc-away-3', to: { x: 94, y: 91 } },
      { playerId: 'dc-home-7', to: { x: 91, y: 88 }, startDelay: 0.1 },
      { playerId: 'dc-away-4', to: { x: 42, y: 84 }, startDelay: 0.02 },
      { playerId: 'dc-away-10', to: { x: 49, y: 83 }, startDelay: 0.06 },
      { playerId: 'dc-away-9', to: { x: 52, y: 82 }, startDelay: 0.11 },
      { playerId: 'dc-away-5', to: { x: 58, y: 84 }, startDelay: 0.16 },
      { playerId: 'dc-away-11', to: { x: 63, y: 85 }, startDelay: 0.21 },
      { playerId: 'dc-home-3', to: { x: 42, y: 81 }, startDelay: 0.08 },
      { playerId: 'dc-home-8', to: { x: 51, y: 80 }, startDelay: 0.14 },
      { playerId: 'dc-home-10', to: { x: 60, y: 82 }, startDelay: 0.22 },
    ],
    duration: 0.52,
  },
  {
    id: 'dc-delivery',
    cue: 'DELIVERY — Pickering’s zonal line holds priority spaces while markers track the staggered near, central, and far runs.',
    ballFrom: { x: 98.5, y: 98.5 },
    ballTo: { x: 52, y: 90 },
    playerMoves: [
      { playerId: 'dc-away-4', to: { x: 43, y: 91 } },
      { playerId: 'dc-away-10', to: { x: 48, y: 89 }, startDelay: 0.05 },
      { playerId: 'dc-away-9', to: { x: 52, y: 90 }, startDelay: 0.1 },
      { playerId: 'dc-away-5', to: { x: 58, y: 88 }, startDelay: 0.15 },
      { playerId: 'dc-away-11', to: { x: 63, y: 92 }, startDelay: 0.2 },
      { playerId: 'dc-home-3', to: { x: 43, y: 88 }, startDelay: 0.08 },
      { playerId: 'dc-home-8', to: { x: 52, y: 87 }, startDelay: 0.16 },
      { playerId: 'dc-home-10', to: { x: 61, y: 89 }, startDelay: 0.23 },
      { playerId: 'dc-home-1', to: { x: 51, y: 94 }, startDelay: 0.18 },
    ],
    duration: 0.7,
  },
  {
    id: 'dc-first-contact',
    cue: 'FIRST CONTACT — #5 attacks the targeted ball, #4/#6 protect either side, and #1 commands the corridor.',
    ballFrom: { x: 52, y: 90 },
    ballTo: { x: 42, y: 72 },
    emphasizePlayerId: 'dc-home-5',
    playerMoves: [
      { playerId: 'dc-home-5', to: { x: 51, y: 90 } },
      { playerId: 'dc-home-4', to: { x: 41, y: 88 }, startDelay: 0.07 },
      { playerId: 'dc-home-6', to: { x: 58, y: 87 }, startDelay: 0.12 },
      { playerId: 'dc-home-11', to: { x: 43, y: 72 }, startDelay: 0.16 },
      { playerId: 'dc-away-8', to: { x: 45, y: 70 }, startDelay: 0.2 },
    ],
    duration: 0.5,
  },
  {
    id: 'dc-second-ball',
    cue: 'SECOND BALL — #11 secures the clearance; the zonal line steps and #9 remains available as the controlled outlet.',
    ballFrom: { x: 42, y: 72 },
    ballTo: { x: 50, y: 55 },
    playerId: 'dc-home-9',
    playerTo: { x: 50, y: 55 },
    emphasizePlayerId: 'dc-home-11',
    playerMoves: [
      { playerId: 'dc-home-2', to: { x: 62, y: 83 } },
      { playerId: 'dc-home-4', to: { x: 41, y: 84 }, startDelay: 0.06 },
      { playerId: 'dc-home-5', to: { x: 50, y: 84 }, startDelay: 0.1 },
      { playerId: 'dc-home-6', to: { x: 58, y: 83 }, startDelay: 0.14 },
      { playerId: 'dc-home-3', to: { x: 44, y: 80 }, startDelay: 0.18 },
    ],
    duration: 0.52,
  },
]

const defendingCornerRoutes: PreviewRoute[] = [
  { id: 'dc-near-run', from: { x: 36, y: 74 }, to: { x: 43, y: 91 }, type: 'run', revealOnStepId: 'dc-delivery' },
  { id: 'dc-cross-run', from: { x: 51, y: 73 }, to: { x: 48, y: 89 }, type: 'run', revealOnStepId: 'dc-delivery' },
  { id: 'dc-primary-run', from: { x: 46, y: 74 }, to: { x: 52, y: 90 }, type: 'run', revealOnStepId: 'dc-delivery' },
  { id: 'dc-far-run', from: { x: 56, y: 74 }, to: { x: 63, y: 92 }, type: 'run', revealOnStepId: 'dc-delivery' },
  { id: 'dc-cross', from: { x: 98.5, y: 98.5 }, to: { x: 52, y: 90 }, type: 'pass', revealOnStepId: 'dc-delivery' },
  { id: 'dc-clear', from: { x: 52, y: 90 }, to: { x: 42, y: 72 }, type: 'pass', revealOnStepId: 'dc-first-contact' },
  { id: 'dc-outlet', from: { x: 42, y: 72 }, to: { x: 50, y: 55 }, type: 'pass', revealOnStepId: 'dc-second-ball' },
]

const wideFreeKickPlayers: PreviewPlayer[] = [
  home('wf-home-1', '1', 50, 94, 'keeper'),
  home('wf-home-2', '2', 78, 63),
  home('wf-home-3', '3', 29, 63),
  home('wf-home-4', '4', 24, 32),
  home('wf-home-5', '5', 29, 31),
  home('wf-home-6', '6', 55, 57),
  home('wf-home-7', '7', 91, 42),
  home('wf-home-8', '8', 48, 44),
  home('wf-home-9', '9', 34, 32),
  home('wf-home-10', '10', 39, 31),
  home('wf-home-11', '11', 44, 32),
  away('wf-away-1', '1', 50, 4),
  away('wf-away-2', '2', 33, 19),
  away('wf-away-3', '3', 28, 27),
  away('wf-away-4', '4', 44, 18),
  away('wf-away-5', '5', 54, 18),
  away('wf-away-6', '6', 36, 26),
  away('wf-away-7', '7', 76, 42),
  away('wf-away-8', '8', 47, 39),
  away('wf-away-9', '9', 50, 55),
  away('wf-away-10', '10', 44, 27),
  away('wf-away-11', '11', 67, 20),
]

const wideFreeKickSteps: PreviewStep[] = [
  {
    id: 'wf-set',
    cue: 'SET — the ball is on the right while #4/#5/#9/#10/#11 connect on the far-left side of the defensive line.',
    emphasizePlayerId: 'wf-home-7',
    duration: 0.38,
  },
  {
    id: 'wf-trigger',
    cue: 'TRIGGER — #2 shows short and #7 begins the approach; the attacking line waits for the cue.',
    playerMoves: [
      { playerId: 'wf-home-2', to: { x: 84, y: 47 } },
      { playerId: 'wf-away-7', to: { x: 77, y: 43 }, startDelay: 0.12 },
    ],
    duration: 0.42,
  },
  {
    id: 'wf-separation',
    cue: 'SEPARATE — the far-side group staggers across the line, stays onside, and opens diagonal routes toward goal.',
    playerMoves: [
      { playerId: 'wf-home-4', to: { x: 30, y: 25 } },
      { playerId: 'wf-home-10', to: { x: 36, y: 24 }, startDelay: 0.04 },
      { playerId: 'wf-home-9', to: { x: 42, y: 24 }, startDelay: 0.08 },
      { playerId: 'wf-home-5', to: { x: 48, y: 25 }, startDelay: 0.12 },
      { playerId: 'wf-home-11', to: { x: 54, y: 24 }, startDelay: 0.16 },
      { playerId: 'wf-away-3', to: { x: 31, y: 26 }, startDelay: 0.08 },
      { playerId: 'wf-away-6', to: { x: 43, y: 25 }, startDelay: 0.14 },
      { playerId: 'wf-away-10', to: { x: 54, y: 26 }, startDelay: 0.2 },
    ],
    duration: 0.48,
  },
  {
    id: 'wf-delivery',
    cue: 'DELIVERY — the runners travel diagonally from the left across their markers as #7 targets #9 centrally.',
    ballFrom: { x: 91, y: 42 },
    ballTo: { x: 52, y: 12 },
    playerMoves: [
      { playerId: 'wf-home-4', to: { x: 41, y: 15 } },
      { playerId: 'wf-home-10', to: { x: 46, y: 17 }, startDelay: 0.05 },
      { playerId: 'wf-home-9', to: { x: 52, y: 12 }, startDelay: 0.09 },
      { playerId: 'wf-home-5', to: { x: 58, y: 18 }, startDelay: 0.13 },
      { playerId: 'wf-home-11', to: { x: 64, y: 14 }, startDelay: 0.18 },
      { playerId: 'wf-away-3', to: { x: 42, y: 18 }, startDelay: 0.08 },
      { playerId: 'wf-away-6', to: { x: 52, y: 16 }, startDelay: 0.15 },
      { playerId: 'wf-away-10', to: { x: 63, y: 18 }, startDelay: 0.22 },
      { playerId: 'wf-away-1', to: { x: 51, y: 6 }, startDelay: 0.24 },
    ],
    duration: 0.7,
  },
  {
    id: 'wf-first-contact',
    cue: 'FIRST CONTACT — #9 attacks the target under pressure as the central defender contests and the goalkeeper adjusts; the clearance drops toward #8.',
    ballFrom: { x: 52, y: 12 },
    ballTo: { x: 48, y: 39 },
    emphasizePlayerId: 'wf-home-9',
    playerMoves: [
      { playerId: 'wf-home-9', to: { x: 52, y: 11 } },
      { playerId: 'wf-away-6', to: { x: 51, y: 13 }, startDelay: 0.05 },
      { playerId: 'wf-away-1', to: { x: 50, y: 5 }, startDelay: 0.1 },
      { playerId: 'wf-home-8', to: { x: 48, y: 40 }, startDelay: 0.16 },
      { playerId: 'wf-away-8', to: { x: 49, y: 38 }, startDelay: 0.2 },
    ],
    duration: 0.5,
  },
  {
    id: 'wf-second-ball',
    cue: 'SECOND BALL — #8 secures the partial clearance and resets through #6 while #2/#3 adjust to preserve rest defence.',
    ballFrom: { x: 48, y: 39 },
    ballTo: { x: 55, y: 53 },
    playerId: 'wf-home-6',
    playerTo: { x: 55, y: 53 },
    emphasizePlayerId: 'wf-home-8',
    playerMoves: [
      { playerId: 'wf-home-8', to: { x: 48, y: 39 } },
      { playerId: 'wf-away-9', to: { x: 52, y: 52 }, startDelay: 0.12 },
      { playerId: 'wf-home-2', to: { x: 75, y: 60 }, startDelay: 0.18 },
      { playerId: 'wf-home-3', to: { x: 32, y: 60 }, startDelay: 0.22 },
    ],
    duration: 0.5,
  },
]

const wideFreeKickRoutes: PreviewRoute[] = [
  { id: 'wf-short-decoy', from: { x: 78, y: 63 }, to: { x: 84, y: 47 }, type: 'run', revealOnStepId: 'wf-trigger' },
  { id: 'wf-near-run', from: { x: 24, y: 32 }, to: { x: 41, y: 15 }, type: 'run', revealOnStepId: 'wf-delivery' },
  { id: 'wf-cross-run', from: { x: 39, y: 31 }, to: { x: 46, y: 17 }, type: 'run', revealOnStepId: 'wf-delivery' },
  { id: 'wf-primary-run', from: { x: 34, y: 32 }, to: { x: 52, y: 12 }, type: 'run', revealOnStepId: 'wf-delivery' },
  { id: 'wf-decoy-run', from: { x: 29, y: 31 }, to: { x: 58, y: 18 }, type: 'run', revealOnStepId: 'wf-delivery' },
  { id: 'wf-far-run', from: { x: 44, y: 32 }, to: { x: 64, y: 14 }, type: 'run', revealOnStepId: 'wf-delivery' },
  { id: 'wf-delivery-ball', from: { x: 91, y: 42 }, to: { x: 52, y: 12 }, type: 'pass', revealOnStepId: 'wf-delivery' },
  { id: 'wf-clearance', from: { x: 52, y: 12 }, to: { x: 48, y: 39 }, type: 'pass', revealOnStepId: 'wf-first-contact' },
  { id: 'wf-reset', from: { x: 48, y: 39 }, to: { x: 55, y: 53 }, type: 'pass', revealOnStepId: 'wf-second-ball' },
]

const throwInPlayers: PreviewPlayer[] = [
  home('ti-home-1', '1', 50, 94, 'keeper'),
  { ...home('ti-home-2', '2', 103, 55), facingAngle: -90 },
  home('ti-home-3', '3', 25, 72),
  home('ti-home-4', '4', 43, 76),
  home('ti-home-5', '5', 58, 76),
  home('ti-home-6', '6', 73, 65),
  home('ti-home-7', '7', 90, 53),
  home('ti-home-8', '8', 78, 57),
  home('ti-home-9', '9', 88, 39),
  home('ti-home-10', '10', 80, 49),
  home('ti-home-11', '11', 29, 44),
  away('ti-away-1', '1', 50, 5),
  away('ti-away-2', '2', 86, 50),
  away('ti-away-3', '3', 35, 30),
  away('ti-away-4', '4', 84, 36),
  away('ti-away-5', '5', 58, 28),
  away('ti-away-6', '6', 72, 52),
  away('ti-away-7', '7', 89, 59),
  away('ti-away-8', '8', 69, 62),
  away('ti-away-9', '9', 51, 58),
  away('ti-away-10', '10', 76, 47),
  away('ti-away-11', '11', 31, 47),
]

const throwInSteps: PreviewStep[] = [
  {
    id: 'ti-set',
    cue: 'SET — #2 and the ball begin outside touch; short, inside, beyond, and reset options are connected.',
    emphasizePlayerId: 'ti-home-2',
    duration: 0.38,
  },
  {
    id: 'ti-coordinated-movement',
    cue: 'MOBILITY — #7 checks to the ball, #9 moves beyond, #10 comes inside, and defenders track the exchange.',
    playerMoves: [
      { playerId: 'ti-home-7', to: { x: 95, y: 52 } },
      { playerId: 'ti-home-9', to: { x: 92, y: 35 }, startDelay: 0.06 },
      { playerId: 'ti-home-10', to: { x: 83, y: 47 }, startDelay: 0.1 },
      { playerId: 'ti-home-8', to: { x: 84, y: 57 }, startDelay: 0.16 },
      { playerId: 'ti-home-6', to: { x: 79, y: 65 }, startDelay: 0.2 },
      { playerId: 'ti-away-2', to: { x: 91, y: 50 }, startDelay: 0.1 },
      { playerId: 'ti-away-4', to: { x: 88, y: 36 }, startDelay: 0.16 },
      { playerId: 'ti-away-10', to: { x: 79, y: 48 }, startDelay: 0.18 },
    ],
    duration: 0.52,
  },
  {
    id: 'ti-throw-short',
    cue: 'THROW — #2 legally releases from outside touch; #7 receives side-on with inside and reset options visible.',
    ballFrom: { x: 100.5, y: 55 },
    ballTo: { x: 95, y: 52 },
    playerId: 'ti-home-7',
    playerTo: { x: 95, y: 52 },
    playerMoves: [
      { playerId: 'ti-away-2', to: { x: 92, y: 50 }, startDelay: 0.08 },
      { playerId: 'ti-away-6', to: { x: 75, y: 51 }, startDelay: 0.14 },
    ],
    duration: 0.42,
  },
  {
    id: 'ti-inside-combination',
    cue: 'SECURE — #7 protects and sets inside to #10 as the thrower re-enters and the defenders recover.',
    ballFrom: { x: 95, y: 52 },
    ballTo: { x: 83, y: 47 },
    playerId: 'ti-home-10',
    playerTo: { x: 83, y: 47 },
    playerMoves: [
      { playerId: 'ti-home-2', to: { x: 97, y: 57 }, startDelay: 0.08 },
      { playerId: 'ti-home-7', to: { x: 92, y: 50 }, startDelay: 0.12 },
      { playerId: 'ti-away-10', to: { x: 80, y: 47 }, startDelay: 0.08 },
      { playerId: 'ti-away-6', to: { x: 75, y: 49 }, startDelay: 0.14 },
    ],
    duration: 0.46,
  },
  {
    id: 'ti-progress',
    cue: 'DECIDE — #10 releases #9 when forward is open; #6 remains the secure reset if the lane closes.',
    ballFrom: { x: 83, y: 47 },
    ballTo: { x: 92, y: 35 },
    playerId: 'ti-home-9',
    playerTo: { x: 92, y: 35 },
    playerMoves: [
      { playerId: 'ti-home-8', to: { x: 86, y: 54 }, startDelay: 0.08 },
      { playerId: 'ti-away-4', to: { x: 89, y: 36 }, startDelay: 0.1 },
      { playerId: 'ti-away-2', to: { x: 90, y: 45 }, startDelay: 0.16 },
    ],
    duration: 0.5,
  },
]

const throwInRoutes: PreviewRoute[] = [
  { id: 'ti-short-check', from: { x: 90, y: 53 }, to: { x: 95, y: 52 }, type: 'run', revealOnStepId: 'ti-coordinated-movement' },
  { id: 'ti-beyond-run', from: { x: 88, y: 39 }, to: { x: 92, y: 35 }, type: 'run', revealOnStepId: 'ti-coordinated-movement' },
  { id: 'ti-inside-angle', from: { x: 80, y: 49 }, to: { x: 83, y: 47 }, type: 'run', revealOnStepId: 'ti-coordinated-movement' },
  { id: 'ti-third-player-angle', from: { x: 78, y: 57 }, to: { x: 84, y: 57 }, type: 'run', revealOnStepId: 'ti-coordinated-movement' },
  { id: 'ti-reset-angle', from: { x: 73, y: 65 }, to: { x: 79, y: 65 }, type: 'recovery', revealOnStepId: 'ti-coordinated-movement' },
  { id: 'ti-throw', from: { x: 100.5, y: 55 }, to: { x: 95, y: 52 }, type: 'pass', revealOnStepId: 'ti-throw-short' },
  { id: 'ti-inside-pass', from: { x: 95, y: 52 }, to: { x: 83, y: 47 }, type: 'pass', revealOnStepId: 'ti-inside-combination' },
  { id: 'ti-forward-pass', from: { x: 83, y: 47 }, to: { x: 92, y: 35 }, type: 'pass', revealOnStepId: 'ti-progress' },
]

export const SET_PIECES_PAGE_CASES: SetPiecePageCase[] = [
  {
    id: 'attacking-corner',
    tabLabel: 'Attacking Corner',
    setPieceType: 'Attacking corner',
    organization: '#7 starts at the corner arc, #3 offers the short change of angle, #4/#5/#9/#10/#11 connect in a back-side cluster, #8 owns the edge, and #2/#6 secure transition. The opponent defends with a hybrid line, three markers, short watcher, edge player, and outlet.',
    strategy: 'Use a legal short-angle trigger and connected far-side manipulation to release diagonal runs at #9’s central target while protecting the second phase.',
    tactics: [
      '#3 receives short while the connected group holds until the new delivery cue',
      '#4/#10 attack diagonally across defenders; #5 manipulates and #11 attacks the secondary lane',
      '#9 attacks the selected central delivery while the hybrid defence contests first contact',
      '#8 secures the second ball, #6 supports the reset, and #2 protects rest defence',
    ],
    skillSet: ['Delivery', 'Disguise', 'Acceleration', 'Run timing', 'Aerial timing', 'Heading', 'Anticipation', 'Communication', 'Second-ball reaction'],
    principles: ['MOBILITY', 'PENETRATION', 'IMPROVISATION', 'SUPPORT'],
    caption: 'Short-angle trigger, connected far-side cluster, diagonal three-zone runs, contested first contact, second-ball control, and connected rest defence.',
    realityReference: 'Premier League and UEFA reference: connected clusters, consistent inswinging targets, late separation, and one primary aerial runner create momentum without encoding illegal blocking.',
    implementation: 'Full animation',
    preview: {
      players: CORNER_PIXI_SCENARIO.players,
      ballPosition: CORNER_PIXI_SCENARIO.ballPosition,
      steps: CORNER_PIXI_SCENARIO.steps ?? [],
      routes: CORNER_PIXI_SCENARIO.routes ?? [],
    },
    liveBoardScenarioId: 'corner-short-decoy-wide-delivery',
    tokenScale: 0.74,
    repeatDelay: 1.2,
  },
  {
    id: 'defending-corner',
    tabLabel: 'Defending Corner',
    setPieceType: 'Defending corner',
    organization: 'Hybrid defence: #4/#5/#6/#2 protect priority six-yard spaces, #3/#8/#10 track the main runners, #7 watches short, #11 owns the edge, #1 commands the corridor, and #9 remains the outlet.',
    strategy: 'Protect the highest-value scoring spaces, win first contact, secure the second ball, then transition through a controlled outlet only after the box is organized.',
    tactics: [
      '#1 communicates the hybrid assignments and adjusts with the delivery',
      '#4/#5/#6/#2 hold zones while #3/#8/#10 track staggered threats',
      '#5 attacks first contact; #11 protects the partial clearance',
      'The zonal line steps after the clearance and #9 remains the controlled outlet',
    ],
    skillSet: ['Scanning', 'Communication', 'Body orientation', 'Aerial timing', 'Tracking', 'Heading/clearing', 'Second-ball anticipation', 'Transition recognition'],
    principles: ['DENY', 'BALANCE', 'CONTROL & RESTRAINT'],
    caption: 'Hybrid setup, zonal priority spaces, tracked runners, active goalkeeper, contested first contact, edge protection, coordinated step, and retained outlet.',
    realityReference: 'Premier League defensive reference: elite hybrid systems combine a six-yard zonal line with selected man-markers while retaining short, edge, and outlet responsibilities.',
    implementation: 'Short presentation sequence',
    preview: {
      players: defendingCornerPlayers,
      ballPosition: { x: 98.5, y: 98.5 },
      steps: defendingCornerSteps,
      routes: defendingCornerRoutes,
    },
    tokenScale: 0.69,
    repeatDelay: 1.35,
  },
  {
    id: 'wide-free-kick',
    tabLabel: 'Wide Free Kick',
    setPieceType: 'Attacking wide free kick',
    organization: '#7 delivers from wide right Channel 1; #4/#5/#9/#10/#11 form a connected line on the far-left side, #8 owns the second ball, and #2/#3/#6 hold security. The opponent uses a hybrid of priority-space zones, matched aerial threats, a short watcher, and edge protection.',
    strategy: 'From the right-sided crossing angle, release the compact line from the opposite side diagonally across the hybrid defence, target #9 centrally, and protect the second phase.',
    tactics: [
      '#2 shows short while the five-player line holds on the opposite side',
      '#4/#10 run diagonally across the line and open the central route',
      '#9 attacks the selected delivery under pressure; #5/#11 continue into secondary lanes',
      '#8 secures the partial clearance, #6 supports the reset, and #2/#3 retain security',
    ],
    skillSet: ['Timing', 'Acceleration', 'Disguise', 'Delivery quality', 'Heading', 'Body orientation', 'Communication', 'Second-ball anticipation'],
    principles: ['MOBILITY', 'PENETRATION', 'IMPROVISATION', 'SUPPORT'],
    caption: 'Right-sided delivery, connected far-left setup, staggered diagonal runs, contested contact, second-ball control, and secure rest defence.',
    realityReference: 'Premier League reference: West Ham\'s grouped release and separation, Arsenal\'s timed line movement, and Bournemouth\'s two-player disguise validate this trigger-to-target structure.',
    implementation: 'Short presentation sequence',
    preview: {
      players: wideFreeKickPlayers,
      ballPosition: { x: 91, y: 42 },
      steps: wideFreeKickSteps,
      routes: wideFreeKickRoutes,
    },
    tokenScale: 0.69,
    repeatDelay: 1.35,
  },
  {
    id: 'throw-in',
    tabLabel: 'Throw-In',
    setPieceType: 'Attacking throw-in',
    organization: '#2 starts outside the touchline; #7 checks short, #10 supports inside, #9 moves beyond, #8 becomes the third player, and #6 protects the reset.',
    strategy: 'Create a free receiving option with opposite movement while preserving a secure reset behind the ball.',
    tactics: [
      'Create short, inside, beyond, and reset relationships before the throw',
      '#7 checks as #9 moves away; #10/#8 provide inside and third-player support',
      'Receive side-on, protect the ball, and connect the next action',
      'Progress when open; use #6 to reset when the forward or inside lane closes',
    ],
    skillSet: ['Legal throw technique', 'Scanning', 'Timing of check', 'Body orientation', 'First touch', 'Set/pass', 'Communication'],
    principles: ['SUPPORT', 'MOBILITY', 'PENETRATION'],
    caption: 'Legal outside-touchline start, opposite movement, tracked receivers, protected first touch, inside connection, and a secure reset option.',
    realityReference: 'IFAB Law 15: #2 and the ball begin outside the touchline facing the field; the ball enters only on the throw, with short, inside, beyond, and reset options.',
    implementation: 'Short presentation sequence',
    preview: {
      players: throwInPlayers,
      ballPosition: { x: 100.5, y: 55 },
      steps: throwInSteps,
      routes: throwInRoutes,
    },
    tokenScale: 0.69,
    repeatDelay: 1.35,
  },
]

export const SET_PIECES_PAGE_CASE = SET_PIECES_PAGE_CASES[0]
