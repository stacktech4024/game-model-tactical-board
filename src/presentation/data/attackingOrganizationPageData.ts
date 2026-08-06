import type {
  PixiPitchPreviewProps,
  PixiPitchPreviewRoute,
  PixiPitchPreviewStep,
} from '../../renderers/pixi/PixiPitchPreview'
import {
  pitchPercentToPreviewPoint,
  type PitchPercentPoint,
} from './previewPitchCoordinates.ts'

export const ATTACKING_ORGANIZATION_TABS = ['System', 'Strategy', 'Tactics', 'Skill Set'] as const

export type AttackingOrganizationTab = (typeof ATTACKING_ORGANIZATION_TABS)[number]
export type AttackingOrganizationMainTab = Exclude<AttackingOrganizationTab, 'Skill Set'>
export type AttackingOrganizationService = 'Cross' | 'Cut back'

type PreviewPlayer = PixiPitchPreviewProps['players'][number]

type CanonicalPlayer = Omit<PreviewPlayer, 'x' | 'y'> & {
  position: PitchPercentPoint
}

type CanonicalVisual = {
  id: string
  players: CanonicalPlayer[]
  ballPosition: PitchPercentPoint
  steps: PixiPitchPreviewStep[]
  routes: PixiPitchPreviewRoute[]
  caption: string
  tokenScale: number
  repeatDelay: number
}

export type AttackingOrganizationVisual = {
  id: string
  players: PixiPitchPreviewProps['players']
  ballPosition: PixiPitchPreviewProps['ballPosition']
  steps: PixiPitchPreviewStep[]
  routes: PixiPitchPreviewRoute[]
  caption: string
  tokenScale: number
  repeatDelay: number
}

export type AttackingOrganizationSkillId =
  | 'scanning'
  | 'body-shape'
  | 'receiving-on-the-move'
  | 'overlap-timing'
  | 'cross-cut-back'

export type AttackingOrganizationSkillOption = {
  id: AttackingOrganizationSkillId
  label: string
}

export const ATTACKING_ORGANIZATION_PAGE_BODY =
  'In Attacking Organization, the 1-4-4-2 builds from Zone 2 through Zone 3 into Zone 4. Use each focus to see the structure, the wide-channel idea, the coordinated actions, and the execution details as different teaching pictures.'

export const ATTACKING_ORGANIZATION_TAB_COPY: Record<
  AttackingOrganizationTab,
  { headline: string; note: string; chips: string[] }
> = {
  System: {
    headline: '1-4-4-2 units progress together',
    note: 'The back line, midfield line, and front line stay connected as the ball advances. The opponent shifts and drops while all 22 players remain visible.',
    chips: ['Back line', 'Midfield line', 'Front line', 'Unit spacing'],
  },
  Strategy: {
    headline: 'Build through the wide channel',
    note: 'One clear idea: move from Zone 2 through Zone 3, release #2 around #7, and enter Zone 4 before the defending block can reset.',
    chips: ['Zone 2 start', 'Zone 3 wide progression', 'Zone 4 entry'],
  },
  Tactics: {
    headline: 'Coordinate the actions and timing',
    note: '#4/#5 support the switch, #10 creates the wall pass, #2 overlaps at the right moment, and #7/#9/#11 coordinate their box runs.',
    chips: ['Midfield combination', '#2 overlap', '#10 wall pass', 'Three box runs'],
  },
  'Skill Set': {
    headline: 'Teach the execution details',
    note: 'Choose one skill at a time. Each example isolates a match action so players can see the scan, receiving shape, movement, timing, or delivery decision clearly.',
    chips: ['Observe', 'Rehearse', 'Recognize', 'Execute'],
  },
}

export const ATTACKING_ORGANIZATION_SKILL_OPTIONS: AttackingOrganizationSkillOption[] = [
  { id: 'scanning', label: 'Scanning before receiving' },
  { id: 'body-shape', label: 'Body shape to receive forward' },
  { id: 'receiving-on-the-move', label: 'Receiving on the move' },
  { id: 'overlap-timing', label: 'Timing of overlap' },
  { id: 'cross-cut-back', label: 'Cross / Cut back' },
]

export const ATTACKING_ORGANIZATION_DEFAULT_SKILL_ID: AttackingOrganizationSkillId = 'scanning'
export const ATTACKING_ORGANIZATION_DEFAULT_SERVICE: AttackingOrganizationService = 'Cross'

function player(
  id: string,
  number: number,
  x: number,
  y: number,
  options: Pick<CanonicalPlayer, 'tone' | 'side' | 'facingAngle'> = {},
): CanonicalPlayer {
  return {
    id,
    label: String(number),
    position: { x, y },
    ...options,
  }
}

function fullTeams(overrides: Partial<Record<string, PitchPercentPoint>> = {}): CanonicalPlayer[] {
  const home: CanonicalPlayer[] = [
    player('home-1', 1, 50, 8, { tone: 'keeper', facingAngle: 0 }),
    player('home-2', 2, 84, 25),
    player('home-3', 3, 16, 25),
    player('home-4', 4, 40, 22),
    player('home-5', 5, 60, 22),
    player('home-6', 6, 36, 44),
    player('home-8', 8, 62, 44),
    player('home-11', 11, 17, 57),
    player('home-7', 7, 83, 57),
    player('home-10', 10, 42, 64),
    player('home-9', 9, 58, 64),
  ]
  const away: CanonicalPlayer[] = [
    player('away-1', 1, 50, 94, { tone: 'keeper', side: 'away', facingAngle: 180 }),
    player('away-2', 2, 78, 76, { tone: 'opponent', side: 'away' }),
    player('away-3', 3, 22, 76, { tone: 'opponent', side: 'away' }),
    player('away-4', 4, 40, 78, { tone: 'opponent', side: 'away' }),
    player('away-5', 5, 60, 78, { tone: 'opponent', side: 'away' }),
    player('away-6', 6, 36, 64, { tone: 'opponent', side: 'away' }),
    player('away-8', 8, 62, 64, { tone: 'opponent', side: 'away' }),
    player('away-11', 11, 20, 58, { tone: 'opponent', side: 'away' }),
    player('away-7', 7, 80, 58, { tone: 'opponent', side: 'away' }),
    player('away-10', 10, 48, 56, { tone: 'opponent', side: 'away' }),
    player('away-9', 9, 52, 46, { tone: 'opponent', side: 'away' }),
  ]

  return [...home, ...away].map((item) => ({
    ...item,
    position: overrides[item.id] ?? item.position,
  }))
}

