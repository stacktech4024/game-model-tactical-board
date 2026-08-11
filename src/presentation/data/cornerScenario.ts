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

export const CORNER_PREVIEW_PLAYERS: CornerPreviewPlayer[] = [
  { id: 'ac-home-1', label: '1', role: 'Rest-defence goalkeeper', start: { x: 50, y: 94 }, tone: 'keeper' },
  { id: 'ac-home-2', label: '2', role: 'Rest-defence cover', start: { x: 78, y: 62 } },
  { id: 'ac-home-3', label: '3', role: 'Short option and changed-angle server', start: { x: 7, y: 8 }, facingAngle: 115 },
  { id: 'ac-home-4', label: '4', role: 'Near-zone decoy', start: { x: 58, y: 31 } },
  { id: 'ac-home-5', label: '5', role: 'Marker-manipulation run', start: { x: 63, y: 30 } },
  { id: 'ac-home-6', label: '6', role: 'Rest-defence screen', start: { x: 55, y: 57 } },
  { id: 'ac-home-7', label: '7', role: 'Corner taker', start: { x: 1.5, y: 2 }, facingAngle: 102.4 },
  { id: 'ac-home-8', label: '8', role: 'Edge and second-ball player', start: { x: 48, y: 42 } },
  { id: 'ac-home-9', label: '9', role: 'Primary first-contact target', start: { x: 68, y: 31 } },
  { id: 'ac-home-10', label: '10', role: 'Crossing decoy runner', start: { x: 73, y: 30 } },
  { id: 'ac-home-11', label: '11', role: 'Secondary far-post target', start: { x: 78, y: 31 } },
  { id: 'ac-away-1', label: '1', role: 'Goalkeeper', start: { x: 50, y: 4 }, tone: 'keeper', side: 'away' },
  { id: 'ac-away-2', label: '2', role: 'Far-post zonal defender', start: { x: 64, y: 12 }, tone: 'opponent', side: 'away' },
  { id: 'ac-away-3', label: '3', role: 'Marker on near runner', start: { x: 59, y: 27 }, tone: 'opponent', side: 'away' },
  { id: 'ac-away-4', label: '4', role: 'Near-post zonal defender', start: { x: 38, y: 11 }, tone: 'opponent', side: 'away' },
  { id: 'ac-away-5', label: '5', role: 'Central zonal defender', start: { x: 47, y: 11 }, tone: 'opponent', side: 'away' },
  { id: 'ac-away-6', label: '6', role: 'Goalkeeper-corridor zonal defender', start: { x: 56, y: 11 }, tone: 'opponent', side: 'away' },
  { id: 'ac-away-7', label: '7', role: 'Edge protector', start: { x: 48, y: 36 }, tone: 'opponent', side: 'away' },
  { id: 'ac-away-8', label: '8', role: 'Marker on primary target', start: { x: 68, y: 27 }, tone: 'opponent', side: 'away' },
  { id: 'ac-away-9', label: '9', role: 'Counter outlet', start: { x: 50, y: 55 }, tone: 'opponent', side: 'away' },
  { id: 'ac-away-10', label: '10', role: 'Marker on far runner', start: { x: 76, y: 27 }, tone: 'opponent', side: 'away' },
  { id: 'ac-away-11', label: '11', role: 'Short-corner watcher', start: { x: 12, y: 11 }, tone: 'opponent', side: 'away' },
]

export const CORNER_PREVIEW_BALL_START: CornerPreviewPoint = { x: 1.5, y: 1.5 }

