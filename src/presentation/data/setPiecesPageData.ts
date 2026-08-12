import type { PixiPitchPreviewProps } from '../../renderers/pixi/PixiPitchPreview'
import { CORNER_PIXI_SCENARIO } from './cornerPixiAdapter.ts'

type PreviewPlayer = PixiPitchPreviewProps['players'][number]
type PreviewStep = NonNullable<PixiPitchPreviewProps['steps']>[number]
type PreviewRoute = NonNullable<PixiPitchPreviewProps['routes']>[number]

export type SetPieceCaseId =
  | 'attacking-corner'
  | 'defending-corner'
  | 'wide-free-kick'
  | 'direct-free-kick'
  | 'indirect-free-kick'
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

const faced = (player: PreviewPlayer, facingAngle: number): PreviewPlayer => ({
  ...player,
  facingAngle,
})

const facingAngleFromMovement = (
  from: { x: number; y: number },
  to: { x: number; y: number },
) => Math.round((Math.atan2(to.x - from.x, from.y - to.y) * 180) / Math.PI)

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
  home('wf-home-4', '4', 31, 36),
  home('wf-home-5', '5', 40, 34),
  home('wf-home-6', '6', 55, 57),
  home('wf-home-7', '7', 91, 42),
  home('wf-home-8', '8', 52, 44),
  home('wf-home-9', '9', 49, 30),
  home('wf-home-10', '10', 57, 35),
  home('wf-home-11', '11', 67, 36),
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
    cue: 'SET — #7 owns the wide-right service; #9 starts central, #11 holds the far shoulder, and #4/#5/#8 balance the second phase.',
    emphasizePlayerId: 'wf-home-7',
    duration: 0.38,
  },
  {
    id: 'wf-trigger',
    cue: 'TRIGGER — #2’s short run pulls the wide defender out while #7 keeps the ball still and reads the line.',
    playerMoves: [
      { playerId: 'wf-home-2', to: { x: 84, y: 47 } },
      { playerId: 'wf-away-7', to: { x: 77, y: 43 }, startDelay: 0.12 },
    ],
    duration: 0.42,
  },
  {
    id: 'wf-runs',
    cue: 'RUNS — #9 pins the middle, #10 bends toward the front space, and #11 arrives blind-side at the far post.',
    playerMoves: [
      { playerId: 'wf-home-4', to: { x: 36, y: 34 } },
      { playerId: 'wf-home-5', to: { x: 45, y: 29 }, startDelay: 0.04 },
      { playerId: 'wf-home-9', to: { x: 47, y: 25 }, startDelay: 0.08 },
      { playerId: 'wf-home-10', to: { x: 51, y: 29 }, startDelay: 0.12 },
      { playerId: 'wf-home-11', to: { x: 70, y: 27 }, startDelay: 0.16 },
      { playerId: 'wf-away-3', to: { x: 36, y: 25 }, startDelay: 0.08 },
      { playerId: 'wf-away-6', to: { x: 48, y: 24 }, startDelay: 0.14 },
      { playerId: 'wf-away-10', to: { x: 59, y: 24 }, startDelay: 0.2 },
    ],
    duration: 0.48,
  },
  {
    id: 'wf-delivery',
    cue: 'SERVICE — #7 whips the ball over the first line toward #11’s blind-side run as the goalkeeper and back line drop.',
    ballFrom: { x: 91, y: 42 },
    ballTo: { x: 64, y: 12 },
    playerMoves: [
      { playerId: 'wf-home-4', to: { x: 42, y: 20 } },
      { playerId: 'wf-home-5', to: { x: 58, y: 18 }, startDelay: 0.05 },
      { playerId: 'wf-home-9', to: { x: 51, y: 13 }, startDelay: 0.09 },
      { playerId: 'wf-home-10', to: { x: 44, y: 16 }, startDelay: 0.13 },
      { playerId: 'wf-home-11', to: { x: 64, y: 12 }, startDelay: 0.18 },
      { playerId: 'wf-away-3', to: { x: 42, y: 17 }, startDelay: 0.08 },
      { playerId: 'wf-away-6', to: { x: 51, y: 15 }, startDelay: 0.15 },
      { playerId: 'wf-away-10', to: { x: 62, y: 16 }, startDelay: 0.22 },
      { playerId: 'wf-away-1', to: { x: 55, y: 5 }, startDelay: 0.24 },
    ],
    duration: 0.7,
  },
  {
    id: 'wf-header-back',
    cue: 'SECOND CONTACT — #11 wins the far-post ball and heads it back across the goalkeeper into #9’s path.',
    ballFrom: { x: 64, y: 12 },
    ballTo: { x: 52, y: 8 },
    emphasizePlayerId: 'wf-home-11',
    playerMoves: [
      { playerId: 'wf-home-11', to: { x: 64, y: 11 } },
      { playerId: 'wf-home-9', to: { x: 52, y: 9 }, startDelay: 0.05 },
      { playerId: 'wf-away-10', to: { x: 62, y: 13 }, startDelay: 0.08 },
      { playerId: 'wf-away-1', to: { x: 53, y: 4 }, startDelay: 0.1 },
      { playerId: 'wf-away-6', to: { x: 52, y: 12 }, startDelay: 0.15 },
    ],
    duration: 0.5,
  },
  {
    id: 'wf-finish',
    cue: 'FINISH — #9 meets the headed return first time and shoots before the line can recover. GOAL.',
    ballFrom: { x: 52, y: 8 },
    ballTo: { x: 50, y: 0 },
    emphasizePlayerId: 'wf-home-9',
    playerMoves: [
      { playerId: 'wf-home-9', to: { x: 52, y: 8 } },
      { playerId: 'wf-away-1', to: { x: 51, y: 2 }, startDelay: 0.08 },
      { playerId: 'wf-away-5', to: { x: 53, y: 10 }, startDelay: 0.12 },
      { playerId: 'wf-home-2', to: { x: 75, y: 60 }, startDelay: 0.18 },
      { playerId: 'wf-home-3', to: { x: 32, y: 60 }, startDelay: 0.22 },
    ],
    duration: 0.5,
  },
]