function skillTeams(
  overrides: Partial<Record<string, PitchPercentPoint>>,
  facingAngles: Partial<Record<string, number>> = {},
): CanonicalPlayer[] {
  return fullTeams(overrides).map((item) => ({
    ...item,
    facingAngle: facingAngles[item.id] ?? item.facingAngle,
  }))
}

function toPreviewStep(step: PixiPitchPreviewStep): PixiPitchPreviewStep {
  return {
    ...step,
    playerTo: step.playerTo ? pitchPercentToPreviewPoint(step.playerTo) : undefined,
    playerMoves: step.playerMoves?.map((move) => ({
      ...move,
      to: pitchPercentToPreviewPoint(move.to),
    })),
    ballFrom: step.ballFrom ? pitchPercentToPreviewPoint(step.ballFrom) : undefined,
    ballTo: step.ballTo ? pitchPercentToPreviewPoint(step.ballTo) : undefined,
  }
}

function toPreviewVisual(visual: CanonicalVisual): AttackingOrganizationVisual {
  return {
    ...visual,
    players: visual.players.map(({ position, ...item }) => ({
      ...item,
      ...pitchPercentToPreviewPoint(position),
    })),
    ballPosition: pitchPercentToPreviewPoint(visual.ballPosition),
    steps: visual.steps.map(toPreviewStep),
    routes: visual.routes.map((route) => ({
      ...route,
      from: pitchPercentToPreviewPoint(route.from),
      to: pitchPercentToPreviewPoint(route.to),
    })),
  }
}

const SYSTEM_VISUAL = toPreviewVisual({
  id: 'system-unit-progression',
  players: fullTeams(),
  ballPosition: { x: 50, y: 8 },
  steps: [
    { id: 'system-shape', cue: '#2 is visible on the right of three connected 1-4-4-2 lines', emphasizePlayerId: 'home-2', duration: 0.38 },
    {
      id: 'system-first-line',
      cue: 'GK starts play; the back line opens and the opponent shifts left',
      ballFrom: { x: 50, y: 8 },
      ballTo: { x: 16, y: 25 },
      playerMoves: [
        { playerId: 'home-2', to: { x: 86, y: 32 } },
        { playerId: 'home-4', to: { x: 40, y: 30 } },
        { playerId: 'home-5', to: { x: 60, y: 30 } },
        { playerId: 'away-9', to: { x: 42, y: 43 } },
        { playerId: 'away-10', to: { x: 40, y: 54 } },
      ],
      duration: 0.64,
    },
    {
      id: 'system-midfield-line',
      cue: '#3 combines inside as the midfield and front lines advance together',
      ballFrom: { x: 16, y: 25 },
      ballTo: { x: 40, y: 30 },
      playerMoves: [
        { playerId: 'home-6', to: { x: 38, y: 51 } },
        { playerId: 'home-8', to: { x: 64, y: 51 } },
        { playerId: 'home-7', to: { x: 86, y: 64 } },
        { playerId: 'home-11', to: { x: 16, y: 64 } },
        { playerId: 'home-10', to: { x: 44, y: 69 } },
        { playerId: 'home-9', to: { x: 58, y: 69 } },
        { playerId: 'away-11', to: { x: 24, y: 62 } },
        { playerId: 'away-6', to: { x: 40, y: 67 } },
      ],
      duration: 0.62,
    },
    {
      id: 'system-switch-wide',
      cue: 'The connected block switches to #2 and moves as one unit',
      ballFrom: { x: 40, y: 30 },
      ballTo: { x: 86, y: 32 },
      playerMoves: [
        { playerId: 'home-3', to: { x: 18, y: 40 } },
        { playerId: 'home-4', to: { x: 44, y: 43 } },
        { playerId: 'home-5', to: { x: 62, y: 42 } },
        { playerId: 'away-7', to: { x: 76, y: 64 } },
        { playerId: 'away-2', to: { x: 74, y: 80 } },
        { playerId: 'away-4', to: { x: 43, y: 81 } },
        { playerId: 'away-5', to: { x: 59, y: 81 } },
      ],
      duration: 0.66,
    },
    {
      id: 'system-progress-wide',
      cue: '#2 progresses; support stays underneath and the opponent drops',
      ballFrom: { x: 86, y: 32 },
      ballTo: { x: 86, y: 58 },
      playerId: 'home-2',
      playerTo: { x: 86, y: 58 },
      playerMoves: [
        { playerId: 'home-8', to: { x: 66, y: 60 } },
        { playerId: 'home-5', to: { x: 62, y: 49 } },
        { playerId: 'away-7', to: { x: 80, y: 68 } },
        { playerId: 'away-3', to: { x: 26, y: 82 } },
        { playerId: 'away-6', to: { x: 44, y: 70 } },
        { playerId: 'away-8', to: { x: 62, y: 70 } },
        { playerId: 'away-11', to: { x: 28, y: 66 } },
        { playerId: 'away-10', to: { x: 50, y: 62 } },
      ],
      duration: 0.62,
    },
    {
      id: 'system-enter-zone-four',
      cue: '#2 finds #10; both attacking lines arrive around the box',
      ballFrom: { x: 86, y: 58 },
      ballTo: { x: 58, y: 72 },
      playerMoves: [
        { playerId: 'home-2', to: { x: 90, y: 78 } },
        { playerId: 'home-10', to: { x: 58, y: 72 } },
        { playerId: 'home-7', to: { x: 68, y: 83 } },
        { playerId: 'home-11', to: { x: 34, y: 82 } },
        { playerId: 'home-9', to: { x: 52, y: 86 } },
        { playerId: 'away-2', to: { x: 70, y: 84 } },
        { playerId: 'away-3', to: { x: 30, y: 84 } },
        { playerId: 'away-4', to: { x: 42, y: 85 } },
        { playerId: 'away-5', to: { x: 58, y: 85 } },
        { playerId: 'away-6', to: { x: 44, y: 78 } },
        { playerId: 'away-8', to: { x: 60, y: 78 } },
        { playerId: 'away-1', to: { x: 50, y: 96 } },
      ],
      duration: 0.66,
    },
    {
      id: 'system-service',
      cue: 'The whole structure supports #2 serving #9 in Zone 4',
      ballFrom: { x: 58, y: 72 },
      ballTo: { x: 90, y: 78 },
      playerMoves: [
        { playerId: 'away-7', to: { x: 82, y: 77 } },
        { playerId: 'away-2', to: { x: 76, y: 87 } },
        { playerId: 'away-5', to: { x: 57, y: 87 } },
      ],
      duration: 0.5,
    },
    {
      id: 'system-finish',
      cue: '#2 crosses and #9 finishes the unit move',
      ballFrom: { x: 90, y: 78 },
      ballTo: { x: 52, y: 86 },
      playerMoves: [
        { playerId: 'away-4', to: { x: 43, y: 88 } },
        { playerId: 'away-5', to: { x: 58, y: 88 } },
        { playerId: 'away-3', to: { x: 32, y: 87 } },
      ],
      duration: 0.56,
    },
    {
      id: 'system-goal',
      cue: 'Goal: all three lines remain connected behind the finish',
      ballFrom: { x: 52, y: 86 },
      ballTo: { x: 50, y: 100 },
      playerId: 'home-9',
      playerTo: { x: 52, y: 90 },
      playerMoves: [{ playerId: 'away-1', to: { x: 47, y: 97 } }],
      duration: 0.42,
    },
  ],
  routes: [
    { id: 'system-gk-three', from: { x: 50, y: 8 }, to: { x: 16, y: 25 }, type: 'pass', revealOnStepId: 'system-first-line' },
    { id: 'system-three-four', from: { x: 16, y: 25 }, to: { x: 40, y: 30 }, type: 'pass', revealOnStepId: 'system-midfield-line' },
    { id: 'system-four-two', from: { x: 40, y: 30 }, to: { x: 86, y: 32 }, type: 'pass', revealOnStepId: 'system-switch-wide' },
    { id: 'system-two-progress', from: { x: 86, y: 32 }, to: { x: 86, y: 58 }, type: 'dribble', revealOnStepId: 'system-progress-wide' },
    { id: 'system-two-overlap', from: { x: 86, y: 58 }, to: { x: 90, y: 78 }, type: 'run', revealOnStepId: 'system-enter-zone-four' },
    { id: 'system-cross', from: { x: 90, y: 78 }, to: { x: 52, y: 86 }, type: 'pass', revealOnStepId: 'system-finish' },
    { id: 'system-shot', from: { x: 52, y: 86 }, to: { x: 50, y: 100 }, type: 'pass', revealOnStepId: 'system-goal' },
  ],
  caption: 'SYSTEM — all 22 players show how the back line, midfield line, and front line progress together in the 1-4-4-2 before #9 finishes.',
  tokenScale: 0.72,
  repeatDelay: 1.3,
})

