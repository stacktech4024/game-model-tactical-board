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
  home('dc-home-1', '1', 50, 94, 'keeper'),
  home('dc-home-2', '2', 68, 84),
  home('dc-home-3', '3', 62, 89),
  home('dc-home-4', '4', 42, 88),
  home('dc-home-5', '5', 51, 88),
  home('dc-home-6', '6', 55, 81),
  home('dc-home-7', '7', 74, 77),
  home('dc-home-8', '8', 43, 80),
  home('dc-home-9', '9', 50, 61),
  home('dc-home-10', '10', 35, 72),
  home('dc-home-11', '11', 26, 79),
  away('dc-away-7', '7', 98, 94),
  away('dc-away-2', '2', 91, 86),
  away('dc-away-3', '3', 78, 63),
  away('dc-away-4', '4', 44, 78),
  away('dc-away-5', '5', 52, 76),
  away('dc-away-6', '6', 45, 69),
  away('dc-away-8', '8', 58, 69),
  away('dc-away-9', '9', 60, 79),
  away('dc-away-10', '10', 67, 77),
  away('dc-away-11', '11', 34, 81),
]

const defendingCornerSteps: PreviewStep[] = [
  {
    id: 'dc-command-area',
    cue: 'ORGANIZE — #1 commands the six-yard area while central markers protect first contact.',
    emphasizePlayerId: 'dc-home-1',
    duration: 0.34,
  },
  {
    id: 'dc-delivery',
    cue: 'DENY — the delivery arrives; #5 attacks the ball while markers track staggered runs.',
    ballFrom: { x: 98, y: 94 },
    ballTo: { x: 52, y: 88 },
    playerMoves: [
      { playerId: 'dc-away-9', to: { x: 54, y: 87 } },
      { playerId: 'dc-away-4', to: { x: 47, y: 86 }, startDelay: 0.06 },
      { playerId: 'dc-home-5', to: { x: 51, y: 87 }, startDelay: 0.1 },
      { playerId: 'dc-home-4', to: { x: 45, y: 87 }, startDelay: 0.14 },
      { playerId: 'dc-home-1', to: { x: 51, y: 92 }, startDelay: 0.18 },
    ],
    duration: 0.56,
  },
  {
    id: 'dc-first-contact',
    cue: 'DENY — #5 wins first contact and clears away from the central goal area.',
    ballFrom: { x: 52, y: 88 },
    ballTo: { x: 40, y: 68 },
    emphasizePlayerId: 'dc-home-5',
    playerMoves: [
      { playerId: 'dc-home-6', to: { x: 51, y: 76 } },
      { playerId: 'dc-home-8', to: { x: 42, y: 75 }, startDelay: 0.08 },
      { playerId: 'dc-away-6', to: { x: 43, y: 66 }, startDelay: 0.14 },
    ],
    duration: 0.48,
  },
  {
    id: 'dc-second-ball',
    cue: 'BALANCE — #10 protects the edge, secures the second ball, and finds the retained outlet.',
    ballFrom: { x: 40, y: 68 },
    ballTo: { x: 37, y: 68 },
    playerId: 'dc-home-10',
    playerTo: { x: 37, y: 68 },
    playerMoves: [
      { playerId: 'dc-home-2', to: { x: 64, y: 81 }, startDelay: 0.08 },
      { playerId: 'dc-home-3', to: { x: 59, y: 86 }, startDelay: 0.14 },
    ],
    duration: 0.42,
  },
  {
    id: 'dc-transition-outlet',
    cue: 'CONTROL & RESTRAINT — #10 releases #9 only after the clearance is secure.',
    ballFrom: { x: 37, y: 68 },
    ballTo: { x: 54, y: 55 },
    playerId: 'dc-home-9',
    playerTo: { x: 53, y: 54 },
    playerMoves: [
      { playerId: 'dc-home-7', to: { x: 70, y: 72 }, startDelay: 0.08 },
      { playerId: 'dc-home-11', to: { x: 31, y: 73 }, startDelay: 0.14 },
    ],
    duration: 0.54,
  },
]

