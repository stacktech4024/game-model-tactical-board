import type {
  PixiPitchPreviewRoute,
  PixiPitchPreviewStep,
} from '../../renderers/pixi/PixiPitchPreview'

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
  side?: 'home' | 'away'
  facingAngle?: number
}

const facingAngleFromMovement = (
  from: CornerPreviewPoint,
  to: CornerPreviewPoint,
) => Math.round((Math.atan2(to.x - from.x, from.y - to.y) * 180) / Math.PI)

const CORNER_BALL_START: CornerPreviewPoint = { x: 1.5, y: 1.5 }

export const CORNER_PREVIEW_PLAYERS: CornerPreviewPlayer[] = [
  { id: 'ac-home-1', label: '1', role: 'Rest-defence goalkeeper', start: { x: 50, y: 94 }, tone: 'keeper', facingAngle: facingAngleFromMovement({ x: 50, y: 94 }, { x: 50, y: 20 }) },
  { id: 'ac-home-2', label: '2', role: 'Wide back-post first-contact runner', start: { x: 90, y: 38 }, facingAngle: facingAngleFromMovement({ x: 90, y: 38 }, { x: 72, y: 8 }) },
  { id: 'ac-home-3', label: '3', role: 'Short option and changed-angle server', start: { x: 7, y: 8 }, facingAngle: facingAngleFromMovement({ x: 7, y: 8 }, CORNER_BALL_START) },
  { id: 'ac-home-4', label: '4', role: 'Near-zone decoy', start: { x: 56, y: 31 }, facingAngle: facingAngleFromMovement({ x: 56, y: 31 }, CORNER_BALL_START) },
  { id: 'ac-home-5', label: '5', role: 'Marker-manipulation run', start: { x: 62, y: 30 }, facingAngle: facingAngleFromMovement({ x: 62, y: 30 }, CORNER_BALL_START) },
  { id: 'ac-home-6', label: '6', role: 'Rest-defence screen', start: { x: 55, y: 57 }, facingAngle: facingAngleFromMovement({ x: 55, y: 57 }, { x: 50, y: 20 }) },
  { id: 'ac-home-7', label: '7', role: 'Corner taker', start: { x: 1.5, y: 2 }, facingAngle: facingAngleFromMovement(CORNER_BALL_START, { x: 7, y: 8 }) },
  { id: 'ac-home-8', label: '8', role: 'Late penalty-spot header runner', start: { x: 48, y: 42 }, facingAngle: facingAngleFromMovement({ x: 48, y: 42 }, CORNER_BALL_START) },
  { id: 'ac-home-9', label: '9', role: 'Central pin and goal-line decoy', start: { x: 68, y: 31 }, facingAngle: facingAngleFromMovement({ x: 68, y: 31 }, CORNER_BALL_START) },
  { id: 'ac-home-10', label: '10', role: 'Crossing decoy runner', start: { x: 74, y: 30 }, facingAngle: facingAngleFromMovement({ x: 74, y: 30 }, CORNER_BALL_START) },
  { id: 'ac-home-11', label: '11', role: 'Secondary far-post target', start: { x: 80, y: 31 }, facingAngle: facingAngleFromMovement({ x: 80, y: 31 }, CORNER_BALL_START) },
  { id: 'ac-away-1', label: '1', role: 'Goalkeeper', start: { x: 50, y: 4 }, tone: 'keeper', side: 'away', facingAngle: facingAngleFromMovement({ x: 50, y: 4 }, CORNER_BALL_START) },
  { id: 'ac-away-2', label: '2', role: 'Far-post zonal defender', start: { x: 64, y: 12 }, tone: 'opponent', side: 'away', facingAngle: facingAngleFromMovement({ x: 64, y: 12 }, CORNER_BALL_START) },
  { id: 'ac-away-3', label: '3', role: 'Marker on near runner', start: { x: 58, y: 27 }, tone: 'opponent', side: 'away', facingAngle: facingAngleFromMovement({ x: 58, y: 27 }, CORNER_BALL_START) },
  { id: 'ac-away-4', label: '4', role: 'Near-post zonal defender', start: { x: 38, y: 11 }, tone: 'opponent', side: 'away', facingAngle: facingAngleFromMovement({ x: 38, y: 11 }, CORNER_BALL_START) },
  { id: 'ac-away-5', label: '5', role: 'Central zonal defender', start: { x: 47, y: 11 }, tone: 'opponent', side: 'away', facingAngle: facingAngleFromMovement({ x: 47, y: 11 }, CORNER_BALL_START) },
  { id: 'ac-away-6', label: '6', role: 'Goalkeeper-corridor zonal defender', start: { x: 56, y: 11 }, tone: 'opponent', side: 'away', facingAngle: facingAngleFromMovement({ x: 56, y: 11 }, CORNER_BALL_START) },
  { id: 'ac-away-7', label: '7', role: 'Edge protector', start: { x: 48, y: 36 }, tone: 'opponent', side: 'away', facingAngle: facingAngleFromMovement({ x: 48, y: 36 }, CORNER_BALL_START) },
  { id: 'ac-away-8', label: '8', role: 'Marker on primary target', start: { x: 69, y: 27 }, tone: 'opponent', side: 'away', facingAngle: facingAngleFromMovement({ x: 69, y: 27 }, CORNER_BALL_START) },
  { id: 'ac-away-9', label: '9', role: 'Counter outlet', start: { x: 50, y: 55 }, tone: 'opponent', side: 'away', facingAngle: facingAngleFromMovement({ x: 50, y: 55 }, CORNER_BALL_START) },
  { id: 'ac-away-10', label: '10', role: 'Marker on far runner', start: { x: 78, y: 27 }, tone: 'opponent', side: 'away', facingAngle: facingAngleFromMovement({ x: 78, y: 27 }, CORNER_BALL_START) },
  { id: 'ac-away-11', label: '11', role: 'Short-corner watcher', start: { x: 12, y: 11 }, tone: 'opponent', side: 'away', facingAngle: facingAngleFromMovement({ x: 12, y: 11 }, CORNER_BALL_START) },
]