const STRATEGY_VISUAL = toPreviewVisual({
  id: 'strategy-wide-channel-pattern',
  players: fullTeams({
    'home-2': { x: 86, y: 32 },
    'home-3': { x: 16, y: 28 },
    'home-4': { x: 40, y: 31 },
    'home-7': { x: 84, y: 58 },
    'home-10': { x: 58, y: 66 },
    'home-9': { x: 52, y: 75 },
  }),
  ballPosition: { x: 50, y: 8 },
  steps: [
    { id: 'strategy-message', cue: 'Strategy: build from Zone 2 through the right wide channel', emphasizePlayerId: 'home-2', duration: 0.3 },
    { id: 'strategy-gk-three', cue: 'GK starts the pattern into #3', ballFrom: { x: 50, y: 8 }, ballTo: { x: 16, y: 28 }, playerMoves: [{ playerId: 'away-9', to: { x: 42, y: 44 } }, { playerId: 'away-10', to: { x: 42, y: 54 } }, { playerId: 'away-11', to: { x: 22, y: 57 } }], duration: 0.58 },
    { id: 'strategy-three-four', cue: '#3 combines with #4 to invite the press', ballFrom: { x: 16, y: 28 }, ballTo: { x: 40, y: 31 }, playerMoves: [{ playerId: 'away-11', to: { x: 22, y: 60 } }, { playerId: 'away-10', to: { x: 43, y: 56 } }, { playerId: 'away-6', to: { x: 40, y: 65 } }, { playerId: 'away-7', to: { x: 77, y: 60 } }], duration: 0.54 },
    { id: 'strategy-find-two', cue: '#4 finds #2 in the open wide channel', ballFrom: { x: 40, y: 31 }, ballTo: { x: 86, y: 32 }, playerMoves: [{ playerId: 'away-7', to: { x: 78, y: 62 } }, { playerId: 'away-2', to: { x: 76, y: 79 } }, { playerId: 'away-6', to: { x: 44, y: 67 } }, { playerId: 'away-8', to: { x: 64, y: 67 } }], duration: 0.62 },
    { id: 'strategy-two-progress', cue: '#2 carries from Zone 2 into Zone 3', ballFrom: { x: 86, y: 32 }, ballTo: { x: 86, y: 55 }, playerId: 'home-2', playerTo: { x: 86, y: 55 }, playerMoves: [{ playerId: 'away-2', to: { x: 74, y: 80 } }, { playerId: 'away-7', to: { x: 80, y: 67 } }, { playerId: 'away-5', to: { x: 59, y: 81 } }, { playerId: 'away-8', to: { x: 62, y: 70 } }], duration: 0.58 },
    { id: 'strategy-two-ten', cue: '#2 connects #10 and runs beyond #7', ballFrom: { x: 86, y: 55 }, ballTo: { x: 58, y: 66 }, playerMoves: [{ playerId: 'home-2', to: { x: 91, y: 79 } }, { playerId: 'home-7', to: { x: 75, y: 70 } }, { playerId: 'away-7', to: { x: 79, y: 70 } }, { playerId: 'away-2', to: { x: 76, y: 83 } }, { playerId: 'away-6', to: { x: 46, y: 72 } }, { playerId: 'away-8', to: { x: 61, y: 73 } }], duration: 0.64 },
    { id: 'strategy-return-two', cue: '#10 returns the ball to the overlapping #2 in Zone 4', ballFrom: { x: 58, y: 66 }, ballTo: { x: 91, y: 79 }, playerMoves: [{ playerId: 'away-2', to: { x: 78, y: 85 } }, { playerId: 'away-3', to: { x: 28, y: 83 } }, { playerId: 'away-4', to: { x: 42, y: 84 } }, { playerId: 'away-5', to: { x: 58, y: 84 } }, { playerId: 'away-6', to: { x: 46, y: 77 } }], duration: 0.62 },
    { id: 'strategy-cross', cue: '#2 serves as #7, #11, and #9 coordinate their runs', ballFrom: { x: 91, y: 79 }, ballTo: { x: 52, y: 88 }, playerMoves: [{ playerId: 'home-7', to: { x: 68, y: 86 } }, { playerId: 'home-11', to: { x: 34, y: 84 } }, { playerId: 'home-9', to: { x: 52, y: 88 } }, { playerId: 'away-2', to: { x: 72, y: 86 } }, { playerId: 'away-3', to: { x: 30, y: 86 } }, { playerId: 'away-4', to: { x: 43, y: 87 } }, { playerId: 'away-5', to: { x: 58, y: 87 } }, { playerId: 'away-1', to: { x: 50, y: 96 } }], duration: 0.62 },
    { id: 'strategy-goal', cue: '#9 finishes the wide-channel strategy: goal', ballFrom: { x: 52, y: 88 }, ballTo: { x: 50, y: 100 }, playerId: 'home-9', playerTo: { x: 52, y: 91 }, playerMoves: [{ playerId: 'away-1', to: { x: 48, y: 96 } }], duration: 0.42 },
  ],
  routes: [
    { id: 'strategy-gk-three-route', from: { x: 50, y: 8 }, to: { x: 16, y: 28 }, type: 'pass', revealOnStepId: 'strategy-gk-three' },
    { id: 'strategy-three-four-route', from: { x: 16, y: 28 }, to: { x: 40, y: 31 }, type: 'pass', revealOnStepId: 'strategy-three-four' },
    { id: 'strategy-switch-route', from: { x: 40, y: 31 }, to: { x: 86, y: 32 }, type: 'pass', revealOnStepId: 'strategy-find-two' },
    { id: 'strategy-progress-route', from: { x: 86, y: 32 }, to: { x: 86, y: 55 }, type: 'dribble', revealOnStepId: 'strategy-two-progress' },
    { id: 'strategy-link-route', from: { x: 86, y: 55 }, to: { x: 58, y: 66 }, type: 'pass', revealOnStepId: 'strategy-two-ten' },
    { id: 'strategy-overlap-route', from: { x: 86, y: 55 }, to: { x: 91, y: 79 }, type: 'run', revealOnStepId: 'strategy-two-ten' },
    { id: 'strategy-return-route', from: { x: 58, y: 66 }, to: { x: 91, y: 79 }, type: 'pass', revealOnStepId: 'strategy-return-two' },
    { id: 'strategy-cross-route', from: { x: 91, y: 79 }, to: { x: 52, y: 88 }, type: 'pass', revealOnStepId: 'strategy-cross' },
    { id: 'strategy-goal-route', from: { x: 52, y: 88 }, to: { x: 50, y: 100 }, type: 'pass', revealOnStepId: 'strategy-goal' },
  ],
  caption: 'STRATEGY — one clear wide-channel route: GK → #3 → #4 → #2 → #10 → overlapping #2 → box service → #9 goal.',
  tokenScale: 0.72,
  repeatDelay: 1.25,
})