const wideFreeKickRoutes: PreviewRoute[] = [
  { id: 'wf-short-decoy', from: { x: 78, y: 63 }, to: { x: 84, y: 47 }, type: 'run', revealOnStepId: 'wf-trigger' },
  { id: 'wf-near-run', from: { x: 57, y: 35 }, to: { x: 44, y: 16 }, type: 'run', revealOnStepId: 'wf-delivery' },
  { id: 'wf-central-run', from: { x: 49, y: 30 }, to: { x: 51, y: 13 }, type: 'run', revealOnStepId: 'wf-delivery' },
  { id: 'wf-far-run', from: { x: 67, y: 36 }, to: { x: 64, y: 12 }, type: 'run', revealOnStepId: 'wf-delivery' },
  { id: 'wf-delivery-ball', from: { x: 91, y: 42 }, to: { x: 64, y: 12 }, type: 'pass', revealOnStepId: 'wf-delivery' },
  { id: 'wf-header-return', from: { x: 64, y: 12 }, to: { x: 52, y: 8 }, type: 'pass', revealOnStepId: 'wf-header-back' },
  { id: 'wf-shot', from: { x: 52, y: 8 }, to: { x: 50, y: 0 }, type: 'shot', revealOnStepId: 'wf-finish' },
]

// Central direct-free-kick routine: the first touch changes the angle and triggers
// the wall while the rebound runners remain onside at each attacking touch.
const DIRECT_FREE_KICK_BALL = { x: 49, y: 24 }

const directFreeKickPlayers: PreviewPlayer[] = [
  faced(home('df-home-1', '1', 50, 94, 'keeper'), facingAngleFromMovement({ x: 50, y: 94 }, DIRECT_FREE_KICK_BALL)),
  faced(home('df-home-2', '2', 72, 26), facingAngleFromMovement({ x: 72, y: 26 }, DIRECT_FREE_KICK_BALL)),
  faced(home('df-home-3', '3', 27, 26), facingAngleFromMovement({ x: 27, y: 26 }, DIRECT_FREE_KICK_BALL)),
  faced(home('df-home-4', '4', 43, 58), facingAngleFromMovement({ x: 43, y: 58 }, DIRECT_FREE_KICK_BALL)),
  faced(home('df-home-5', '5', 58, 62), facingAngleFromMovement({ x: 58, y: 62 }, DIRECT_FREE_KICK_BALL)),
  faced(home('df-home-6', '6', 57, 15.3), facingAngleFromMovement({ x: 57, y: 15.3 }, DIRECT_FREE_KICK_BALL)),
  faced(home('df-home-7', '7', 47, 27), facingAngleFromMovement({ x: 47, y: 27 }, DIRECT_FREE_KICK_BALL)),
  faced(home('df-home-8', '8', 40, 32), facingAngleFromMovement({ x: 40, y: 32 }, DIRECT_FREE_KICK_BALL)),
  faced(home('df-home-9', '9', 62, 20.5), facingAngleFromMovement({ x: 62, y: 20.5 }, DIRECT_FREE_KICK_BALL)),
  faced(home('df-home-10', '10', 55, 29), facingAngleFromMovement({ x: 55, y: 29 }, DIRECT_FREE_KICK_BALL)),
  faced(home('df-home-11', '11', 35, 20.5), facingAngleFromMovement({ x: 35, y: 20.5 }, DIRECT_FREE_KICK_BALL)),
  faced(away('df-away-1', '1', 49, 4), facingAngleFromMovement({ x: 49, y: 4 }, DIRECT_FREE_KICK_BALL)),
  faced(away('df-away-2', '2', 68, 22), facingAngleFromMovement({ x: 68, y: 22 }, DIRECT_FREE_KICK_BALL)),
  faced(away('df-away-3', '3', 31, 22), facingAngleFromMovement({ x: 31, y: 22 }, DIRECT_FREE_KICK_BALL)),
  faced(away('df-away-4', '4', 42, 15.3), facingAngleFromMovement({ x: 42, y: 15.3 }, DIRECT_FREE_KICK_BALL)),
  faced(away('df-away-5', '5', 46, 15.3), facingAngleFromMovement({ x: 46, y: 15.3 }, DIRECT_FREE_KICK_BALL)),
  faced(away('df-away-6', '6', 50, 15.3), facingAngleFromMovement({ x: 50, y: 15.3 }, DIRECT_FREE_KICK_BALL)),
  faced(away('df-away-7', '7', 73, 34), facingAngleFromMovement({ x: 73, y: 34 }, DIRECT_FREE_KICK_BALL)),
  faced(away('df-away-8', '8', 54, 15.3), facingAngleFromMovement({ x: 54, y: 15.3 }, DIRECT_FREE_KICK_BALL)),
  faced(away('df-away-9', '9', 43, 52), facingAngleFromMovement({ x: 43, y: 52 }, DIRECT_FREE_KICK_BALL)),
  faced(away('df-away-10', '10', 58, 55), facingAngleFromMovement({ x: 58, y: 55 }, DIRECT_FREE_KICK_BALL)),
  faced(away('df-away-11', '11', 27, 34), facingAngleFromMovement({ x: 27, y: 34 }, DIRECT_FREE_KICK_BALL)),
]