const defendingCornerRoutes: PreviewRoute[] = [
  { id: 'dc-cross', from: { x: 98, y: 94 }, to: { x: 52, y: 88 }, type: 'pass', revealOnStepId: 'dc-delivery' },
  { id: 'dc-nine-run', from: { x: 60, y: 79 }, to: { x: 54, y: 87 }, type: 'run', revealOnStepId: 'dc-delivery' },
  { id: 'dc-five-contact', from: { x: 51, y: 88 }, to: { x: 51, y: 87 }, type: 'recovery', revealOnStepId: 'dc-delivery' },
  { id: 'dc-clear', from: { x: 52, y: 88 }, to: { x: 40, y: 68 }, type: 'pass', revealOnStepId: 'dc-first-contact' },
  { id: 'dc-edge-step', from: { x: 35, y: 72 }, to: { x: 37, y: 68 }, type: 'recovery', revealOnStepId: 'dc-second-ball' },
  { id: 'dc-outlet', from: { x: 37, y: 68 }, to: { x: 54, y: 55 }, type: 'pass', revealOnStepId: 'dc-transition-outlet' },
]

const wideFreeKickPlayers: PreviewPlayer[] = [
  home('wf-home-1', '1', 50, 94, 'keeper'),
  home('wf-home-2', '2', 83, 50),
  home('wf-home-3', '3', 27, 67),
  home('wf-home-4', '4', 42, 72),
  home('wf-home-5', '5', 58, 72),
  home('wf-home-6', '6', 51, 60),
  home('wf-home-7', '7', 89, 44),
  home('wf-home-8', '8', 43, 42),
  home('wf-home-9', '9', 53, 29),
  home('wf-home-10', '10', 52, 39),
  home('wf-home-11', '11', 35, 27),
  away('wf-away-1', '1', 50, 4),
  away('wf-away-2', '2', 66, 20),
  away('wf-away-3', '3', 35, 18),
  away('wf-away-4', '4', 45, 17),
  away('wf-away-5', '5', 55, 17),
  away('wf-away-6', '6', 60, 29),
  away('wf-away-7', '7', 80, 48),
  away('wf-away-8', '8', 42, 31),
  away('wf-away-9', '9', 49, 52),
  away('wf-away-10', '10', 70, 41),
  away('wf-away-11', '11', 29, 34),
]

const wideFreeKickSteps: PreviewStep[] = [
  {
    id: 'wf-organization',
    cue: 'ORGANIZE — #7 owns the delivery while #9/#11 stagger their starting depths.',
    emphasizePlayerId: 'wf-home-7',
    duration: 0.32,
  },
  {
    id: 'wf-trigger',
    cue: 'DISGUISE — #2 shows short; the line holds until #7 begins the delivery action.',
    playerMoves: [
      { playerId: 'wf-home-2', to: { x: 85, y: 47 } },
      { playerId: 'wf-away-7', to: { x: 83, y: 46 }, startDelay: 0.08 },
      { playerId: 'wf-home-10', to: { x: 50, y: 37 }, startDelay: 0.14 },
    ],
    duration: 0.38,
  },
  {
    id: 'wf-delivery-runs',
    cue: 'PENETRATION — #9 attacks near, #11 arrives beyond, and #10 holds the second-ball zone.',
    ballFrom: { x: 89, y: 44 },
    ballTo: { x: 49, y: 14 },
    playerMoves: [
      { playerId: 'wf-home-9', to: { x: 46, y: 15 } },
      { playerId: 'wf-home-11', to: { x: 57, y: 14 }, startDelay: 0.08 },
      { playerId: 'wf-away-4', to: { x: 47, y: 15 }, startDelay: 0.12 },
      { playerId: 'wf-away-5', to: { x: 56, y: 14 }, startDelay: 0.16 },
      { playerId: 'wf-home-8', to: { x: 44, y: 36 }, startDelay: 0.2 },
    ],
    duration: 0.62,
  },
  {
    id: 'wf-second-ball',
    cue: 'BALANCE — #10/#8 protect the next action while #4/#5/#6 remain connected behind it.',
    ballFrom: { x: 49, y: 14 },
    ballTo: { x: 50, y: 35 },
    playerId: 'wf-home-10',
    playerTo: { x: 50, y: 35 },
    playerMoves: [
      { playerId: 'wf-home-6', to: { x: 51, y: 55 } },
      { playerId: 'wf-home-4', to: { x: 43, y: 67 }, startDelay: 0.08 },
      { playerId: 'wf-home-5', to: { x: 57, y: 67 }, startDelay: 0.14 },
    ],
    duration: 0.48,
  },
]