const TACTICS_VISUAL = toPreviewVisual({
  id: 'tactics-overlap-support-timing',
  players: fullTeams({
    'home-2': { x: 84, y: 43 },
    'home-3': { x: 18, y: 32 },
    'home-4': { x: 40, y: 38 },
    'home-5': { x: 58, y: 38 },
    'home-7': { x: 82, y: 62 },
    'home-8': { x: 62, y: 55 },
    'home-10': { x: 64, y: 66 },
    'home-9': { x: 52, y: 76 },
    'home-11': { x: 24, y: 70 },
    'away-7': { x: 76, y: 60 },
    'away-2': { x: 73, y: 76 },
  }),
  ballPosition: { x: 18, y: 32 },
  steps: [
    { id: 'tactics-picture', cue: '#2 is the release point; the planned support and run arrows are already visible', emphasizePlayerId: 'home-2', duration: 0.4 },
    { id: 'tactics-combination', cue: 'Tactic 1: #3 finds #4 while #5 gives the supporting angle', ballFrom: { x: 18, y: 32 }, ballTo: { x: 40, y: 38 }, playerMoves: [{ playerId: 'home-5', to: { x: 57, y: 44 } }, { playerId: 'away-9', to: { x: 44, y: 45 } }, { playerId: 'away-10', to: { x: 47, y: 54 } }, { playerId: 'away-11', to: { x: 24, y: 62 } }], duration: 0.54 },
    { id: 'tactics-support-pass', cue: 'Tactic 2: #4 uses #5 to move the pressure and open #2', ballFrom: { x: 40, y: 38 }, ballTo: { x: 57, y: 44 }, playerMoves: [{ playerId: 'home-4', to: { x: 47, y: 48 } }, { playerId: 'away-10', to: { x: 52, y: 55 } }, { playerId: 'away-6', to: { x: 42, y: 67 } }, { playerId: 'away-8', to: { x: 63, y: 66 } }], duration: 0.52 },
    { id: 'tactics-find-two', cue: 'Tactic 3: #5 releases #2 as #8 protects underneath', ballFrom: { x: 57, y: 44 }, ballTo: { x: 84, y: 43 }, playerMoves: [{ playerId: 'home-8', to: { x: 65, y: 58 } }, { playerId: 'away-7', to: { x: 79, y: 62 } }, { playerId: 'away-2', to: { x: 75, y: 79 } }, { playerId: 'away-5', to: { x: 59, y: 81 } }], duration: 0.56 },
    { id: 'tactics-wall-pass', cue: 'Tactic 4: #2 finds #10; #7 checks inside to clear the lane', ballFrom: { x: 84, y: 43 }, ballTo: { x: 64, y: 66 }, playerMoves: [{ playerId: 'home-7', to: { x: 72, y: 68 } }, { playerId: 'away-7', to: { x: 73, y: 68 } }, { playerId: 'away-2', to: { x: 76, y: 80 } }, { playerId: 'away-6', to: { x: 46, y: 73 } }, { playerId: 'away-8', to: { x: 61, y: 73 } }], duration: 0.58 },
    { id: 'tactics-overlap', cue: 'Tactic 5: #2 overlaps only after #10 secures the ball', playerId: 'home-2', playerTo: { x: 91, y: 80 }, playerMoves: [{ playerId: 'home-4', to: { x: 50, y: 58 } }, { playerId: 'home-5', to: { x: 62, y: 56 } }], duration: 0.62 },
    { id: 'tactics-return', cue: 'Tactic 6: #10 releases #2 beyond the defender in Zone 4', ballFrom: { x: 64, y: 66 }, ballTo: { x: 91, y: 80 }, playerMoves: [{ playerId: 'away-2', to: { x: 79, y: 84 } }, { playerId: 'away-3', to: { x: 29, y: 83 } }, { playerId: 'away-4', to: { x: 43, y: 84 } }, { playerId: 'away-5', to: { x: 59, y: 84 } }, { playerId: 'away-6', to: { x: 47, y: 78 } }], duration: 0.56 },
    { id: 'tactics-box-runs', cue: 'Tactic 7: #7 near, #9 central, #11 far — three different runs', ballFrom: { x: 91, y: 80 }, ballTo: { x: 52, y: 89 }, playerMoves: [{ playerId: 'home-7', to: { x: 67, y: 87 } }, { playerId: 'home-9', to: { x: 52, y: 89 } }, { playerId: 'home-11', to: { x: 34, y: 86 } }, { playerId: 'away-2', to: { x: 75, y: 87 } }, { playerId: 'away-3', to: { x: 30, y: 87 } }, { playerId: 'away-4', to: { x: 42, y: 86 } }, { playerId: 'away-5', to: { x: 58, y: 86 } }, { playerId: 'away-1', to: { x: 50, y: 96 } }], duration: 0.64 },
    { id: 'tactics-goal', cue: 'Goal: #9 finishes the coordinated tactical action', ballFrom: { x: 52, y: 89 }, ballTo: { x: 50, y: 100 }, playerId: 'home-9', playerTo: { x: 52, y: 92 }, playerMoves: [{ playerId: 'away-1', to: { x: 47, y: 97 } }], duration: 0.42 },
  ],
  routes: [
    { id: 'tactics-three-four-route', from: { x: 18, y: 32 }, to: { x: 40, y: 38 }, type: 'pass', revealOnStepId: 'tactics-combination' },
    { id: 'tactics-four-five-route', from: { x: 40, y: 38 }, to: { x: 57, y: 44 }, type: 'pass', revealOnStepId: 'tactics-support-pass' },
    { id: 'tactics-four-support-route', from: { x: 40, y: 38 }, to: { x: 47, y: 48 }, type: 'recovery' },
    { id: 'tactics-five-two-route', from: { x: 57, y: 44 }, to: { x: 84, y: 43 }, type: 'pass', revealOnStepId: 'tactics-find-two' },
    { id: 'tactics-two-ten-route', from: { x: 84, y: 43 }, to: { x: 64, y: 66 }, type: 'pass', revealOnStepId: 'tactics-wall-pass' },
    { id: 'tactics-seven-clear-route', from: { x: 82, y: 62 }, to: { x: 72, y: 68 }, type: 'run' },
    { id: 'tactics-overlap-route', from: { x: 84, y: 43 }, to: { x: 91, y: 80 }, type: 'run' },
    { id: 'tactics-return-route', from: { x: 64, y: 66 }, to: { x: 91, y: 80 }, type: 'pass', revealOnStepId: 'tactics-return' },
    { id: 'tactics-seven-run-route', from: { x: 72, y: 68 }, to: { x: 67, y: 87 }, type: 'run' },
    { id: 'tactics-nine-run-route', from: { x: 52, y: 76 }, to: { x: 52, y: 89 }, type: 'run' },
    { id: 'tactics-eleven-run-route', from: { x: 24, y: 70 }, to: { x: 34, y: 86 }, type: 'run' },
    { id: 'tactics-service-route', from: { x: 91, y: 80 }, to: { x: 52, y: 89 }, type: 'pass', revealOnStepId: 'tactics-box-runs' },
    { id: 'tactics-shot-route', from: { x: 52, y: 89 }, to: { x: 50, y: 100 }, type: 'pass', revealOnStepId: 'tactics-goal' },
  ],
  caption: 'TACTICS — the detailed support triangle, #10 wall pass, timed #2 overlap, and three coordinated box runs that execute the strategy.',
  tokenScale: 0.72,
  repeatDelay: 1.35,
})