export const CORNER_PREVIEW_STEPS: PixiPitchPreviewStep[] = [
  {
    id: 'ac-set',
    cue: 'SET — #4/#5/#9/#10/#11 connect at the back side; #8 holds the edge and #2/#6 secure transition.',
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
    playerMoves: [
      { playerId: 'ac-home-7', to: { x: 3, y: 4 }, startDelay: 0.08 },
      { playerId: 'ac-away-11', to: { x: 9, y: 10 }, startDelay: 0.12 },
    ],
    duration: 0.42,
  },
  {
    id: 'ac-manipulation',
    cue: 'MANIPULATE — the far-side group separates at different moments to create angled runs across the defenders.',
    playerMoves: [
      { playerId: 'ac-home-4', to: { x: 54, y: 25 } },
      { playerId: 'ac-home-10', to: { x: 60, y: 25 }, startDelay: 0.04 },
      { playerId: 'ac-home-5', to: { x: 65, y: 25 }, startDelay: 0.08 },
      { playerId: 'ac-home-9', to: { x: 70, y: 25 }, startDelay: 0.13 },
      { playerId: 'ac-home-11', to: { x: 76, y: 25 }, startDelay: 0.18 },
      { playerId: 'ac-away-3', to: { x: 56, y: 26 }, startDelay: 0.09 },
      { playerId: 'ac-away-8', to: { x: 68, y: 26 }, startDelay: 0.15 },
      { playerId: 'ac-away-10', to: { x: 75, y: 26 }, startDelay: 0.21 },
    ],
    duration: 0.5,
  },
  {
    id: 'ac-delivery',
    cue: 'DELIVERY — #3 targets #9 in the central six-yard corridor as the connected group attacks three zones.',
    ballFrom: { x: 7, y: 8 },
    ballTo: { x: 51, y: 11 },
    playerMoves: [
      { playerId: 'ac-home-4', to: { x: 40, y: 12 } },
      { playerId: 'ac-home-10', to: { x: 46, y: 15 }, startDelay: 0.05 },
      { playerId: 'ac-home-9', to: { x: 51, y: 11 }, startDelay: 0.1 },
      { playerId: 'ac-home-5', to: { x: 57, y: 16 }, startDelay: 0.14 },
      { playerId: 'ac-home-11', to: { x: 64, y: 12 }, startDelay: 0.19 },
      { playerId: 'ac-away-3', to: { x: 47, y: 17 }, startDelay: 0.08 },
      { playerId: 'ac-away-8', to: { x: 52, y: 14 }, startDelay: 0.16 },
      { playerId: 'ac-away-10', to: { x: 63, y: 15 }, startDelay: 0.23 },
      { playerId: 'ac-away-1', to: { x: 51, y: 5 }, startDelay: 0.2 },
    ],
    duration: 0.72,
  },
  {
    id: 'ac-first-contact',
    cue: 'FIRST CONTACT — #9 attacks with momentum as the central defender and goalkeeper react; his contact drops into #8’s path.',
    ballFrom: { x: 51, y: 11 },
    ballTo: { x: 48, y: 22 },
    emphasizePlayerId: 'ac-home-9',
    playerMoves: [
      { playerId: 'ac-home-9', to: { x: 51, y: 10 } },
      { playerId: 'ac-away-5', to: { x: 50, y: 12 } },
      { playerId: 'ac-away-8', to: { x: 51, y: 13 }, startDelay: 0.06 },
      { playerId: 'ac-away-1', to: { x: 50, y: 5 }, startDelay: 0.1 },
      { playerId: 'ac-home-8', to: { x: 48, y: 23 }, startDelay: 0.17 },
      { playerId: 'ac-away-7', to: { x: 50, y: 25 }, startDelay: 0.22 },
    ],
    duration: 0.5,
  },
  {
    id: 'ac-finish',
    cue: 'FINISH — #8 steps through the dropping ball and shoots through traffic. GOAL.',
    ballFrom: { x: 48, y: 22 },
    ballTo: { x: 50, y: 0 },
    emphasizePlayerId: 'ac-home-8',
    playerMoves: [
      { playerId: 'ac-home-8', to: { x: 48, y: 21 } },
      { playerId: 'ac-home-2', to: { x: 75, y: 59 }, startDelay: 0.15 },
      { playerId: 'ac-away-5', to: { x: 49, y: 10 }, startDelay: 0.08 },
      { playerId: 'ac-away-1', to: { x: 50, y: 3 }, startDelay: 0.12 },
    ],
    duration: 0.56,
  },
]

export const CORNER_PREVIEW_ROUTES: PixiPitchPreviewRoute[] = [
  { id: 'ac-short-pass', from: { x: 1.5, y: 1.5 }, to: { x: 7, y: 8 }, type: 'pass', revealOnStepId: 'ac-short-trigger' },
  { id: 'ac-near-run', from: { x: 58, y: 31 }, to: { x: 40, y: 12 }, type: 'run', revealOnStepId: 'ac-delivery' },
  { id: 'ac-cross-run', from: { x: 73, y: 30 }, to: { x: 46, y: 15 }, type: 'run', revealOnStepId: 'ac-delivery' },
  { id: 'ac-primary-run', from: { x: 68, y: 31 }, to: { x: 51, y: 11 }, type: 'run', revealOnStepId: 'ac-delivery' },
  { id: 'ac-decoy-run', from: { x: 63, y: 30 }, to: { x: 57, y: 16 }, type: 'run', revealOnStepId: 'ac-delivery' },
  { id: 'ac-far-run', from: { x: 78, y: 31 }, to: { x: 64, y: 12 }, type: 'run', revealOnStepId: 'ac-delivery' },
  { id: 'ac-delivery-ball', from: { x: 7, y: 8 }, to: { x: 51, y: 11 }, type: 'pass', revealOnStepId: 'ac-delivery' },
  { id: 'ac-contact', from: { x: 51, y: 11 }, to: { x: 48, y: 22 }, type: 'pass', revealOnStepId: 'ac-first-contact' },
  { id: 'ac-shot', from: { x: 48, y: 22 }, to: { x: 50, y: 0 }, type: 'shot', revealOnStepId: 'ac-finish' },
]

export const CORNER_PREVIEW_CAPTION =
  'Short-angle trigger, connected far-side cluster, diagonal three-zone runs, contested first contact, and a decisive second-action finish.'