const directFreeKickSteps: PreviewStep[] = [
  {
    id: 'df-set',
    cue: 'SET — #7/#10 scan the wall and goalkeeper; #9/#11 stay onside, #6 screens legally outside the wall, #2/#3 hold rebound lanes, and #4/#5 match the high outlets.',
    emphasizePlayerId: 'df-home-10',
    playerFacings: [
      { playerId: 'df-home-7', facingAngle: facingAngleFromMovement({ x: 47, y: 27 }, DIRECT_FREE_KICK_BALL) },
      { playerId: 'df-home-10', facingAngle: facingAngleFromMovement({ x: 55, y: 29 }, DIRECT_FREE_KICK_BALL) },
      { playerId: 'df-away-1', facingAngle: facingAngleFromMovement({ x: 49, y: 4 }, DIRECT_FREE_KICK_BALL) },
      { playerId: 'df-away-4', facingAngle: facingAngleFromMovement({ x: 42, y: 15.3 }, DIRECT_FREE_KICK_BALL) },
      { playerId: 'df-away-5', facingAngle: facingAngleFromMovement({ x: 46, y: 15.3 }, DIRECT_FREE_KICK_BALL) },
      { playerId: 'df-away-6', facingAngle: facingAngleFromMovement({ x: 50, y: 15.3 }, DIRECT_FREE_KICK_BALL) },
      { playerId: 'df-away-8', facingAngle: facingAngleFromMovement({ x: 54, y: 15.3 }, DIRECT_FREE_KICK_BALL) },
    ],
    duration: 0.42,
  },
  {
    id: 'df-disguise',
    cue: 'DISGUISE — #7 shapes to shoot while #10 shortens his approach; the wall and goalkeeper hold until the ball clearly moves.',
    playerId: 'df-home-7',
    playerTo: { x: 48.2, y: 24.8 },
    facingAngle: facingAngleFromMovement({ x: 47, y: 27 }, { x: 48.2, y: 24.8 }),
    playerMoves: [
      { playerId: 'df-home-10', to: { x: 54, y: 27 }, facingAngle: facingAngleFromMovement({ x: 55, y: 29 }, { x: 54, y: 27 }), startDelay: 0.08 },
      { playerId: 'df-home-8', to: { x: 43, y: 29 }, facingAngle: facingAngleFromMovement({ x: 40, y: 32 }, { x: 43, y: 29 }), startDelay: 0.14 },
      { playerId: 'df-away-1', to: { x: 48.5, y: 4 }, facingAngle: facingAngleFromMovement({ x: 48.5, y: 4 }, DIRECT_FREE_KICK_BALL), startDelay: 0.18 },
    ],
    duration: 0.4,
  },
  {
    id: 'df-roll',
    cue: 'FIRST TOUCH — #7 opens his hips and rolls the stationary ball two metres across #10’s path; only now can the wall charge.',
    ballFrom: { x: 49, y: 24 },
    ballTo: { x: 52, y: 24 },
    playerId: 'df-home-7',
    playerTo: { x: 47.5, y: 25.5 },
    facingAngle: 90,
    playerMoves: [
      { playerId: 'df-home-10', to: { x: 53.5, y: 25.5 }, facingAngle: facingAngleFromMovement({ x: 54, y: 27 }, { x: 53.5, y: 25.5 }), startDelay: 0.08 },
      { playerId: 'df-away-4', to: { x: 42.5, y: 17 }, facingAngle: facingAngleFromMovement({ x: 42, y: 15.3 }, { x: 42.5, y: 17 }), startDelay: 0.18 },
      { playerId: 'df-away-5', to: { x: 46.5, y: 17 }, facingAngle: facingAngleFromMovement({ x: 46, y: 15.3 }, { x: 46.5, y: 17 }), startDelay: 0.19 },
      { playerId: 'df-away-6', to: { x: 50.5, y: 17 }, facingAngle: facingAngleFromMovement({ x: 50, y: 15.3 }, { x: 50.5, y: 17 }), startDelay: 0.2 },
      { playerId: 'df-away-8', to: { x: 54.5, y: 17 }, facingAngle: facingAngleFromMovement({ x: 54, y: 15.3 }, { x: 54.5, y: 17 }), startDelay: 0.21 },
      { playerId: 'df-home-6', to: { x: 58, y: 19.2 }, facingAngle: facingAngleFromMovement({ x: 57, y: 15.3 }, { x: 58, y: 19.2 }), startDelay: 0.22 },
    ],
    duration: 0.36,
  },
  {
    id: 'df-strike',
    cue: 'SECOND TOUCH / FINISH — #10 plants beside the shifted ball and drives through the opening; the wall turns, GK sets and dives, and #9/#11 attack rebounds. GOAL.',
    ballFrom: { x: 52, y: 24 },
    ballTo: { x: 46.5, y: 0.5 },
    playerId: 'df-home-10',
    playerTo: { x: 52, y: 24 },
    facingAngle: facingAngleFromMovement({ x: 52, y: 24 }, { x: 46.5, y: 0.5 }),
    emphasizePlayerId: 'df-home-10',
    playerMoves: [
      { playerId: 'df-away-4', to: { x: 43, y: 18.5 }, facingAngle: facingAngleFromMovement({ x: 42.5, y: 17 }, { x: 43, y: 18.5 }) },
      { playerId: 'df-away-5', to: { x: 47, y: 18.7 }, facingAngle: facingAngleFromMovement({ x: 46.5, y: 17 }, { x: 47, y: 18.7 }), startDelay: 0.02 },
      { playerId: 'df-away-6', to: { x: 51, y: 18.7 }, facingAngle: facingAngleFromMovement({ x: 50.5, y: 17 }, { x: 51, y: 18.7 }), startDelay: 0.04 },
      { playerId: 'df-away-8', to: { x: 55, y: 18.4 }, facingAngle: facingAngleFromMovement({ x: 54.5, y: 17 }, { x: 55, y: 18.4 }), startDelay: 0.06 },
      { playerId: 'df-away-1', to: { x: 46.5, y: 2 }, facingAngle: facingAngleFromMovement({ x: 48.5, y: 4 }, { x: 46.5, y: 2 }), startDelay: 0.12 },
      { playerId: 'df-home-9', to: { x: 57, y: 6 }, facingAngle: facingAngleFromMovement({ x: 62, y: 20.5 }, { x: 57, y: 6 }), startDelay: 0.12 },
      { playerId: 'df-home-11', to: { x: 40, y: 6 }, facingAngle: facingAngleFromMovement({ x: 35, y: 20.5 }, { x: 40, y: 6 }), startDelay: 0.15 },
      { playerId: 'df-home-8', to: { x: 47, y: 23 }, facingAngle: facingAngleFromMovement({ x: 43, y: 29 }, { x: 47, y: 23 }), startDelay: 0.18 },
      { playerId: 'df-home-2', to: { x: 67, y: 18.5 }, facingAngle: facingAngleFromMovement({ x: 72, y: 26 }, { x: 67, y: 18.5 }), startDelay: 0.2 },
      { playerId: 'df-home-3', to: { x: 32, y: 18.5 }, facingAngle: facingAngleFromMovement({ x: 27, y: 26 }, { x: 32, y: 18.5 }), startDelay: 0.22 },
      { playerId: 'df-home-6', to: { x: 60, y: 18.5 }, facingAngle: facingAngleFromMovement({ x: 58, y: 19.2 }, { x: 60, y: 18.5 }), startDelay: 0.24 },
      { playerId: 'df-home-4', to: { x: 44, y: 56.5 }, facingAngle: facingAngleFromMovement({ x: 43, y: 58 }, { x: 44, y: 56.5 }), startDelay: 0.26 },
      { playerId: 'df-home-5', to: { x: 57, y: 60 }, facingAngle: facingAngleFromMovement({ x: 58, y: 62 }, { x: 57, y: 60 }), startDelay: 0.28 },
    ],
    duration: 0.58,
  },
]