function skillVisual(visual: CanonicalVisual): AttackingOrganizationVisual {
  return toPreviewVisual(visual)
}

const SCANNING_VISUAL = skillVisual({
  id: 'skill-scanning',
  players: skillTeams({
    'home-4': { x: 42, y: 32 },
    'home-8': { x: 60, y: 49 },
    'home-2': { x: 86, y: 63 },
    'home-6': { x: 39, y: 58 },
    'home-7': { x: 87, y: 72 },
    'away-9': { x: 48, y: 39 },
    'away-10': { x: 55, y: 51 },
    'away-6': { x: 65, y: 58 },
  }, { 'home-8': 0 }),
  ballPosition: { x: 42, y: 32 },
  steps: [
    { id: 'scan-source', cue: '#8 rotates in place and points the arms toward #4, the source of the pass', emphasizePlayerId: 'home-8', emphasisCue: 'SCAN 1 — SEE THE BALL SOURCE', playerId: 'home-8', facingAngle: -132, duration: 0.62 },
    { id: 'scan-option', cue: 'Before the ball moves, #8 rotates the arms toward #2 and pictures the next pass', emphasizePlayerId: 'home-8', emphasisCue: 'SCAN 2 — SEE THE NEXT ACTION', playerId: 'home-8', facingAngle: 65, duration: 0.68 },
    { id: 'scan-set-to-receive', cue: '#8 reopens toward #4 so the incoming ball arrives in front, not behind', playerId: 'home-8', facingAngle: -132, duration: 0.54 },
    { id: 'scan-receive', cue: '#4 now passes and #8 receives while facing the direction the ball comes from', ballFrom: { x: 42, y: 32 }, ballTo: { x: 60, y: 49 }, playerMoves: [{ playerId: 'away-10', to: { x: 54, y: 54 } }, { playerId: 'away-6', to: { x: 63, y: 60 } }], duration: 0.68 },
    { id: 'scan-turn-to-option', cue: 'With the ball secured, #8 turns the arms and body toward the pictured pass to #2', playerId: 'home-8', facingAngle: 65, duration: 0.62 },
    { id: 'scan-play', cue: '#8 completes the realistic scan, receive, turn, and release into #2', ballFrom: { x: 60, y: 49 }, ballTo: { x: 86, y: 63 }, duration: 0.6 },
  ],
  routes: [
    { id: 'scan-pass-in', from: { x: 42, y: 32 }, to: { x: 60, y: 49 }, type: 'pass', revealOnStepId: 'scan-receive' },
    { id: 'scan-pass-out', from: { x: 60, y: 49 }, to: { x: 86, y: 63 }, type: 'pass', revealOnStepId: 'scan-play' },
  ],
  caption: 'SCANNING — midfield #8 scans #4 and #2, reopens to receive the incoming ball in front, then turns in possession toward #2 and releases the pass.',
  tokenScale: 0.72,
  repeatDelay: 1.5,
})