export const CORNER_PREVIEW_BALL_START: CornerPreviewPoint = CORNER_BALL_START

export const CORNER_PREVIEW_STEPS: PixiPitchPreviewStep[] = [
  {
    id: 'ac-set',
    cue: 'SET — #4/#5/#9/#10/#11 connect high; #2 waits beyond the back side, #8 holds for the late run, and #6 secures transition.',
    emphasizePlayerId: 'ac-home-7',
    duration: 0.38,
  },
  {
    id: 'ac-short-trigger',
    cue: 'TRIGGER — #3 checks short, #7 changes the angle, and the main group waits for the receiver’s touch.',
    ballFrom: { x: 1.5, y: 1.5 },
    ballTo: { x: 7, y: 8 },
    playerId: 'ac-home-3',
    playerTo: { x: 7, y: 8 },
    facingAngle: facingAngleFromMovement({ x: 7, y: 8 }, CORNER_BALL_START),
    playerMoves: [
      { playerId: 'ac-home-7', to: { x: 3, y: 4 }, facingAngle: facingAngleFromMovement({ x: 1.5, y: 2 }, { x: 3, y: 4 }), startDelay: 0.08 },
      { playerId: 'ac-away-11', to: { x: 9, y: 10 }, facingAngle: facingAngleFromMovement({ x: 12, y: 11 }, { x: 9, y: 10 }), startDelay: 0.12 },
    ],
    duration: 0.42,
  },
  {
    id: 'ac-manipulation',
    cue: 'MANIPULATE — the high group separates at different moments, pinning the central line while #2 stays hidden behind the back-post defender.',
    playerMoves: [
      { playerId: 'ac-home-4', to: { x: 54, y: 25 }, facingAngle: facingAngleFromMovement({ x: 56, y: 31 }, { x: 54, y: 25 }) },
      { playerId: 'ac-home-10', to: { x: 60, y: 25 }, facingAngle: facingAngleFromMovement({ x: 74, y: 30 }, { x: 60, y: 25 }), startDelay: 0.04 },
      { playerId: 'ac-home-5', to: { x: 65, y: 25 }, facingAngle: facingAngleFromMovement({ x: 62, y: 30 }, { x: 65, y: 25 }), startDelay: 0.08 },
      { playerId: 'ac-home-9', to: { x: 70, y: 25 }, facingAngle: facingAngleFromMovement({ x: 68, y: 31 }, { x: 70, y: 25 }), startDelay: 0.13 },
      { playerId: 'ac-home-11', to: { x: 76, y: 25 }, facingAngle: facingAngleFromMovement({ x: 80, y: 31 }, { x: 76, y: 25 }), startDelay: 0.18 },
      { playerId: 'ac-home-2', to: { x: 84, y: 31 }, facingAngle: facingAngleFromMovement({ x: 90, y: 38 }, { x: 84, y: 31 }), startDelay: 0.2 },
      { playerId: 'ac-home-8', to: { x: 48, y: 35 }, facingAngle: facingAngleFromMovement({ x: 48, y: 42 }, { x: 48, y: 35 }), startDelay: 0.24 },
      { playerId: 'ac-away-3', to: { x: 56, y: 26 }, facingAngle: facingAngleFromMovement({ x: 58, y: 27 }, { x: 56, y: 26 }), startDelay: 0.09 },
      { playerId: 'ac-away-8', to: { x: 68, y: 26 }, facingAngle: facingAngleFromMovement({ x: 69, y: 27 }, { x: 68, y: 26 }), startDelay: 0.15 },
      { playerId: 'ac-away-10', to: { x: 75, y: 26 }, facingAngle: facingAngleFromMovement({ x: 78, y: 27 }, { x: 75, y: 26 }), startDelay: 0.21 },
    ],
    duration: 0.5,
  },
  {
    id: 'ac-delivery',
    cue: 'DELIVERY — #3 drives beyond the crowd to #2 at the far post; the connected group runs across the hybrid line to clear his aerial lane.',
    ballFrom: { x: 7, y: 8 },
    ballTo: { x: 72, y: 8 },
    playerMoves: [
      { playerId: 'ac-home-4', to: { x: 40, y: 12 }, facingAngle: facingAngleFromMovement({ x: 54, y: 25 }, { x: 40, y: 12 }) },
      { playerId: 'ac-home-10', to: { x: 46, y: 15 }, facingAngle: facingAngleFromMovement({ x: 60, y: 25 }, { x: 46, y: 15 }), startDelay: 0.05 },
      { playerId: 'ac-home-9', to: { x: 51, y: 8 }, facingAngle: facingAngleFromMovement({ x: 70, y: 25 }, { x: 51, y: 8 }), startDelay: 0.1 },
      { playerId: 'ac-home-5', to: { x: 57, y: 16 }, facingAngle: facingAngleFromMovement({ x: 65, y: 25 }, { x: 57, y: 16 }), startDelay: 0.14 },
      { playerId: 'ac-home-11', to: { x: 62, y: 10 }, facingAngle: facingAngleFromMovement({ x: 76, y: 25 }, { x: 62, y: 10 }), startDelay: 0.19 },
      { playerId: 'ac-home-2', to: { x: 72, y: 8 }, facingAngle: facingAngleFromMovement({ x: 84, y: 31 }, { x: 72, y: 8 }), startDelay: 0.22 },
      { playerId: 'ac-away-3', to: { x: 47, y: 17 }, facingAngle: facingAngleFromMovement({ x: 56, y: 26 }, { x: 47, y: 17 }), startDelay: 0.08 },
      { playerId: 'ac-away-8', to: { x: 52, y: 14 }, facingAngle: facingAngleFromMovement({ x: 68, y: 26 }, { x: 52, y: 14 }), startDelay: 0.16 },
      { playerId: 'ac-away-10', to: { x: 67, y: 11 }, facingAngle: facingAngleFromMovement({ x: 75, y: 26 }, { x: 67, y: 11 }), startDelay: 0.23 },
      { playerId: 'ac-away-2', to: { x: 70, y: 9 }, facingAngle: facingAngleFromMovement({ x: 64, y: 12 }, { x: 70, y: 9 }), startDelay: 0.19 },
      { playerId: 'ac-away-1', to: { x: 51, y: 5 }, facingAngle: facingAngleFromMovement({ x: 51, y: 5 }, { x: 7, y: 8 }), startDelay: 0.2 },
    ],
    playerFacings: [
      { playerId: 'ac-home-8', facingAngle: facingAngleFromMovement({ x: 48, y: 35 }, { x: 7, y: 8 }) },
      { playerId: 'ac-home-6', facingAngle: facingAngleFromMovement({ x: 55, y: 57 }, { x: 72, y: 8 }) },
    ],
    duration: 0.78,
  },
  {
    id: 'ac-header-across',
    cue: 'HEADER ACROSS — #2 opens side-on and cushions the first header back toward the penalty spot as #8 accelerates through the second line.',
    ballFrom: { x: 72, y: 8 },
    ballTo: { x: 50, y: 11 },
    emphasizePlayerId: 'ac-home-2',
    playerMoves: [
      { playerId: 'ac-home-2', to: { x: 71.5, y: 8.5 }, facingAngle: facingAngleFromMovement({ x: 72, y: 8 }, { x: 50, y: 11 }) },
      { playerId: 'ac-home-8', to: { x: 50, y: 11 }, facingAngle: facingAngleFromMovement({ x: 48, y: 35 }, { x: 50, y: 11 }), startDelay: 0.06 },
      { playerId: 'ac-home-9', to: { x: 49, y: 5.5 }, facingAngle: facingAngleFromMovement({ x: 51, y: 8 }, { x: 49, y: 5.5 }), startDelay: 0.08 },
      { playerId: 'ac-away-2', to: { x: 69, y: 9 }, facingAngle: facingAngleFromMovement({ x: 70, y: 9 }, { x: 69, y: 9 }), startDelay: 0.04 },
      { playerId: 'ac-away-5', to: { x: 51, y: 11 }, facingAngle: facingAngleFromMovement({ x: 47, y: 11 }, { x: 51, y: 11 }), startDelay: 0.09 },
      { playerId: 'ac-away-8', to: { x: 53, y: 12 }, facingAngle: facingAngleFromMovement({ x: 52, y: 14 }, { x: 53, y: 12 }), startDelay: 0.12 },
      { playerId: 'ac-away-7', to: { x: 49, y: 18 }, facingAngle: facingAngleFromMovement({ x: 48, y: 36 }, { x: 49, y: 18 }), startDelay: 0.14 },
      { playerId: 'ac-away-1', to: { x: 50, y: 4 }, startDelay: 0.1, facingAngle: 180 },
    ],
    duration: 0.54,
  },
  {
    id: 'ac-finish',
    cue: 'FINISH — #8 meets the return above the penalty spot and heads down across the goalkeeper. GOAL.',
    ballFrom: { x: 50, y: 11 },
    ballTo: { x: 46, y: 0 },
    emphasizePlayerId: 'ac-home-8',
    playerMoves: [
      { playerId: 'ac-home-8', to: { x: 50, y: 10.5 }, facingAngle: facingAngleFromMovement({ x: 50, y: 11 }, { x: 46, y: 0 }) },
      { playerId: 'ac-away-5', to: { x: 50, y: 9.5 }, facingAngle: facingAngleFromMovement({ x: 51, y: 11 }, { x: 50, y: 9.5 }), startDelay: 0.08 },
      { playerId: 'ac-away-1', to: { x: 47, y: 2.5 }, facingAngle: facingAngleFromMovement({ x: 50, y: 4 }, { x: 47, y: 2.5 }), startDelay: 0.12 },
      { playerId: 'ac-home-6', to: { x: 54, y: 55 }, facingAngle: facingAngleFromMovement({ x: 55, y: 57 }, { x: 54, y: 55 }), startDelay: 0.18 },
    ],
    duration: 0.5,
  },
]