const directFreeKickRoutes: PreviewRoute[] = [
  { id: 'df-seven-disguise', from: { x: 47, y: 27 }, to: { x: 48.2, y: 24.8 }, type: 'run', revealOnStepId: 'df-disguise' },
  { id: 'df-ten-approach', from: { x: 55, y: 29 }, to: { x: 52, y: 24 }, type: 'run', revealOnStepId: 'df-roll' },
  { id: 'df-setter-clears', from: { x: 48.2, y: 24.8 }, to: { x: 47.5, y: 25.5 }, type: 'run', revealOnStepId: 'df-roll' },
  { id: 'df-two-metre-roll', from: { x: 49, y: 24 }, to: { x: 52, y: 24 }, type: 'pass', revealOnStepId: 'df-roll' },
  { id: 'df-wall-charge', from: { x: 50, y: 15.3 }, to: { x: 51, y: 18.7 }, type: 'press', revealOnStepId: 'df-strike' },
  { id: 'df-shot', from: { x: 52, y: 24 }, to: { x: 46.5, y: 0.5 }, type: 'shot', revealOnStepId: 'df-strike' },
  { id: 'df-six-legal-release', from: { x: 57, y: 15.3 }, to: { x: 58, y: 19.2 }, type: 'run', revealOnStepId: 'df-roll' },
  { id: 'df-nine-rebound', from: { x: 62, y: 20.5 }, to: { x: 57, y: 6 }, type: 'run', revealOnStepId: 'df-strike' },
  { id: 'df-eleven-rebound', from: { x: 35, y: 20.5 }, to: { x: 40, y: 6 }, type: 'run', revealOnStepId: 'df-strike' },
  { id: 'df-two-rebound-support', from: { x: 72, y: 26 }, to: { x: 67, y: 18.5 }, type: 'run', revealOnStepId: 'df-strike' },
  { id: 'df-three-rebound-support', from: { x: 27, y: 26 }, to: { x: 32, y: 18.5 }, type: 'run', revealOnStepId: 'df-strike' },
]

// Legal inside-box indirect routine. The secondary screen remains more than one
// metre from the defensive wall and separates without blocking a defender.
const INDIRECT_FREE_KICK_BALL = { x: 50, y: 11 }