const BODY_SHAPE_VISUAL = skillVisual({
  id: 'skill-body-shape',
  players: skillTeams({
    'home-3': { x: 20, y: 36 },
    'home-6': { x: 42, y: 52 },
    'home-2': { x: 84, y: 67 },
    'home-8': { x: 61, y: 58 },
    'home-10': { x: 55, y: 72 },
    'away-9': { x: 43, y: 41 },
    'away-6': { x: 48, y: 61 },
  }, { 'home-6': -90 }),
  ballPosition: { x: 20, y: 36 },
  steps: [
    { id: 'body-side-on', cue: '#6 starts side-on between #3 and the forward field', emphasizePlayerId: 'home-6', emphasisCue: 'SIDE-ON — OPEN HIPS AND ARMS', playerId: 'home-6', facingAngle: -90, duration: 0.56 },
    { id: 'body-receive-forward', cue: '#6 receives from #3 and rotates the arms and body forward through the first touch', ballFrom: { x: 20, y: 36 }, ballTo: { x: 44, y: 56 }, playerId: 'home-6', playerTo: { x: 44, y: 56 }, facingAngle: 0, playerMoves: [{ playerId: 'away-9', to: { x: 45, y: 45 } }, { playerId: 'away-6', to: { x: 47, y: 63 } }], duration: 0.78 },
    { id: 'body-play-two', cue: '#6 is now facing forward and opens the arms toward the pass into #2', ballFrom: { x: 44, y: 56 }, ballTo: { x: 84, y: 67 }, playerId: 'home-6', playerTo: { x: 47, y: 59 }, facingAngle: 70, duration: 0.66 },
  ],
  routes: [
    { id: 'body-pass-in', from: { x: 20, y: 36 }, to: { x: 44, y: 56 }, type: 'pass', revealOnStepId: 'body-receive-forward' },
    { id: 'body-forward-touch', from: { x: 42, y: 52 }, to: { x: 44, y: 56 }, type: 'dribble', revealOnStepId: 'body-receive-forward' },
    { id: 'body-pass-forward', from: { x: 44, y: 56 }, to: { x: 84, y: 67 }, type: 'pass', revealOnStepId: 'body-play-two' },
  ],
  caption: 'BODY SHAPE — midfield #6 begins side-on, then the arms and body visibly rotate forward as the ball arrives from #3 before #6 plays #2.',
  tokenScale: 0.72,
  repeatDelay: 1.5,
})

const RECEIVING_ON_MOVE_VISUAL = skillVisual({
  id: 'skill-receiving-on-the-move',
  players: skillTeams({
    'home-5': { x: 50, y: 38 },
    'home-2': { x: 78, y: 50 },
    'home-7': { x: 84, y: 70 },
    'home-10': { x: 58, y: 70 },
    'away-7': { x: 70, y: 58 },
    'away-2': { x: 76, y: 78 },
  }, { 'home-2': 25 }),
  ballPosition: { x: 50, y: 38 },
  steps: [
    { id: 'move-before-pass', cue: '#2 starts side-on, arms open for balance, then moves as the lane opens', emphasizePlayerId: 'home-2', duration: 0.46 },
    { id: 'receive-in-stride', cue: '#2 turns while receiving in stride — first touch carries forward', ballFrom: { x: 50, y: 38 }, ballTo: { x: 84, y: 61 }, playerId: 'home-2', playerTo: { x: 84, y: 61 }, playerMoves: [{ playerId: 'away-7', to: { x: 77, y: 63 } }, { playerId: 'away-2', to: { x: 78, y: 80 } }], duration: 0.7 },
    { id: 'continue-action', cue: 'The turn continues into Zone 3 before the defender can set', ballFrom: { x: 84, y: 61 }, ballTo: { x: 88, y: 72 }, playerId: 'home-2', playerTo: { x: 88, y: 72 }, duration: 0.54 },
  ],
  routes: [
    { id: 'receive-moving-pass', from: { x: 50, y: 38 }, to: { x: 84, y: 61 }, type: 'pass', revealOnStepId: 'receive-in-stride' },
    { id: 'receive-moving-run', from: { x: 78, y: 50 }, to: { x: 84, y: 61 }, type: 'run', revealOnStepId: 'receive-in-stride' },
    { id: 'receive-next-action', from: { x: 84, y: 61 }, to: { x: 88, y: 72 }, type: 'dribble', revealOnStepId: 'continue-action' },
  ],
  caption: 'RECEIVING ON THE MOVE — in the full 11v11 context, #2’s shoulders and arms turn with the run as the first touch carries into Zone 3.',
  tokenScale: 0.72,
  repeatDelay: 1.5,
})