const wideFreeKickRoutes: PreviewRoute[] = [
  { id: 'wf-short-decoy', from: { x: 83, y: 50 }, to: { x: 85, y: 47 }, type: 'run', revealOnStepId: 'wf-trigger' },
  { id: 'wf-delivery', from: { x: 89, y: 44 }, to: { x: 49, y: 14 }, type: 'pass', revealOnStepId: 'wf-delivery-runs' },
  { id: 'wf-near-run', from: { x: 53, y: 29 }, to: { x: 46, y: 15 }, type: 'run', revealOnStepId: 'wf-delivery-runs' },
  { id: 'wf-far-run', from: { x: 35, y: 27 }, to: { x: 57, y: 14 }, type: 'run', revealOnStepId: 'wf-delivery-runs' },
  { id: 'wf-second-ball', from: { x: 52, y: 39 }, to: { x: 50, y: 35 }, type: 'recovery', revealOnStepId: 'wf-second-ball' },
]

const throwInPlayers: PreviewPlayer[] = [
  home('ti-home-1', '1', 50, 94, 'keeper'),
  home('ti-home-2', '2', 97, 52),
  home('ti-home-3', '3', 25, 72),
  home('ti-home-4', '4', 43, 76),
  home('ti-home-5', '5', 58, 76),
  home('ti-home-6', '6', 50, 65),
  home('ti-home-7', '7', 88, 52),
  home('ti-home-8', '8', 77, 60),
  home('ti-home-9', '9', 79, 37),
  home('ti-home-10', '10', 76, 46),
  home('ti-home-11', '11', 29, 44),
  away('ti-away-1', '1', 50, 5),
  away('ti-away-2', '2', 84, 44),
  away('ti-away-3', '3', 35, 30),
  away('ti-away-4', '4', 46, 27),
  away('ti-away-5', '5', 58, 28),
  away('ti-away-6', '6', 69, 52),
  away('ti-away-7', '7', 91, 57),
  away('ti-away-8', '8', 72, 63),
  away('ti-away-9', '9', 51, 58),
  away('ti-away-10', '10', 80, 49),
  away('ti-away-11', '11', 31, 47),
]