const indirectFreeKickPlayers: PreviewPlayer[] = [
  faced(home('if-home-1', '1', 50, 94, 'keeper'), facingAngleFromMovement({ x: 50, y: 94 }, INDIRECT_FREE_KICK_BALL)),
  faced(home('if-home-2', '2', 70, 28), facingAngleFromMovement({ x: 70, y: 28 }, INDIRECT_FREE_KICK_BALL)),
  faced(home('if-home-3', '3', 30, 28), facingAngleFromMovement({ x: 30, y: 28 }, INDIRECT_FREE_KICK_BALL)),
  faced(home('if-home-4', '4', 43, 58), facingAngleFromMovement({ x: 43, y: 58 }, INDIRECT_FREE_KICK_BALL)),
  faced(home('if-home-5', '5', 58, 62), facingAngleFromMovement({ x: 58, y: 62 }, INDIRECT_FREE_KICK_BALL)),
  faced(home('if-home-6', '6', 50, 36), facingAngleFromMovement({ x: 50, y: 36 }, INDIRECT_FREE_KICK_BALL)),
  faced(home('if-home-7', '7', 57, 18), facingAngleFromMovement({ x: 57, y: 18 }, INDIRECT_FREE_KICK_BALL)),
  faced(home('if-home-8', '8', 43, 17), facingAngleFromMovement({ x: 43, y: 17 }, INDIRECT_FREE_KICK_BALL)),
  faced(home('if-home-9', '9', 46, 6.4), facingAngleFromMovement({ x: 46, y: 6.4 }, INDIRECT_FREE_KICK_BALL)),
  faced(home('if-home-10', '10', 47, 15), facingAngleFromMovement({ x: 47, y: 15 }, INDIRECT_FREE_KICK_BALL)),
  faced(home('if-home-11', '11', 54, 6.4), facingAngleFromMovement({ x: 54, y: 6.4 }, INDIRECT_FREE_KICK_BALL)),
  faced(away('if-away-1', '1', 50, 0.7), facingAngleFromMovement({ x: 50, y: 0.7 }, INDIRECT_FREE_KICK_BALL)),
  faced(away('if-away-2', '2', 44.8, 2.4), facingAngleFromMovement({ x: 44.8, y: 2.4 }, INDIRECT_FREE_KICK_BALL)),
  faced(away('if-away-3', '3', 46.9, 2.4), facingAngleFromMovement({ x: 46.9, y: 2.4 }, INDIRECT_FREE_KICK_BALL)),
  faced(away('if-away-4', '4', 49, 2.4), facingAngleFromMovement({ x: 49, y: 2.4 }, INDIRECT_FREE_KICK_BALL)),
  faced(away('if-away-5', '5', 51.1, 2.4), facingAngleFromMovement({ x: 51.1, y: 2.4 }, INDIRECT_FREE_KICK_BALL)),
  faced(away('if-away-6', '6', 53.2, 2.4), facingAngleFromMovement({ x: 53.2, y: 2.4 }, INDIRECT_FREE_KICK_BALL)),
  faced(away('if-away-7', '7', 35, 8), facingAngleFromMovement({ x: 35, y: 8 }, INDIRECT_FREE_KICK_BALL)),
  faced(away('if-away-8', '8', 55.3, 2.4), facingAngleFromMovement({ x: 55.3, y: 2.4 }, INDIRECT_FREE_KICK_BALL)),
  faced(away('if-away-9', '9', 43, 52), facingAngleFromMovement({ x: 43, y: 52 }, INDIRECT_FREE_KICK_BALL)),
  faced(away('if-away-10', '10', 58, 55), facingAngleFromMovement({ x: 58, y: 55 }, INDIRECT_FREE_KICK_BALL)),
  faced(away('if-away-11', '11', 65, 8), facingAngleFromMovement({ x: 65, y: 8 }, INDIRECT_FREE_KICK_BALL)),
]