const OVERLAP_TIMING_VISUAL = skillVisual({
  id: 'skill-overlap-timing',
  players: skillTeams({
    'home-2': { x: 84, y: 30 },
    'home-8': { x: 62, y: 48 },
    'home-7': { x: 80, y: 66 },
    'home-9': { x: 54, y: 70 },
    'home-11': { x: 26, y: 69 },
    'home-10': { x: 48, y: 61 },
    'away-7': { x: 77, y: 61 },
    'away-2': { x: 78, y: 76 },
  }, { 'home-2': -51, 'home-8': 129, 'home-7': -135 }),
  ballPosition: { x: 84, y: 30 },
  steps: [
    { id: 'overlap-picture', cue: '#2 starts on the back line with the ball; #7, #9, and #11 occupy the space between the lines', emphasizePlayerId: 'home-2', emphasisCue: 'PASS · MOVE · PLAY THROUGH · OVERLAP', duration: 0.5 },
    { id: 'overlap-two-eight', cue: '#2 begins the pattern by connecting inside with #8', ballFrom: { x: 84, y: 30 }, ballTo: { x: 62, y: 48 }, playerMoves: [{ playerId: 'away-9', to: { x: 49, y: 43 } }, { playerId: 'away-10', to: { x: 53, y: 55 } }], duration: 0.58 },
    { id: 'overlap-two-advance', cue: 'Immediately after passing, #2 advances up the outside lane', playerId: 'home-2', playerTo: { x: 84, y: 50 }, facingAngle: 0, playerMoves: [{ playerId: 'away-7', to: { x: 79, y: 64 } }], duration: 0.62 },
    { id: 'overlap-eight-seven', cue: '#8 plays #7 as #7 moves into the pocket between midfield and defence', ballFrom: { x: 62, y: 48 }, ballTo: { x: 76, y: 72 }, playerId: 'home-7', playerTo: { x: 76, y: 72 }, facingAngle: -135, playerMoves: [{ playerId: 'home-9', to: { x: 54, y: 74 } }, { playerId: 'home-11', to: { x: 27, y: 73 } }, { playerId: 'away-6', to: { x: 42, y: 68 } }, { playerId: 'away-8', to: { x: 62, y: 68 } }], duration: 0.68 },
    { id: 'overlap-go', cue: '#2 times the overlap behind and outside #7, accelerating deep into Channel 4', playerId: 'home-2', playerTo: { x: 92, y: 86 }, facingAngle: 15, playerMoves: [{ playerId: 'away-7', to: { x: 75, y: 70 } }, { playerId: 'away-2', to: { x: 82, y: 82 } }, { playerId: 'away-5', to: { x: 60, y: 82 } }], duration: 0.78 },
    { id: 'overlap-release', cue: '#7 releases only after #2 gets beyond, completing the pass-and-move pattern in Zone 4', ballFrom: { x: 76, y: 72 }, ballTo: { x: 92, y: 86 }, playerId: 'home-7', facingAngle: 49, playerMoves: [{ playerId: 'away-2', to: { x: 84, y: 85 } }, { playerId: 'away-4', to: { x: 43, y: 84 } }, { playerId: 'away-5', to: { x: 59, y: 84 } }], duration: 0.62 },
  ],
  routes: [
    { id: 'overlap-two-eight-pass', from: { x: 84, y: 30 }, to: { x: 62, y: 48 }, type: 'pass', revealOnStepId: 'overlap-two-eight' },
    { id: 'overlap-two-first-move', from: { x: 84, y: 30 }, to: { x: 84, y: 50 }, type: 'run', revealOnStepId: 'overlap-two-advance' },
    { id: 'overlap-eight-seven-pass', from: { x: 62, y: 48 }, to: { x: 76, y: 72 }, type: 'pass', revealOnStepId: 'overlap-eight-seven' },
    { id: 'overlap-seven-pocket-run', from: { x: 80, y: 66 }, to: { x: 76, y: 72 }, type: 'run', revealOnStepId: 'overlap-eight-seven' },
    { id: 'overlap-timed-run', from: { x: 84, y: 50 }, to: { x: 92, y: 86 }, type: 'run', revealOnStepId: 'overlap-go' },
    { id: 'overlap-release-pass', from: { x: 76, y: 72 }, to: { x: 92, y: 86 }, type: 'pass', revealOnStepId: 'overlap-release' },
  ],
  caption: 'OVERLAP TIMING — #2 starts on the back line and plays #8, advances, then overlaps behind #7 only after #8 finds #7 between the lines; #7 releases #2 deep in Channel 4.',
  tokenScale: 0.72,
  repeatDelay: 1.55,
})

const CROSS_VISUAL = skillVisual({
  id: 'skill-cross',
  players: skillTeams({
    'home-2': { x: 82, y: 55 },
    'home-7': { x: 80, y: 68 },
    'home-9': { x: 52, y: 82 },
    'home-11': { x: 18, y: 76 },
    'away-2': { x: 74, y: 78 },
    'away-4': { x: 42, y: 84 },
    'away-5': { x: 60, y: 84 },
    'away-1': { x: 50, y: 95 },
  }),
  ballPosition: { x: 80, y: 68 },
  steps: [
    { id: 'cross-overlap', cue: 'CROSS build-up: #7 releases #2 outside toward the Zone 4 byline', ballFrom: { x: 80, y: 68 }, ballTo: { x: 92, y: 88 }, playerId: 'home-2', playerTo: { x: 92, y: 88 }, playerMoves: [{ playerId: 'away-2', to: { x: 82, y: 84 } }], duration: 0.68 },
    { id: 'cross-delivery', cue: '#2 crosses toward #11 arriving from the wide weak side', ballFrom: { x: 92, y: 88 }, ballTo: { x: 35, y: 91 }, playerMoves: [{ playerId: 'home-11', to: { x: 35, y: 91 } }, { playerId: 'home-9', to: { x: 52, y: 90 } }, { playerId: 'home-7', to: { x: 67, y: 88 } }, { playerId: 'away-2', to: { x: 76, y: 87 } }, { playerId: 'away-3', to: { x: 30, y: 88 } }, { playerId: 'away-4', to: { x: 43, y: 89 } }], duration: 0.66 },
    { id: 'cross-contact', cue: '#11 finishes after attacking the far-post gap from a wider start', emphasizePlayerId: 'home-11', duration: 0.4 },
    { id: 'cross-goal', cue: 'Goal: #11 directs the far-post finish beyond the goalkeeper', ballFrom: { x: 35, y: 91 }, ballTo: { x: 50, y: 100 }, playerId: 'home-11', playerTo: { x: 38, y: 94 }, playerMoves: [{ playerId: 'away-1', to: { x: 47, y: 97 } }], duration: 0.44 },
  ],
  routes: [
    { id: 'cross-build-route', from: { x: 80, y: 68 }, to: { x: 92, y: 88 }, type: 'pass', revealOnStepId: 'cross-overlap' },
    { id: 'cross-delivery-route', from: { x: 92, y: 88 }, to: { x: 35, y: 91 }, type: 'pass', revealOnStepId: 'cross-delivery' },
    { id: 'cross-eleven-run', from: { x: 18, y: 76 }, to: { x: 35, y: 91 }, type: 'run', revealOnStepId: 'cross-delivery' },
    { id: 'cross-nine-run', from: { x: 52, y: 82 }, to: { x: 52, y: 90 }, type: 'run', revealOnStepId: 'cross-delivery' },
    { id: 'cross-shot', from: { x: 35, y: 91 }, to: { x: 50, y: 100 }, type: 'pass', revealOnStepId: 'cross-goal' },
  ],
  caption: 'CROSS — #7 releases #2 outside, then #11 attacks the far-post gap from a deliberately wider weak-side start and finishes the service into goal.',
  tokenScale: 0.72,
  repeatDelay: 1.5,
})