const throwInSteps: PreviewStep[] = [
  {
    id: 'ti-triangle',
    cue: 'SUPPORT — #7 short, #10 inside, and #8 behind create three safe receiving angles.',
    emphasizePlayerId: 'ti-home-2',
    duration: 0.32,
  },
  {
    id: 'ti-coordinated-movement',
    cue: 'MOBILITY — #7 checks short as #10 moves inside and #9 threatens beyond.',
    playerMoves: [
      { playerId: 'ti-home-7', to: { x: 91, y: 48 } },
      { playerId: 'ti-home-10', to: { x: 82, y: 43 }, startDelay: 0.08 },
      { playerId: 'ti-home-9', to: { x: 80, y: 34 }, startDelay: 0.14 },
      { playerId: 'ti-home-8', to: { x: 82, y: 59 }, startDelay: 0.2 },
      { playerId: 'ti-away-2', to: { x: 87, y: 45 }, startDelay: 0.1 },
    ],
    duration: 0.46,
  },
  {
    id: 'ti-throw-short',
    cue: 'SECURE — #2 throws to #7, whose open body shape keeps inside and reset options visible.',
    ballFrom: { x: 97, y: 52 },
    ballTo: { x: 92, y: 48 },
    playerId: 'ti-home-7',
    playerTo: { x: 91, y: 48 },
    duration: 0.38,
  },
  {
    id: 'ti-inside-combination',
    cue: 'PENETRATION — #7 connects inside to #10 while #9 pins and then moves beyond.',
    ballFrom: { x: 92, y: 48 },
    ballTo: { x: 83, y: 43 },
    playerId: 'ti-home-10',
    playerTo: { x: 82, y: 43 },
    playerMoves: [
      { playerId: 'ti-away-10', to: { x: 78, y: 46 }, startDelay: 0.08 },
      { playerId: 'ti-away-6', to: { x: 72, y: 49 }, startDelay: 0.14 },
    ],
    duration: 0.42,
  },
  {
    id: 'ti-progress',
    cue: 'PROGRESS — #10 releases #9; if the lane closes, #8 remains the reset behind the ball.',
    ballFrom: { x: 83, y: 43 },
    ballTo: { x: 81, y: 34 },
    playerId: 'ti-home-9',
    playerTo: { x: 80, y: 34 },
    playerMoves: [
      { playerId: 'ti-home-7', to: { x: 88, y: 42 }, startDelay: 0.08 },
      { playerId: 'ti-away-4', to: { x: 48, y: 31 }, startDelay: 0.14 },
    ],
    duration: 0.46,
  },
]

const throwInRoutes: PreviewRoute[] = [
  { id: 'ti-short-check', from: { x: 88, y: 52 }, to: { x: 91, y: 48 }, type: 'run', revealOnStepId: 'ti-coordinated-movement' },
  { id: 'ti-inside-angle', from: { x: 76, y: 46 }, to: { x: 82, y: 43 }, type: 'run', revealOnStepId: 'ti-coordinated-movement' },
  { id: 'ti-reset-angle', from: { x: 77, y: 60 }, to: { x: 82, y: 59 }, type: 'recovery', revealOnStepId: 'ti-coordinated-movement' },
  { id: 'ti-throw', from: { x: 97, y: 52 }, to: { x: 92, y: 48 }, type: 'pass', revealOnStepId: 'ti-throw-short' },
  { id: 'ti-inside-pass', from: { x: 92, y: 48 }, to: { x: 83, y: 43 }, type: 'pass', revealOnStepId: 'ti-inside-combination' },
  { id: 'ti-forward-pass', from: { x: 83, y: 43 }, to: { x: 81, y: 34 }, type: 'pass', revealOnStepId: 'ti-progress' },
]