const indirectFreeKickSteps: PreviewStep[] = [
  {
    id: 'if-set',
    cue: 'SET — the ball is indirect inside the box. #9/#11 screen legally, #7/#8/#10 scan the restart, and #4/#5 stagger near halfway against the defending #9/#10 outlets.',
    emphasizePlayerId: 'if-home-10',
    playerFacings: [
      { playerId: 'if-home-7', facingAngle: facingAngleFromMovement({ x: 57, y: 18 }, INDIRECT_FREE_KICK_BALL) },
      { playerId: 'if-home-8', facingAngle: facingAngleFromMovement({ x: 43, y: 17 }, INDIRECT_FREE_KICK_BALL) },
      { playerId: 'if-home-10', facingAngle: facingAngleFromMovement({ x: 47, y: 15 }, INDIRECT_FREE_KICK_BALL) },
      { playerId: 'if-away-1', facingAngle: facingAngleFromMovement({ x: 50, y: 0.7 }, INDIRECT_FREE_KICK_BALL) },
    ],
    duration: 0.46,
  },
  {
    id: 'if-dummies',
    cue: 'FALSE CUES — #8 runs over the ball and #7 checks his approach; defenders shift their weight but cannot leave the goal line before the first touch.',
    playerId: 'if-home-8',
    playerTo: { x: 53, y: 13 },
    facingAngle: facingAngleFromMovement({ x: 43, y: 17 }, { x: 53, y: 13 }),
    playerMoves: [
      { playerId: 'if-home-7', to: { x: 55.5, y: 15.5 }, facingAngle: facingAngleFromMovement({ x: 57, y: 18 }, { x: 55.5, y: 15.5 }), startDelay: 0.1 },
      { playerId: 'if-home-10', to: { x: 48.2, y: 13.5 }, facingAngle: facingAngleFromMovement({ x: 47, y: 15 }, { x: 48.2, y: 13.5 }), startDelay: 0.18 },
      { playerId: 'if-away-1', to: { x: 50.5, y: 0.7 }, facingAngle: facingAngleFromMovement({ x: 50.5, y: 0.7 }, INDIRECT_FREE_KICK_BALL), startDelay: 0.2 },
      { playerId: 'if-away-7', to: { x: 36, y: 8 }, facingAngle: facingAngleFromMovement({ x: 36, y: 8 }, INDIRECT_FREE_KICK_BALL), startDelay: 0.22 },
      { playerId: 'if-away-11', to: { x: 64, y: 8 }, facingAngle: facingAngleFromMovement({ x: 64, y: 8 }, INDIRECT_FREE_KICK_BALL), startDelay: 0.24 },
    ],
    duration: 0.5,
  },
  {
    id: 'if-screen-release',
    cue: 'CLEAR THE LANE — #9 and #11 separate outside the defenders rather than blocking them; the shooting window becomes visible while the ball remains still.',
    playerMoves: [
      { playerId: 'if-home-9', to: { x: 41.5, y: 6.2 }, facingAngle: facingAngleFromMovement({ x: 46, y: 6.4 }, { x: 41.5, y: 6.2 }) },
      { playerId: 'if-home-11', to: { x: 58.5, y: 6.2 }, facingAngle: facingAngleFromMovement({ x: 54, y: 6.4 }, { x: 58.5, y: 6.2 }), startDelay: 0.04 },
      { playerId: 'if-home-8', to: { x: 60, y: 16 }, facingAngle: facingAngleFromMovement({ x: 53, y: 13 }, { x: 60, y: 16 }), startDelay: 0.07 },
      { playerId: 'if-home-2', to: { x: 67, y: 24 }, facingAngle: facingAngleFromMovement({ x: 70, y: 28 }, { x: 67, y: 24 }), startDelay: 0.1 },
      { playerId: 'if-home-3', to: { x: 33, y: 24 }, facingAngle: facingAngleFromMovement({ x: 30, y: 28 }, { x: 33, y: 24 }), startDelay: 0.12 },
    ],
    duration: 0.34,
  },
  {
    id: 'if-roll',
    cue: 'FIRST TOUCH — #10 rolls diagonally three metres; the wall launches only after the ball moves and #7 attacks the changed angle.',
    ballFrom: { x: 50, y: 11 },
    ballTo: { x: 54, y: 13 },
    playerId: 'if-home-10',
    playerTo: { x: 50, y: 11.8 },
    facingAngle: facingAngleFromMovement({ x: 50, y: 11 }, { x: 54, y: 13 }),
    playerMoves: [
      { playerId: 'if-home-7', to: { x: 55, y: 14 }, facingAngle: facingAngleFromMovement({ x: 55.5, y: 15.5 }, { x: 55, y: 14 }), startDelay: 0.06 },
      { playerId: 'if-away-2', to: { x: 44.5, y: 4.8 }, facingAngle: facingAngleFromMovement({ x: 44.8, y: 2.4 }, { x: 44.5, y: 4.8 }), startDelay: 0.18 },
      { playerId: 'if-away-3', to: { x: 46.8, y: 4.9 }, facingAngle: facingAngleFromMovement({ x: 46.9, y: 2.4 }, { x: 46.8, y: 4.9 }), startDelay: 0.19 },
      { playerId: 'if-away-4', to: { x: 49.1, y: 5 }, facingAngle: facingAngleFromMovement({ x: 49, y: 2.4 }, { x: 49.1, y: 5 }), startDelay: 0.2 },
      { playerId: 'if-away-5', to: { x: 51.4, y: 5 }, facingAngle: facingAngleFromMovement({ x: 51.1, y: 2.4 }, { x: 51.4, y: 5 }), startDelay: 0.21 },
      { playerId: 'if-away-6', to: { x: 53.7, y: 4.9 }, facingAngle: facingAngleFromMovement({ x: 53.2, y: 2.4 }, { x: 53.7, y: 4.9 }), startDelay: 0.22 },
      { playerId: 'if-away-8', to: { x: 56, y: 4.8 }, facingAngle: facingAngleFromMovement({ x: 55.3, y: 2.4 }, { x: 56, y: 4.8 }), startDelay: 0.23 },
      { playerId: 'if-away-7', to: { x: 39, y: 8.5 }, facingAngle: facingAngleFromMovement({ x: 36, y: 8 }, { x: 39, y: 8.5 }), startDelay: 0.2 },
      { playerId: 'if-away-11', to: { x: 61, y: 8.5 }, facingAngle: facingAngleFromMovement({ x: 64, y: 8 }, { x: 61, y: 8.5 }), startDelay: 0.22 },
    ],
    duration: 0.4,
  },
  {
    id: 'if-strike',
    cue: 'SECOND TOUCH / FINISH — #7 strikes through the vacated visual lane; the charging line turns, the goalkeeper dives, and the remaining players react to the rebound. GOAL.',
    ballFrom: { x: 54, y: 13 },
    ballTo: { x: 49, y: 0.4 },
    playerId: 'if-home-7',
    playerTo: { x: 54, y: 13 },
    facingAngle: facingAngleFromMovement({ x: 54, y: 13 }, { x: 49, y: 0.4 }),
    emphasizePlayerId: 'if-home-7',
    playerMoves: [
      { playerId: 'if-away-1', to: { x: 49, y: 1.4 }, facingAngle: facingAngleFromMovement({ x: 50.5, y: 0.7 }, { x: 49, y: 1.4 }) },
      { playerId: 'if-away-2', to: { x: 45, y: 7 }, facingAngle: facingAngleFromMovement({ x: 44.5, y: 4.8 }, { x: 45, y: 7 }), startDelay: 0.03 },
      { playerId: 'if-away-3', to: { x: 47.2, y: 7.2 }, facingAngle: facingAngleFromMovement({ x: 46.8, y: 4.9 }, { x: 47.2, y: 7.2 }), startDelay: 0.04 },
      { playerId: 'if-away-4', to: { x: 49.4, y: 7.3 }, facingAngle: facingAngleFromMovement({ x: 49.1, y: 5 }, { x: 49.4, y: 7.3 }), startDelay: 0.05 },
      { playerId: 'if-away-5', to: { x: 51.6, y: 7.3 }, facingAngle: facingAngleFromMovement({ x: 51.4, y: 5 }, { x: 51.6, y: 7.3 }), startDelay: 0.06 },
      { playerId: 'if-away-6', to: { x: 53.8, y: 7.2 }, facingAngle: facingAngleFromMovement({ x: 53.7, y: 4.9 }, { x: 53.8, y: 7.2 }), startDelay: 0.07 },
      { playerId: 'if-away-8', to: { x: 56, y: 7 }, facingAngle: facingAngleFromMovement({ x: 56, y: 4.8 }, { x: 56, y: 7 }), startDelay: 0.08 },
      { playerId: 'if-home-9', to: { x: 43, y: 3.8 }, facingAngle: facingAngleFromMovement({ x: 41.5, y: 6.2 }, { x: 43, y: 3.8 }), startDelay: 0.1 },
      { playerId: 'if-home-11', to: { x: 57, y: 3.8 }, facingAngle: facingAngleFromMovement({ x: 58.5, y: 6.2 }, { x: 57, y: 3.8 }), startDelay: 0.12 },
      { playerId: 'if-home-6', to: { x: 50, y: 31 }, facingAngle: facingAngleFromMovement({ x: 50, y: 36 }, { x: 50, y: 31 }), startDelay: 0.18 },
      { playerId: 'if-home-4', to: { x: 44, y: 56.5 }, facingAngle: facingAngleFromMovement({ x: 43, y: 58 }, { x: 44, y: 56.5 }), startDelay: 0.2 },
      { playerId: 'if-home-5', to: { x: 57, y: 60 }, facingAngle: facingAngleFromMovement({ x: 58, y: 62 }, { x: 57, y: 60 }), startDelay: 0.22 },
    ],
    duration: 0.52,
  },
]

