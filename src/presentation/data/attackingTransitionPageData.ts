import type { PixiPitchPreviewProps, PixiPitchPreviewRoute, PixiPitchPreviewStep } from '../../renderers/pixi/PixiPitchPreview'
import { FORMATION_POSITIONS, OPPOSITION_POSITIONS } from '../../data/formations.ts'
import {
  formationMetresToPitchPercentPositions,
  pitchPercentToPreviewPoint,
  type TransitionPositionMap,
} from './transitionPreviewCoordinates.ts'

type PreviewPlayer = PixiPitchPreviewProps['players'][number]
type PitchPoint = { x: number; y: number }
type FormationPositionMap = TransitionPositionMap

export type AttackingTransitionPageCase = {
  id: 'zone-1' | 'zone-2' | 'zone-3' | 'zone-4'
  tabLabel: string
  zoneFocus: string
  cue: string
  caption: string
  system: {
    shape: string
    description: string
  }
  strategy: string
  tactics: string[]
  skillSet: string[]
  principles: string[]
  players: PreviewPlayer[]
  ballPosition: PitchPoint
  steps: PixiPitchPreviewStep[]
  routes: PixiPitchPreviewRoute[]
  repeatDelay: number
  tokenScale: number
  liveBoardScenarioId?: string
}

const HOME_ATTACKING_433 = formationMetresToPitchPercentPositions(FORMATION_POSITIONS['attacking-433'])
const AWAY_ATTACKING_433 = formationMetresToPitchPercentPositions(OPPOSITION_POSITIONS['attacking-433'])
const HOME_DEFENSIVE_4231 = formationMetresToPitchPercentPositions(FORMATION_POSITIONS['defensive-4231'])
const AWAY_DEFENSIVE_4231 = formationMetresToPitchPercentPositions(OPPOSITION_POSITIONS['defensive-4231'])
const AWAY_ATTACKING_442 = formationMetresToPitchPercentPositions(OPPOSITION_POSITIONS['attacking-442'])

function applyOverrides(
  base: FormationPositionMap,
  overrides: Partial<Record<number, PitchPoint>> = {},
) : FormationPositionMap {
  const next: FormationPositionMap = { ...base }

  for (let number = 1; number <= 11; number += 1) {
    next[number] = overrides[number] ?? base[number]
  }

  return next
}