export const SET_PIECES_PAGE_CASES: SetPiecePageCase[] = [
  {
    id: 'attacking-corner',
    tabLabel: 'Attacking Corner',
    setPieceType: 'Attacking corner',
    organization: 'Short option in Channel 1, #9 as the primary corridor target, #8/#10 for the second ball, and #2/#4/#5/#6 protecting rest defence.',
    strategy: 'Change the angle before delivering with pace between the goalkeeper and back line.',
    tactics: [
      '#3 shows short to draw one defender out',
      '#7 delivers after the angle changes',
      '#9 attacks first contact; #8/#10 protect the second ball',
      '#2/#4/#5/#6 stay connected against the clearance',
    ],
    skillSet: ['Disguise', 'Delivery quality', 'Run timing', 'First contact', 'Second-ball reaction'],
    principles: ['SUPPORT', 'MOBILITY', 'PENETRATION', 'BALANCE'],
    caption: 'Short decoy, changed angle, corridor delivery, central first contact, second-ball support, and connected rest defence.',
    realityReference: 'MLS and Premier League reality: read the marking scheme, use the short option to change the angle, then attack a rehearsed destination.',
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
    organization: '#1 commands the six-yard area; #4/#5 protect first contact, markers track threats, #10 guards the edge, and #9 stays available as the outlet.',
    strategy: 'Deny a clean first contact, protect the second ball, then transition only after the box is secure.',
    tactics: [
      '#1 sets the line and claims the goalkeeper corridor',
      '#5 attacks first contact while #4 provides central balance',
      '#6/#8 collapse toward the clearance; #10 owns the edge',
      '#9 remains high for the controlled counter outlet',
    ],
    skillSet: ['Communication', 'Marking awareness', 'Heading/clearing', 'Second-ball scanning', 'Outlet pass'],
    principles: ['DENY', 'BALANCE', 'CONTROL & RESTRAINT'],
    caption: 'Goalkeeper command, protected first contact, tracked runners, edge responsibility, second-ball control, and a retained outlet.',
    realityReference: 'MLS reality: every delivery must be challenged; a hybrid structure protects first contact without abandoning edge and counter responsibilities.',
    implementation: 'Short presentation sequence',
    preview: {
      players: defendingCornerPlayers,
      ballPosition: { x: 98, y: 94 },
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
    organization: '#7 delivers from Channel 1/2, #9 attacks near, #11 arrives beyond, #10/#8 hold the second-ball zone, and #4/#5/#6 secure the restart.',
    strategy: 'Use a clear delivery trigger and staggered runs to attack two box depths while preserving the next action.',
    tactics: [
      '#2 shows short without blocking the delivery lane',
      '#9 attacks near before #11 arrives central/far',
      '#10/#8 stay outside the first-contact traffic',
      '#4/#5/#6 hold connected defensive security',
    ],
    skillSet: ['Delivery consistency', 'Staggered timing', 'Aerial contact', 'Second-ball positioning', 'Rest-defence scanning'],
    principles: ['DISGUISE', 'PENETRATION', 'BALANCE'],
    caption: 'Wide delivery trigger, staggered near/far runs, protected second-ball zone, and three-player security behind the restart.',
    realityReference: 'Premier League and La Liga reality: repeatable delivery quality and rehearsed destinations matter more than excessive movement.',
    implementation: 'Short presentation sequence',
    preview: {
      players: wideFreeKickPlayers,
      ballPosition: { x: 89, y: 44 },
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
    organization: '#2 restarts from touch, #7 checks short, #10 supports inside, #8 provides the reset, and #9 threatens beyond.',
    strategy: 'Secure the first reception, keep three passing angles, and progress with purpose without forcing a long throw.',
    tactics: [
      '#7 checks toward the ball with an open body shape',
      '#10 moves inside as #9 pins then threatens beyond',
      '#8 stays behind the ball as the safe reset',
      '#2 re-enters play to restore the support triangle',
    ],
    skillSet: ['Scanning', 'Legal throw technique', 'Body orientation', 'First touch', 'Pass timing'],
    principles: ['SUPPORT', 'MOBILITY', 'WIDTH', 'PENETRATION'],
    caption: 'Short receiver, inside support, beyond movement, secure reset, and a purposeful next pass after the restart.',
    realityReference: 'Professional-game reality: the throw-in is a possession restart built from short, inside, beyond, and reset options—not an automatic long throw.',
    implementation: 'Short presentation sequence',
    preview: {
      players: throwInPlayers,
      ballPosition: { x: 97, y: 52 },
      steps: throwInSteps,
      routes: throwInRoutes,
    },
    tokenScale: 0.69,
    repeatDelay: 1.35,
  },
]

export const SET_PIECES_PAGE_CASE = SET_PIECES_PAGE_CASES[0]