const CUT_BACK_VISUAL = skillVisual({
  id: 'skill-cut-back',
  players: skillTeams({
    'home-2': { x: 92, y: 78 },
    'home-7': { x: 68, y: 80 },
    'home-9': { x: 51, y: 81 },
    'home-11': { x: 34, y: 80 },
    'home-8': { x: 46, y: 75 },
    'home-10': { x: 61, y: 75 },
    'away-2': { x: 76, y: 84 },
    'away-3': { x: 24, y: 84 },
    'away-4': { x: 42, y: 86 },
    'away-5': { x: 59, y: 86 },
    'away-6': { x: 42, y: 68 },
    'away-8': { x: 60, y: 68 },
    'away-1': { x: 50, y: 95 },
  }),
  ballPosition: { x: 92, y: 78 },
  steps: [
    { id: 'cutback-drive', cue: 'CUT BACK: #2 is isolated outside and drives alone into the corner grid', ballFrom: { x: 92, y: 78 }, ballTo: { x: 93, y: 91 }, playerId: 'home-2', playerTo: { x: 93, y: 91 }, playerMoves: [{ playerId: 'away-2', to: { x: 82, y: 88 } }], duration: 0.66 },
    { id: 'cutback-runs', cue: '#7, #9, #11 attack the three back-line gaps; #8/#10 hold the pocket', playerMoves: [{ playerId: 'home-7', to: { x: 68, y: 90 } }, { playerId: 'home-9', to: { x: 51, y: 92 } }, { playerId: 'home-11', to: { x: 35, y: 90 } }, { playerId: 'home-8', to: { x: 48, y: 79 } }, { playerId: 'home-10', to: { x: 62, y: 79 } }, { playerId: 'away-3', to: { x: 28, y: 88 } }, { playerId: 'away-4', to: { x: 43, y: 89 } }, { playerId: 'away-5', to: { x: 59, y: 89 } }], duration: 0.6 },
    { id: 'cutback-delivery', cue: '#2 cuts sharply backward to #8 arriving behind the three forward runs', ballFrom: { x: 93, y: 91 }, ballTo: { x: 48, y: 79 }, duration: 0.62 },
    { id: 'cutback-contact', cue: '#8 receives between the lines with #10 supporting the second action', emphasizePlayerId: 'home-8', duration: 0.34 },
    { id: 'cutback-goal', cue: 'Goal: #8 finishes the cut back while the three forward runs pin the back line', ballFrom: { x: 48, y: 79 }, ballTo: { x: 50, y: 100 }, playerId: 'home-8', playerTo: { x: 49, y: 82 }, playerMoves: [{ playerId: 'away-1', to: { x: 47, y: 97 } }], duration: 0.44 },
  ],
  routes: [
    { id: 'cutback-two-drive', from: { x: 92, y: 78 }, to: { x: 93, y: 91 }, type: 'dribble', revealOnStepId: 'cutback-drive' },
    { id: 'cutback-seven-run', from: { x: 68, y: 80 }, to: { x: 68, y: 90 }, type: 'run', revealOnStepId: 'cutback-runs' },
    { id: 'cutback-nine-run', from: { x: 51, y: 81 }, to: { x: 51, y: 92 }, type: 'run', revealOnStepId: 'cutback-runs' },
    { id: 'cutback-eleven-run', from: { x: 34, y: 80 }, to: { x: 35, y: 90 }, type: 'run', revealOnStepId: 'cutback-runs' },
    { id: 'cutback-eight-support', from: { x: 46, y: 75 }, to: { x: 48, y: 79 }, type: 'recovery', revealOnStepId: 'cutback-runs' },
    { id: 'cutback-ten-support', from: { x: 61, y: 75 }, to: { x: 62, y: 79 }, type: 'recovery', revealOnStepId: 'cutback-runs' },
    { id: 'cutback-delivery-route', from: { x: 93, y: 91 }, to: { x: 48, y: 79 }, type: 'pass', revealOnStepId: 'cutback-delivery' },
    { id: 'cutback-shot', from: { x: 48, y: 79 }, to: { x: 50, y: 100 }, type: 'pass', revealOnStepId: 'cutback-goal' },
  ],
  caption: 'CUT BACK — #2 is isolated outside; #7/#9/#11 pin the three back-line gaps, then #8 arrives from the pocket to finish the backward pass into goal.',
  tokenScale: 0.72,
  repeatDelay: 1.5,
})

export const ATTACKING_ORGANIZATION_STATE_VISUALS: Record<
  AttackingOrganizationMainTab,
  AttackingOrganizationVisual
> = {
  System: SYSTEM_VISUAL,
  Strategy: STRATEGY_VISUAL,
  Tactics: TACTICS_VISUAL,
}

export const ATTACKING_ORGANIZATION_SKILL_VISUALS: Record<
  Exclude<AttackingOrganizationSkillId, 'cross-cut-back'>,
  AttackingOrganizationVisual
> = {
  scanning: SCANNING_VISUAL,
  'body-shape': BODY_SHAPE_VISUAL,
  'receiving-on-the-move': RECEIVING_ON_MOVE_VISUAL,
  'overlap-timing': OVERLAP_TIMING_VISUAL,
}

export const ATTACKING_ORGANIZATION_SERVICE_VISUALS: Record<
  AttackingOrganizationService,
  AttackingOrganizationVisual
> = {
  Cross: CROSS_VISUAL,
  'Cut back': CUT_BACK_VISUAL,
}

export function getAttackingOrganizationVisual(
  tab: AttackingOrganizationTab,
  skillId: AttackingOrganizationSkillId,
  service: AttackingOrganizationService,
): AttackingOrganizationVisual {
  if (tab !== 'Skill Set') {
    return ATTACKING_ORGANIZATION_STATE_VISUALS[tab]
  }

  if (skillId === 'cross-cut-back') {
    return ATTACKING_ORGANIZATION_SERVICE_VISUALS[service]
  }

  return ATTACKING_ORGANIZATION_SKILL_VISUALS[skillId]
}

export function getGameAnalysisReplayKey(
  tab: AttackingOrganizationTab,
  visualId: string,
  replayRevision: number,
): string {
  return `${tab}:${visualId}:${replayRevision}`
}

export function isCurrentGameAnalysisReplay(
  activeReplayKey: string,
  cueSourceReplayKey: string,
): boolean {
  return activeReplayKey === cueSourceReplayKey
}
