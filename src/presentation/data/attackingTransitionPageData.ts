import type { PixiPitchPreviewProps, PixiPitchPreviewRoute, PixiPitchPreviewStep } from '../../renderers/pixi/PixiPitchPreview'
import { FORMATION_POSITIONS, OPPOSITION_POSITIONS } from '../../data/formations'

type PreviewPlayer = PixiPitchPreviewProps['players'][number]
type PitchPoint = { x: number; y: number }
type FormationPositionMap = Record<number, PitchPoint>

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

const HOME_ATTACKING_433 = FORMATION_POSITIONS['attacking-433']
const AWAY_ATTACKING_433 = OPPOSITION_POSITIONS['attacking-433']
const HOME_DEFENSIVE_4231 = FORMATION_POSITIONS['defensive-4231']
const AWAY_DEFENSIVE_4231 = OPPOSITION_POSITIONS['defensive-4231']
const AWAY_ATTACKING_442 = OPPOSITION_POSITIONS['attacking-442']

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

    players.push({
      id: `home-${number}`,
      label: String(number),
      x: start.x,
      y: start.y,
      tone: number === 1 ? 'keeper' : undefined,
    })
  }

  for (let number = 1; number <= 11; number += 1) {
    const start = awayPositions[number]

    players.push({
      id: `away-${number}`,
      label: String(number),
      x: start.x,
      y: start.y,
      tone: number === 1 ? 'keeper' : 'opponent',
    })
  }

  return players
}

function makeRoutes(routes: PixiPitchPreviewRoute[]) {
  return routes
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
  6: { x: 50, y: 67 },
  8: { x: 43, y: 74 },
  10: { x: 51, y: 58 },
  11: { x: 25, y: 42 },
  7: { x: 75, y: 42 },
  9: { x: 50, y: 27 },
})

const zone2Away = applyOverrides(AWAY_ATTACKING_433, {
  2: { x: 61, y: 62 },
  3: { x: 39, y: 62 },
  4: { x: 35, y: 70 },
  5: { x: 65, y: 70 },
  6: { x: 50, y: 58 },
  7: { x: 74, y: 44 },
  8: { x: 42, y: 49 },
  9: { x: 50, y: 38 },
  10: { x: 57, y: 47 },
  11: { x: 26, y: 44 },
})

const zone3Home = applyOverrides(HOME_ATTACKING_433, {
  6: { x: 52, y: 56 },
  8: { x: 44, y: 60 },
  10: { x: 56, y: 52 },
  11: { x: 22, y: 34 },
  7: { x: 78, y: 34 },
  9: { x: 52, y: 22 },
})

const zone3Away = applyOverrides(AWAY_ATTACKING_433, {
  2: { x: 62, y: 58 },
  3: { x: 38, y: 58 },
  4: { x: 35, y: 70 },
  5: { x: 65, y: 70 },
  6: { x: 50, y: 64 },
  7: { x: 74, y: 48 },
  8: { x: 42, y: 52 },
  9: { x: 50, y: 40 },
  10: { x: 58, y: 50 },
  11: { x: 26, y: 48 },
})

const zone4Home = applyOverrides(HOME_ATTACKING_433, {
  6: { x: 50, y: 74 },
  8: { x: 46, y: 78 },
  10: { x: 52, y: 84 },
  11: { x: 26, y: 84 },
  7: { x: 74, y: 84 },
  9: { x: 50, y: 90 },
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
    ],
    duration: 0.54,
  },
]

const zone1Routes = makeRoutes([
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
])

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
    ballFrom: { x: 50, y: 67 },
    ballTo: { x: 51, y: 58 },
    playerId: 'home-10',
    playerTo: { x: 51, y: 58 },
    playerMoves: [
      { playerId: 'home-7', to: { x: 79, y: 40 } },
      { playerId: 'home-11', to: { x: 21, y: 40 } },
      { playerId: 'home-9', to: { x: 50, y: 27 } },
      { playerId: 'home-8', to: { x: 44, y: 63 } },
    ],
    duration: 0.66,
  },
  {
    id: 'zone-2-target',
    cue: '#9 stays central as the target',
    ballFrom: { x: 51, y: 58 },
    ballTo: { x: 50, y: 27 },
    playerId: 'home-9',
    playerTo: { x: 50, y: 27 },
    duration: 0.58,
  },
  {
    id: 'zone-2-shape',
    cue: 'Rest-defence stays behind the attack',
    emphasizePlayerId: 'home-4',
    duration: 0.34,
  },
]