export const CORNER_PREVIEW_ROUTES: PixiPitchPreviewRoute[] = [
  { id: 'ac-short-pass', from: { x: 1.5, y: 1.5 }, to: { x: 7, y: 8 }, type: 'pass', revealOnStepId: 'ac-short-trigger' },
  { id: 'ac-near-run', from: { x: 56, y: 31 }, to: { x: 40, y: 12 }, type: 'run', revealOnStepId: 'ac-delivery' },
  { id: 'ac-cross-run', from: { x: 74, y: 30 }, to: { x: 46, y: 15 }, type: 'run', revealOnStepId: 'ac-delivery' },
  { id: 'ac-central-pin', from: { x: 68, y: 31 }, to: { x: 51, y: 8 }, type: 'run', revealOnStepId: 'ac-delivery' },
  { id: 'ac-decoy-run', from: { x: 62, y: 30 }, to: { x: 57, y: 16 }, type: 'run', revealOnStepId: 'ac-delivery' },
  { id: 'ac-far-decoy-run', from: { x: 80, y: 31 }, to: { x: 62, y: 10 }, type: 'run', revealOnStepId: 'ac-delivery' },
  { id: 'ac-two-back-post-run', from: { x: 90, y: 38 }, to: { x: 72, y: 8 }, type: 'run', revealOnStepId: 'ac-delivery' },
  { id: 'ac-delivery-ball', from: { x: 7, y: 8 }, to: { x: 72, y: 8 }, type: 'pass', revealOnStepId: 'ac-delivery' },
  { id: 'ac-two-header-across', from: { x: 72, y: 8 }, to: { x: 50, y: 11 }, type: 'pass', revealOnStepId: 'ac-header-across' },
  { id: 'ac-eight-late-run', from: { x: 48, y: 35 }, to: { x: 50, y: 11 }, type: 'run', revealOnStepId: 'ac-header-across' },
  { id: 'ac-eight-header-goal', from: { x: 50, y: 11 }, to: { x: 46, y: 0 }, type: 'shot', revealOnStepId: 'ac-finish' },
]

export const CORNER_PREVIEW_CAPTION =
  'Short-angle trigger, connected high cluster, far-post delivery to #2, controlled header back toward the penalty spot, and #8’s late headed finish.'