function buildPlayers(homePositions: FormationPositionMap, awayPositions: FormationPositionMap): PreviewPlayer[] {
  const players: PreviewPlayer[] = []

  for (let number = 1; number <= 11; number += 1) {
    const start = homePositions[number]
    const previewStart = pitchPercentToPreviewPoint(start)

    players.push({
      id: `home-${number}`,
      label: String(number),
      x: previewStart.x,
      y: previewStart.y,
      tone: number === 1 ? 'keeper' : undefined,
      facingAngle: number === 1 ? 0 : undefined,
    })
  }

  for (let number = 1; number <= 11; number += 1) {
    const start = awayPositions[number]
    const previewStart = pitchPercentToPreviewPoint(start)

    players.push({
      id: `away-${number}`,
      label: String(number),
      x: previewStart.x,
      y: previewStart.y,
      tone: number === 1 ? 'keeper' : 'opponent',
      side: 'away',
      facingAngle: number === 1 ? 180 : undefined,
    })
  }

  return players
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

function toPreviewRoute(route: PixiPitchPreviewRoute): PixiPitchPreviewRoute {
  return {
    ...route,
    from: pitchPercentToPreviewPoint(route.from),
    to: pitchPercentToPreviewPoint(route.to),
  }
}

const zone1Home = applyOverrides(HOME_DEFENSIVE_4231, {
  6: { x: 44, y: 30 },
  8: { x: 56, y: 31 },
  10: { x: 48, y: 22 },
  11: { x: 18, y: 34 },
  7: { x: 82, y: 34 },
  9: { x: 50, y: 43 },
})

const zone1Away = applyOverrides(AWAY_DEFENSIVE_4231, {
  2: { x: 55, y: 42 },
  3: { x: 15, y: 42 },
  4: { x: 36, y: 38 },
  5: { x: 64, y: 38 },
  6: { x: 50, y: 27 },
  7: { x: 77, y: 46 },
  8: { x: 61, y: 44 },
  9: { x: 50, y: 22 },
  10: { x: 39, y: 44 },
  11: { x: 23, y: 46 },
})

const zone2Home = applyOverrides(HOME_ATTACKING_433, {
  6: { x: 50, y: 47 },
  8: { x: 43, y: 52 },
  10: { x: 51, y: 57 },
  11: { x: 25, y: 61 },
  7: { x: 75, y: 61 },
  9: { x: 50, y: 68 },
})

const zone2Away = applyOverrides(AWAY_ATTACKING_433, {
  2: { x: 61, y: 68 },
  3: { x: 39, y: 68 },
  4: { x: 35, y: 72 },
  5: { x: 65, y: 72 },
  6: { x: 45, y: 61 },
  7: { x: 74, y: 55 },
  8: { x: 42, y: 58 },
  9: { x: 50, y: 48 },
  10: { x: 57, y: 56 },
  11: { x: 26, y: 55 },
})

const zone3Home = applyOverrides(HOME_ATTACKING_433, {
  6: { x: 52, y: 56 },
  8: { x: 44, y: 60 },
  10: { x: 56, y: 62 },
  11: { x: 22, y: 66 },
  7: { x: 78, y: 68 },
  9: { x: 52, y: 69 },
})

const zone3Away = applyOverrides(AWAY_ATTACKING_433, {
  2: { x: 62, y: 72 },
  3: { x: 38, y: 72 },
  4: { x: 35, y: 74 },
  5: { x: 65, y: 74 },
  6: { x: 50, y: 66 },
  7: { x: 74, y: 58 },
  8: { x: 42, y: 62 },
  9: { x: 50, y: 52 },
  10: { x: 58, y: 60 },
  11: { x: 26, y: 58 },
})

const zone4Home = applyOverrides(HOME_ATTACKING_433, {
  6: { x: 50, y: 74 },
  8: { x: 46, y: 78 },
  10: { x: 48, y: 82 },
  11: { x: 26, y: 84 },
  7: { x: 74, y: 84 },
  9: { x: 50, y: 72 },
})

const zone4Away = applyOverrides(AWAY_ATTACKING_442, {
  2: { x: 61, y: 86 },
  3: { x: 39, y: 86 },
  4: { x: 34, y: 82 },
  5: { x: 49, y: 82 },
  6: { x: 50, y: 74 },
  7: { x: 66, y: 72 },
  8: { x: 56, y: 76 },
  9: { x: 50, y: 52 },
  10: { x: 44, y: 76 },
  11: { x: 34, y: 76 },
})

const zone1Steps: PixiPitchPreviewStep[] = [
  {
    id: 'zone-1-secure',
    cue: 'Win it deep and secure the first touch',
    emphasizePlayerId: 'home-6',
    duration: 0.28,
  },
  {
    id: 'zone-1-escape',
    cue: 'Find #10 or the wide outlet',
    ballFrom: { x: 50, y: 22 },
    ballTo: { x: 51, y: 32 },
    playerId: 'home-10',
    playerTo: { x: 51, y: 32 },
    playerMoves: [
      { playerId: 'home-7', to: { x: 82, y: 36 } },
      { playerId: 'home-11', to: { x: 18, y: 36 } },
      { playerId: 'home-9', to: { x: 50, y: 42 } },
      { playerId: 'away-6', to: { x: 49, y: 25 } },
      { playerId: 'away-10', to: { x: 45, y: 35 } },
    ],
    duration: 0.62,
  },
  {
    id: 'zone-1-reset',
    cue: 'If the counter closes, reset and protect the ball',
    ballFrom: { x: 51, y: 32 },
    ballTo: { x: 43, y: 36 },
    playerId: 'home-8',
    playerTo: { x: 43, y: 36 },
    playerMoves: [
      { playerId: 'home-6', to: { x: 46, y: 32 } },
      { playerId: 'home-4', to: { x: 30, y: 39 } },
      { playerId: 'home-5', to: { x: 57, y: 39 } },
      { playerId: 'away-4', to: { x: 39, y: 36 } },
      { playerId: 'away-5', to: { x: 61, y: 36 } },
    ],
    duration: 0.54,
  },
]

const zone1Routes: PixiPitchPreviewRoute[] = [
  {
    id: 'zone-1-outlet',
    from: { x: 50, y: 22 },
    to: { x: 51, y: 32 },
    type: 'pass',
    revealOnStepId: 'zone-1-escape',
  },
  {
    id: 'zone-1-wide-run',
    from: { x: 75, y: 42 },
    to: { x: 82, y: 36 },
    type: 'run',
    revealOnStepId: 'zone-1-escape',
  },
  {
    id: 'zone-1-support-run',
    from: { x: 43, y: 38 },
    to: { x: 43, y: 36 },
    type: 'recovery',
    revealOnStepId: 'zone-1-reset',
  },
  {
    id: 'zone-1-central-cover',
    from: { x: 39, y: 44 },
    to: { x: 45, y: 35 },
    type: 'recovery',
    revealOnStepId: 'zone-1-escape',
  },
]

const zone2Steps: PixiPitchPreviewStep[] = [
  {
    id: 'zone-2-regain',
    cue: 'Regain in midfield and look forward immediately',
    emphasizePlayerId: 'home-6',
    duration: 0.26,
  },
  {
    id: 'zone-2-link',
    cue: '#10 links the first pass',
    ballFrom: { x: 50, y: 47 },
    ballTo: { x: 51, y: 57 },
    playerId: 'home-10',
    playerTo: { x: 51, y: 58 },
    playerMoves: [
      { playerId: 'home-7', to: { x: 79, y: 67 } },
      { playerId: 'home-11', to: { x: 21, y: 67 } },
      { playerId: 'home-8', to: { x: 44, y: 55 } },
      { playerId: 'away-10', to: { x: 49, y: 59 } },
      { playerId: 'away-2', to: { x: 64, y: 70 } },
      { playerId: 'away-3', to: { x: 36, y: 70 } },
    ],
    duration: 0.66,
  },
  {
    id: 'zone-2-target',
    cue: '#9 checks onside as recovering defenders track the central target',
    ballFrom: { x: 51, y: 57 },
    ballTo: { x: 50, y: 66 },
    playerId: 'home-9',
    playerTo: { x: 50, y: 66 },
    playerMoves: [
      { playerId: 'away-5', to: { x: 55, y: 74 } },
      { playerId: 'away-4', to: { x: 43, y: 74 } },
      { playerId: 'away-1', to: { x: 50, y: 94 } },
    ],
    duration: 0.58,
  },
  {
    id: 'zone-2-shape',
    cue: 'Rest-defence stays behind the attack',
    emphasizePlayerId: 'home-4',
    duration: 0.34,
  },
]

const zone2Routes: PixiPitchPreviewRoute[] = [
  {
    id: 'zone-2-regain-pass',
    from: { x: 50, y: 47 },
    to: { x: 51, y: 57 },
    type: 'pass',
    revealOnStepId: 'zone-2-link',
  },
  {
    id: 'zone-2-left-run',
    from: { x: 25, y: 61 },
    to: { x: 21, y: 67 },
    type: 'run',
    revealOnStepId: 'zone-2-link',
  },
  {
    id: 'zone-2-right-run',
    from: { x: 75, y: 61 },
    to: { x: 79, y: 67 },
    type: 'run',
    revealOnStepId: 'zone-2-link',
  },
  {
    id: 'zone-2-finish-pass',
    from: { x: 51, y: 57 },
    to: { x: 50, y: 66 },
    type: 'pass',
    revealOnStepId: 'zone-2-target',
  },
  {
    id: 'zone-2-support-run',
    from: { x: 44, y: 55 },
    to: { x: 44, y: 55 },
    type: 'recovery',
    revealOnStepId: 'zone-2-shape',
  },
  {
    id: 'zone-2-counterpress',
    from: { x: 57, y: 56 },
    to: { x: 49, y: 59 },
    type: 'press',
    revealOnStepId: 'zone-2-link',
  },
  {
    id: 'zone-2-track-nine',
    from: { x: 65, y: 72 },
    to: { x: 55, y: 74 },
    type: 'recovery',
    revealOnStepId: 'zone-2-target',
  },
]

const zone3Steps: PixiPitchPreviewStep[] = [
  {
    id: 'zone-3-win',
    cue: 'Win it higher and attack before the opponent resets',
    emphasizePlayerId: 'home-8',
    duration: 0.24,
  },
  {
    id: 'zone-3-channel',
    cue: 'Wide runner attacks Channel 1 or 2',
    ballFrom: { x: 52, y: 58 },
    ballTo: { x: 78, y: 70 },
    playerId: 'home-7',
    playerTo: { x: 78, y: 70 },
    playerMoves: [
      { playerId: 'home-11', to: { x: 22, y: 69 } },
      { playerId: 'home-10', to: { x: 56, y: 64 } },
      { playerId: 'away-2', to: { x: 70, y: 75 } },
      { playerId: 'away-6', to: { x: 52, y: 68 } },
    ],
    duration: 0.62,
  },
  {
    id: 'zone-3-link',
    cue: '#10 supports underneath the next action',
    ballFrom: { x: 78, y: 70 },
    ballTo: { x: 56, y: 64 },
    playerId: 'home-10',
    playerTo: { x: 56, y: 64 },
    duration: 0.52,
  },
  {
    id: 'zone-3-finish',
    cue: '#9 pins centrally for the finish',
    ballFrom: { x: 56, y: 64 },
    ballTo: { x: 52, y: 73 },
    playerId: 'home-9',
    playerTo: { x: 52, y: 73 },
    playerMoves: [
      { playerId: 'away-4', to: { x: 40, y: 76 } },
      { playerId: 'away-5', to: { x: 60, y: 76 } },
      { playerId: 'away-1', to: { x: 50, y: 94 } },
    ],
    duration: 0.5,
  },
]

const zone3Routes: PixiPitchPreviewRoute[] = [
  {
    id: 'zone-3-channel-run',
    from: { x: 78, y: 68 },
    to: { x: 78, y: 70 },
    type: 'run',
    revealOnStepId: 'zone-3-channel',
  },
  {
    id: 'zone-3-support-run',
    from: { x: 56, y: 62 },
    to: { x: 56, y: 64 },
    type: 'recovery',
    revealOnStepId: 'zone-3-link',
  },
  {
    id: 'zone-3-finish-pass',
    from: { x: 56, y: 64 },
    to: { x: 52, y: 73 },
    type: 'pass',
    revealOnStepId: 'zone-3-finish',
  },
  {
    id: 'zone-3-wide-pressure',
    from: { x: 62, y: 72 },
    to: { x: 70, y: 75 },
    type: 'press',
    revealOnStepId: 'zone-3-channel',
  },
  {
    id: 'zone-3-track-nine',
    from: { x: 65, y: 74 },
    to: { x: 60, y: 76 },
    type: 'recovery',
    revealOnStepId: 'zone-3-finish',
  },
]

const zone4Steps: PixiPitchPreviewStep[] = [
  {
    id: 'zone-4-win',
    cue: 'Ball won near goal: the chance is immediate',
    emphasizePlayerId: 'home-10',
    duration: 0.22,
  },
  {
    id: 'zone-4-cutback',
    cue: 'Use the nearest cutback while the box recovers around the ball',
    ballFrom: { x: 52, y: 90 },
    ballTo: { x: 48, y: 82 },
    playerId: 'home-10',
    playerTo: { x: 48, y: 82 },
    playerMoves: [
      { playerId: 'home-9', to: { x: 50, y: 80 } },
      { playerId: 'home-7', to: { x: 76, y: 86 } },
      { playerId: 'home-11', to: { x: 24, y: 86 } },
      { playerId: 'away-6', to: { x: 50, y: 78 } },
      { playerId: 'away-4', to: { x: 40, y: 84 } },
      { playerId: 'away-5', to: { x: 56, y: 84 } },
    ],
    duration: 0.56,
  },
  {
    id: 'zone-4-finish',
    cue: '#9 arrives after the regain; finish before the box closes',
    ballFrom: { x: 48, y: 82 },
    ballTo: { x: 50, y: 84 },
    playerId: 'home-9',
    playerTo: { x: 50, y: 84 },
    playerMoves: [
      { playerId: 'away-2', to: { x: 60, y: 88 } },
      { playerId: 'away-3', to: { x: 40, y: 88 } },
      { playerId: 'away-1', to: { x: 50, y: 95 } },
    ],
    duration: 0.42,
  },
]

const zone4Routes: PixiPitchPreviewRoute[] = [
  {
    id: 'zone-4-cutback-pass',
    from: { x: 52, y: 90 },
    to: { x: 50, y: 84 },
    type: 'pass',
    revealOnStepId: 'zone-4-cutback',
  },
  {
    id: 'zone-4-run-back-post',
    from: { x: 74, y: 84 },
    to: { x: 76, y: 84 },
    type: 'run',
    revealOnStepId: 'zone-4-cutback',
  },
  {
    id: 'zone-4-finish-shot',
    from: { x: 50, y: 84 },
    to: { x: 50, y: 96 },
    type: 'pass',
    revealOnStepId: 'zone-4-finish',
  },
  {
    id: 'zone-4-cutback-screen',
    from: { x: 50, y: 74 },
    to: { x: 50, y: 78 },
    type: 'recovery',
    revealOnStepId: 'zone-4-cutback',
  },
  {
    id: 'zone-4-central-cover',
    from: { x: 49, y: 82 },
    to: { x: 56, y: 84 },
    type: 'recovery',
    revealOnStepId: 'zone-4-cutback',
  },
]

export const ATTACKING_TRANSITION_PAGE_CASES: AttackingTransitionPageCase[] = [
  {
    id: 'zone-1',
    tabLabel: 'Zone 1 regain',
    zoneFocus: 'Zone 1 regain',
    cue: zone1Steps[0].cue,
    caption:
      'Win it deep, secure the first touch against pressure, escape through #10 or a wide outlet, then reset before the central cover closes.',
    system: {
      shape: 'Low regain escape',
      description:
        'Pickering stays compact around the regain, with the first touch protected and the back line ready behind the ball.',
    },
    strategy:
      'If the counter is on, find #10 or the wide outlet. If it is closed, keep possession and protect the ball until the next pass is safe.',
    tactics: [
      '#6 or #8 secure the first touch',
      '#10 links the escape pass',
      '#7 and #11 stay available wide',
      '#9 provides depth ahead of the break',
      'Rest-defence stays connected behind the ball',
    ],
    skillSet: ['Shielding', 'Scanning', 'First pass under pressure', 'Support angle', 'Ball security'],
    principles: ['DENY', 'SUPPORT', 'DISPERSAL'],
    players: buildPlayers(zone1Home, zone1Away),
    ballPosition: pitchPercentToPreviewPoint({ x: 50, y: 22 }),
    steps: zone1Steps.map(toPreviewStep),
    routes: zone1Routes.map(toPreviewRoute),
    repeatDelay: 1.25,
    tokenScale: 0.76,
  },
  {
    id: 'zone-2',
    tabLabel: 'Zone 2 regain',
    zoneFocus: 'Zone 2 regain',
    cue: zone2Steps[0].cue,
    caption:
      'This is the main model: win it in midfield, beat the counter-press through #10, release the wide runners, and let #9 check onside as defenders recover.',
    system: {
      shape: 'Immediate counter shape',
      description:
        'Wide forwards run beyond the ball, #10 links the first forward pass, #9 stays central, and rest-defence sits behind the attack.',
    },
    strategy:
      'Secure the regain and break before the opponent can recover shape. The first forward look should be decisive, not cautious.',
    tactics: [
      'First look is forward',
      'Wide forwards trigger immediately',
      '#10 links the first pass',
      '#9 stays central as the target',
      'Rest-defence stays behind the attack',
    ],
    skillSet: ['First action after regain', 'Forward passing', 'Run timing', 'Body shape', 'Support underneath'],
    principles: ['DENY', 'SUPPORT', 'MOBILITY', 'PENETRATION'],
    players: buildPlayers(zone2Home, zone2Away),
    ballPosition: pitchPercentToPreviewPoint({ x: 50, y: 47 }),
    steps: zone2Steps.map(toPreviewStep),
    routes: zone2Routes.map(toPreviewRoute),
    repeatDelay: 1.2,
    tokenScale: 0.8,
    liveBoardScenarioId: 'counter-quickly-on-turnover',
  },
  {
    id: 'zone-3',
    tabLabel: 'Zone 3 regain',
    zoneFocus: 'Zone 3 regain',
    cue: zone3Steps[0].cue,
    caption:
      'A higher regain lets us go immediately: release the wide runner, draw the wide pressure, support through #10, and attack the recovering line with #9.',
    system: {
      shape: 'High regain counter',
      description:
        'The ball is won high enough that the team can attack the space right away, with width and central support arriving together.',
    },
    strategy:
      'Play into space before the opponent resets. The first pass should release the runner or connect #10 underneath the next action.',
    tactics: [
      'Wide runner attacks Channel 1 or 2',
      '#9 pins the central defender',
      '#10 supports underneath or between lines',
      'Back line stays connected behind the break',
    ],
    skillSet: ['Transition scanning', 'Run timing', 'Channel recognition', 'First-time support', 'Final pass'],
    principles: ['SUPPORT', 'MOBILITY', 'PENETRATION'],
    players: buildPlayers(zone3Home, zone3Away),
    ballPosition: pitchPercentToPreviewPoint({ x: 52, y: 58 }),
    steps: zone3Steps.map(toPreviewStep),
    routes: zone3Routes.map(toPreviewRoute),
    repeatDelay: 1.15,
    tokenScale: 0.8,
  },
  {
    id: 'zone-4',
    tabLabel: 'Zone 4 regain',
    zoneFocus: 'Zone 4 regain',
    cue: zone4Steps[0].cue,
    caption:
      'The chance is already there: use the nearest cutback before the box closes, with #9 arriving centrally and the goalkeeper setting for the final threat.',
    system: {
      shape: 'Final-third finish',
      description:
        'The regain lands close enough to goal that the next pass, shot, or cutback is the attack. The rest of the team supports the finish.',
    },
    strategy:
      'Finish immediately with the nearest high-value option. The ball should move once, then the chance should be on goal.',
    tactics: [
      '#9 and #10 stay connected for the final action',
      'Wide runner offers the back-post or cutback lane',
      'Nearest pass is taken before the block resets',
      'Enough opponent defenders remain visible to make the chance realistic',
    ],
    skillSet: ['Composure', 'Decision speed', 'Combination play', 'Cutback timing', 'Finishing'],
    principles: ['SUPPORT', 'PENETRATION', 'IMPROVISATION'],
    players: buildPlayers(zone4Home, zone4Away),
    ballPosition: pitchPercentToPreviewPoint({ x: 52, y: 90 }),
    steps: zone4Steps.map(toPreviewStep),
    routes: zone4Routes.map(toPreviewRoute),
    repeatDelay: 1.1,
    tokenScale: 0.74,
  },
]

export const ATTACKING_TRANSITION_PAGE_DEFAULT_CASE_ID: AttackingTransitionPageCase['id'] = 'zone-2'