const zone2Routes = makeRoutes([
  {
    id: 'zone-2-regain-pass',
    from: { x: 50, y: 67 },
    to: { x: 51, y: 58 },
    type: 'pass',
    revealOnStepId: 'zone-2-link',
  },
  {
    id: 'zone-2-left-run',
    from: { x: 25, y: 42 },
    to: { x: 21, y: 40 },
    type: 'run',
    revealOnStepId: 'zone-2-link',
  },
  {
    id: 'zone-2-right-run',
    from: { x: 75, y: 42 },
    to: { x: 79, y: 40 },
    type: 'run',
    revealOnStepId: 'zone-2-link',
  },
  {
    id: 'zone-2-finish-pass',
    from: { x: 51, y: 58 },
    to: { x: 50, y: 27 },
    type: 'pass',
    revealOnStepId: 'zone-2-target',
  },
  {
    id: 'zone-2-support-run',
    from: { x: 44, y: 63 },
    to: { x: 44, y: 63 },
    type: 'recovery',
    revealOnStepId: 'zone-2-shape',
  },
])

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
    ballTo: { x: 78, y: 34 },
    playerId: 'home-7',
    playerTo: { x: 78, y: 34 },
    playerMoves: [
      { playerId: 'home-11', to: { x: 22, y: 34 } },
      { playerId: 'home-9', to: { x: 52, y: 22 } },
      { playerId: 'home-10', to: { x: 56, y: 50 } },
    ],
    duration: 0.62,
  },
  {
    id: 'zone-3-link',
    cue: '#10 supports underneath the next action',
    ballFrom: { x: 78, y: 34 },
    ballTo: { x: 56, y: 50 },
    playerId: 'home-10',
    playerTo: { x: 56, y: 50 },
    duration: 0.52,
  },
  {
    id: 'zone-3-finish',
    cue: '#9 pins centrally for the finish',
    ballFrom: { x: 56, y: 50 },
    ballTo: { x: 52, y: 22 },
    playerId: 'home-9',
    playerTo: { x: 52, y: 22 },
    duration: 0.5,
  },
]

const zone3Routes = makeRoutes([
  {
    id: 'zone-3-channel-run',
    from: { x: 75, y: 42 },
    to: { x: 78, y: 34 },
    type: 'run',
    revealOnStepId: 'zone-3-channel',
  },
  {
    id: 'zone-3-support-run',
    from: { x: 56, y: 58 },
    to: { x: 56, y: 50 },
    type: 'recovery',
    revealOnStepId: 'zone-3-link',
  },
  {
    id: 'zone-3-finish-pass',
    from: { x: 56, y: 50 },
    to: { x: 52, y: 22 },
    type: 'pass',
    revealOnStepId: 'zone-3-finish',
  },
])

const zone4Steps: PixiPitchPreviewStep[] = [
  {
    id: 'zone-4-win',
    cue: 'Ball won near goal: the chance is immediate',
    emphasizePlayerId: 'home-10',
    duration: 0.22,
  },
  {
    id: 'zone-4-cutback',
    cue: 'Use the nearest pass, cutback, or slip',
    ballFrom: { x: 52, y: 90 },
    ballTo: { x: 50, y: 84 },
    playerId: 'home-10',
    playerTo: { x: 50, y: 84 },
    playerMoves: [
      { playerId: 'home-9', to: { x: 50, y: 90 } },
      { playerId: 'home-7', to: { x: 76, y: 84 } },
      { playerId: 'home-11', to: { x: 24, y: 84 } },
    ],
    duration: 0.56,
  },
  {
    id: 'zone-4-finish',
    cue: '#9 or #10 finish quickly',
    ballFrom: { x: 50, y: 84 },
    ballTo: { x: 50, y: 96 },
    playerId: 'home-9',
    playerTo: { x: 50, y: 96 },
    duration: 0.42,
  },
]

const zone4Routes = makeRoutes([
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
])

export const ATTACKING_TRANSITION_PAGE_CASES: AttackingTransitionPageCase[] = [
  {
    id: 'zone-1',
    tabLabel: 'Zone 1 regain',
    zoneFocus: 'Zone 1 regain',
    cue: zone1Steps[0].cue,
    caption:
      'Win it deep, secure the ball, and escape pressure with #10 or a wide outlet before resetting into shape.',
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
    ballPosition: { x: 50, y: 22 },
    steps: zone1Steps,
    routes: zone1Routes,
    repeatDelay: 1.25,
    tokenScale: 0.76,
  },
  {
    id: 'zone-2',
    tabLabel: 'Zone 2 regain',
    zoneFocus: 'Zone 2 regain',
    cue: zone2Steps[0].cue,
    caption:
      'This is the main model: win it in midfield, link the first pass through #10, trigger the wide runners, and keep #9 central as the target.',
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
    ballPosition: { x: 50, y: 67 },
    steps: zone2Steps,
    routes: zone2Routes,
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
      'A higher regain lets us go immediately: one wide runner attacks the channel, #10 supports underneath, and #9 pins the centre-back.',
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
    ballPosition: { x: 52, y: 58 },
    steps: zone3Steps,
    routes: zone3Routes,
    repeatDelay: 1.15,
    tokenScale: 0.8,
  },
  {
    id: 'zone-4',
    tabLabel: 'Zone 4 regain',
    zoneFocus: 'Zone 4 regain',
    cue: zone4Steps[0].cue,
    caption:
      'The chance is already there: use the nearest pass, cutback, or slip, and let #9 and #10 decide the final action quickly.',
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
    ballPosition: { x: 52, y: 90 },
    steps: zone4Steps,
    routes: zone4Routes,
    repeatDelay: 1.1,
    tokenScale: 0.74,
  },
]

export const ATTACKING_TRANSITION_PAGE_DEFAULT_CASE_ID: AttackingTransitionPageCase['id'] = 'zone-2'