const indirectFreeKickRoutes: PreviewRoute[] = [
  { id: 'if-eight-dummy', from: { x: 43, y: 17 }, to: { x: 53, y: 13 }, type: 'run', revealOnStepId: 'if-dummies' },
  { id: 'if-seven-false-start', from: { x: 57, y: 18 }, to: { x: 55.5, y: 15.5 }, type: 'run', revealOnStepId: 'if-dummies' },
  { id: 'if-nine-clears', from: { x: 46, y: 6.4 }, to: { x: 41.5, y: 6.2 }, type: 'run', revealOnStepId: 'if-screen-release' },
  { id: 'if-eleven-clears', from: { x: 54, y: 6.4 }, to: { x: 58.5, y: 6.2 }, type: 'run', revealOnStepId: 'if-screen-release' },
  { id: 'if-eight-clears', from: { x: 53, y: 13 }, to: { x: 60, y: 16 }, type: 'run', revealOnStepId: 'if-screen-release' },
  { id: 'if-diagonal-roll', from: { x: 50, y: 11 }, to: { x: 54, y: 13 }, type: 'pass', revealOnStepId: 'if-roll' },
  { id: 'if-wall-charge', from: { x: 51.1, y: 2.4 }, to: { x: 51.6, y: 7.3 }, type: 'press', revealOnStepId: 'if-strike' },
  { id: 'if-shot', from: { x: 54, y: 13 }, to: { x: 49, y: 0.4 }, type: 'shot', revealOnStepId: 'if-strike' },
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
    organization: '#7 starts at the corner arc, #3 offers the short change of angle, and #4/#5/#9/#10/#11 retain the connected high cluster. #2 waits just beyond the back side for first contact, #8 holds for the delayed penalty-spot run, and #6 secures transition. The opponent keeps its hybrid line, markers, short watcher, edge player, and outlet.',
    strategy: 'Use the same short-angle trigger and connected high-box runs to occupy the hybrid line, then deliver beyond the crowd for #2 to head back toward the penalty spot and #8 to arrive late for the second header.',
    tactics: [
      '#3 receives short while the connected group holds until the new delivery cue',
      '#4/#10 cross the central line, #5/#11 manipulate the far-side markers, and #9 pins the goalkeeper-side defender',
      '#3 drives beyond the crowd for #2, who arrives side-on and cushions the first header back toward the penalty spot',
      '#8 delays outside the traffic, accelerates onto the return, and heads down across goal while #6 protects the transition',
    ],
    skillSet: ['Driven delivery', 'Disguise', 'Acceleration', 'Run timing', 'Aerial timing', 'Cushioned heading', 'Body orientation', 'Anticipation', 'Communication'],
    principles: ['MOBILITY', 'PENETRATION', 'IMPROVISATION', 'SUPPORT'],
    caption: 'Short-angle trigger, connected high cluster, far-post delivery to #2, controlled header back toward the penalty spot, and #8’s late headed finish.',
    realityReference: 'Professional reference: Arsenal scored from a Premier League corner when a back-post delivery was headed across goal for the finishing touch; MLS examples use the same far-post overload, controlled header back, and late central aerial arrival without relying on an illegal block.',
    implementation: 'Full animation',
    preview: {
      players: CORNER_PIXI_SCENARIO.players,
      ballPosition: CORNER_PIXI_SCENARIO.ballPosition,
      steps: CORNER_PIXI_SCENARIO.steps ?? [],
      routes: CORNER_PIXI_SCENARIO.routes ?? [],
    },
    liveBoardScenarioId: 'corner-short-decoy-wide-delivery',
    tokenScale: 0.68,
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
    organization: '#7 delivers from wide right Channel 1; #9 starts centrally, #10 threatens the front space, #11 holds the far shoulder, #4/#5/#8 balance the second phase, and #2/#3/#6 hold security. The opponent uses a hybrid of priority-space zones, matched aerial threats, a short watcher, and edge protection.',
    strategy: 'Use the right-sided crossing angle to pull the wide defender short, deliver over the first line to #11, and finish the headed return through #9 before the hybrid defence can recover.',
    tactics: [
      '#2 shows short to pull the wide defender away from #7’s service window',
      '#10 bends toward the front space, #9 pins the middle, and #11 arrives blind-side',
      '#7 serves over the first line and #11 heads the far-post ball back across goal',
      '#9 finishes the return first time while #2/#3/#6 retain security',
    ],
    skillSet: ['Timing', 'Acceleration', 'Disguise', 'Delivery quality', 'Heading', 'Body orientation', 'Communication', 'Second-ball anticipation'],
    principles: ['MOBILITY', 'PENETRATION', 'IMPROVISATION', 'SUPPORT'],
    caption: 'Wide-right disguise, three distinct runs, far-post service, headed return, first-time finish, and secure rest defence.',
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
    id: 'direct-free-kick',
    tabLabel: 'Direct Free Kick',
    setPieceType: 'Attacking direct free kick · central roll-and-strike',
    organization: '#7/#10 stand over the central ball. #9/#11 begin onside behind the wall line, #6 screens legally outside the wall, and #2/#3 hold wide rebound lanes. Only #4/#5 stay near halfway, staggered and goal-side of the defending #9/#10 counter outlets.',
    strategy: 'Disguise the first action, roll two metres across the wall’s sightline, and let #10 strike the changed angle before the charging defenders or goalkeeper can reset.',
    tactics: [
      '#7 and #10 scan wall alignment, goalkeeper position, the referee, and the legal rebound spaces before fixing the call',
      '#7 shapes to shoot while #10 shortens his approach, forcing the wall and goalkeeper to hold conflicting pictures',
      '#7 rolls across #10’s path; the first touch puts the ball in play and triggers the wall, goalkeeper, and rebound runners',
      '#10 strikes through the opening while #9/#11 crash from onside positions, #2/#3 support a spill, #6 clears legally, and #4/#5 protect transition',
    ],
    skillSet: ['Pre-scan', 'Disguise', 'First-touch weight', 'Approach timing', 'Plant-foot position', 'Clean striking', 'Rebound reaction', 'Rest defence', 'Body orientation'],
    principles: ['SUPPORT', 'MOBILITY', 'PENETRATION', 'IMPROVISATION', 'BALANCE'],
    caption: '#7 disguises and rolls, #10 strikes the shifted lane, #6 releases from a legal screen, onside runners attack the rebound, and the staggered rest defence controls both outlets.',
    realityReference: 'Elite-match principle: a late angle change can move the wall and goalkeeper, but rebound runners must be onside at each touch and attacking players must remain one metre from a defensive wall of three or more players.',
    implementation: 'Short presentation sequence',
    preview: {
      players: directFreeKickPlayers,
      ballPosition: DIRECT_FREE_KICK_BALL,
      steps: directFreeKickSteps,
      routes: directFreeKickRoutes,
    },
    tokenScale: 0.64,
    repeatDelay: 1.4,
  },
  {
    id: 'indirect-free-kick',
    tabLabel: 'Indirect Free Kick',
    setPieceType: 'Attacking indirect free kick · inside-box fake, shift, strike',
    organization: '#7/#8/#10 provide three actions around the indirect restart. #9/#11 screen more than one metre from the goal-line wall, then clear laterally; #2/#3/#6 support rebounds while staggered #4/#5 stay goal-side of the defending #9/#10 counter outlets.',
    strategy: 'Use two believable false cues to move the defenders’ weight, legally clear the visual lane, roll diagonally far enough to change the shooting angle, then finish with the mandatory second touch.',
    tactics: [
      '#8 runs over the ball and #7 checks his approach while #10 remains available as the first-touch player',
      '#9/#11 separate away from the wall without blocking a defender, exposing a legal visual and shooting lane',
      '#10 rolls diagonally three metres; only after this clear first touch can the goal-line defenders launch toward the ball',
      '#7 strikes the second touch as the wall charges and goalkeeper dives; rebound runners react while #4/#5 remain connected to both high outlets',
    ],
    skillSet: ['Referee recognition', 'Dummy timing', 'Visual disguise', 'First-touch weight', 'Angle creation', 'Second-touch strike', 'Legal spacing', 'Rebound reaction', 'Body orientation'],
    principles: ['SUPPORT', 'MOBILITY', 'PENETRATION', 'IMPROVISATION', 'BALANCE'],
    caption: 'Two false cues, legal screen spacing, a diagonal first touch, a charging goal-line wall, second-touch finish, rebound support, and two staggered rest defenders against the counter.',
    realityReference: 'Law-based elite-match principle: an indirect free kick requires a second touch before a goal can be scored, defenders inside the required distance stay on their goal line, and attackers remain at least one metre from a wall of three or more players.',
    implementation: 'Short presentation sequence',
    preview: {
      players: indirectFreeKickPlayers,
      ballPosition: INDIRECT_FREE_KICK_BALL,
      steps: indirectFreeKickSteps,
      routes: indirectFreeKickRoutes,
    },
    tokenScale: 0.52,
    repeatDelay: 1.55,
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
