import type {
  PixiPitchPreviewProps,
  PixiPitchPreviewRoute,
  PixiPitchPreviewStep,
} from '../../renderers/pixi/PixiPitchPreview'
import { FORMATION_POSITIONS, OPPOSITION_POSITIONS } from '../../data/formations'

type PreviewPlayer = PixiPitchPreviewProps['players'][number]
type PitchPoint = { x: number; y: number }
type FormationPositionMap = Record<number, PitchPoint>

export type DefensiveTransitionPageCase = {
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

const HOME_DEFENSIVE_4231 = FORMATION_POSITIONS['defensive-4231']
const AWAY_DEFENSIVE_4231 = OPPOSITION_POSITIONS['defensive-4231']
const HOME_ATTACKING_433 = FORMATION_POSITIONS['attacking-433']
const AWAY_ATTACKING_433 = OPPOSITION_POSITIONS['attacking-433']

function applyOverrides(
  base: FormationPositionMap,
  overrides: Partial<Record<number, PitchPoint>> = {},
): FormationPositionMap {
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

const zone1Home = applyOverrides(HOME_DEFENSIVE_4231, {
  2: { x: 74, y: 22 },
  3: { x: 27, y: 22 },
  4: { x: 41, y: 18 },
  5: { x: 59, y: 18 },
  6: { x: 44, y: 29 },
  8: { x: 56, y: 29 },
  7: { x: 82, y: 38 },
  11: { x: 18, y: 38 },
})

const zone1Away = applyOverrides(AWAY_DEFENSIVE_4231, {
  7: { x: 78, y: 42 },
  8: { x: 60, y: 35 },
  9: { x: 50, y: 27 },
  10: { x: 50, y: 20 },
  11: { x: 22, y: 42 },
})

const zone2Home = applyOverrides(HOME_ATTACKING_433, {
  2: { x: 74, y: 38 },
  3: { x: 26, y: 38 },
  4: { x: 41, y: 32 },
  5: { x: 59, y: 32 },
  6: { x: 45, y: 46 },
  8: { x: 55, y: 49 },
  10: { x: 58, y: 57 },
  7: { x: 79, y: 65 },
  11: { x: 21, y: 65 },
  9: { x: 50, y: 76 },
})

const zone2Away = applyOverrides(AWAY_ATTACKING_433, {
  6: { x: 50, y: 48 },
  7: { x: 78, y: 56 },
  8: { x: 58, y: 44 },
  9: { x: 50, y: 35 },
  10: { x: 42, y: 47 },
  11: { x: 22, y: 56 },
})

// These key positions mirror the existing Zone 3 live-board scenario's
// authored arrows: #7 presses, #10 locks inside, and #6 covers behind.
const zone3Home = applyOverrides(HOME_ATTACKING_433, {
  2: { x: 58, y: 30 },
  4: { x: 26, y: 25 },
  5: { x: 42, y: 25 },
  6: { x: 34, y: 48 },
  8: { x: 46, y: 58 },
  10: { x: 43, y: 62 },
  11: { x: 13, y: 72 },
  7: { x: 59, y: 80 },
  9: { x: 34, y: 88 },
})

const zone3Away = applyOverrides(AWAY_ATTACKING_433, {
  2: { x: 58, y: 82 },
  6: { x: 34, y: 69 },
  7: { x: 55, y: 43 },
  9: { x: 34, y: 36 },
})

const zone4Home = applyOverrides(HOME_ATTACKING_433, {
  2: { x: 68, y: 58 },
  3: { x: 32, y: 58 },
  4: { x: 42, y: 52 },
  5: { x: 58, y: 52 },
  6: { x: 46, y: 66 },
  8: { x: 54, y: 69 },
  10: { x: 47, y: 81 },
  11: { x: 20, y: 84 },
  7: { x: 80, y: 84 },
  9: { x: 54, y: 89 },
})

const zone4Away = applyOverrides(AWAY_ATTACKING_433, {
  2: { x: 70, y: 74 },
  3: { x: 30, y: 74 },
  6: { x: 50, y: 72 },
  7: { x: 76, y: 82 },
  8: { x: 58, y: 79 },
  9: { x: 50, y: 88 },
  10: { x: 43, y: 82 },
  11: { x: 24, y: 82 },
})

const zone1Steps: PixiPitchPreviewStep[] = [
  { id: 'zone-1-loss', cue: 'Loss deep: protect the goal first', emphasizePlayerId: 'away-10', duration: 0.3 },
  {
    id: 'zone-1-delay',
    cue: 'Nearest player delays the ball carrier',
    playerId: 'home-3',
    playerTo: { x: 42, y: 21 },
    duration: 0.48,
  },
  {
    id: 'zone-1-central-cover',
    cue: '#6 and #8 close central Zone 1/2 spaces',
    playerMoves: [
      { playerId: 'home-6', to: { x: 46, y: 24 } },
      { playerId: 'home-8', to: { x: 54, y: 24 } },
    ],
    duration: 0.46,
  },
  {
    id: 'zone-1-wide-recovery',
    cue: 'Wide players recover inside-to-out',
    playerMoves: [
      { playerId: 'home-11', to: { x: 25, y: 31 } },
      { playerId: 'home-7', to: { x: 75, y: 31 } },
    ],
    duration: 0.42,
  },
  { id: 'zone-1-rest-defence', cue: 'Back line protects Zone 1', emphasizePlayerId: 'home-4', duration: 0.3 },
]

const zone2Steps: PixiPitchPreviewStep[] = [
  { id: 'zone-2-loss', cue: 'Ball lost while progressing in Zone 2', emphasizePlayerId: 'away-10', duration: 0.28 },
  {
    id: 'zone-2-press',
    cue: 'Nearest player attacks the first touch',
    playerId: 'home-10',
    playerTo: { x: 48, y: 47 },
    duration: 0.44,
  },
  {
    id: 'zone-2-cover',
    cue: 'Second player blocks the forward lane',
    playerId: 'home-8',
    playerTo: { x: 53, y: 44 },
    duration: 0.4,
  },
  {
    id: 'zone-2-central-protect',
    cue: '#6 protects Channel 3; #8 stays connected',
    playerMoves: [
      { playerId: 'home-6', to: { x: 46, y: 40 } },
      { playerId: 'home-7', to: { x: 70, y: 55 } },
      { playerId: 'home-11', to: { x: 30, y: 55 } },
    ],
    duration: 0.46,
  },
  { id: 'zone-2-rest-defence', cue: 'Back line stays connected to Zone 1', emphasizePlayerId: 'home-5', duration: 0.3 },
]

const zone3Steps: PixiPitchPreviewStep[] = [
  { id: 'zone-3-loss', cue: 'Ball lost: trigger the 5-second fuse', emphasizePlayerId: 'home-8', duration: 0.28 },
  {
    id: 'zone-3-press',
    cue: '#7 presses the first touch immediately',
    playerId: 'home-7',
    playerTo: { x: 54, y: 63 },
    duration: 0.44,
  },
  {
    id: 'zone-3-cover',
    cue: '#10 locks the forward escape lane',
    playerId: 'home-10',
    playerTo: { x: 49, y: 58 },
    duration: 0.4,
  },
  {
    id: 'zone-3-central-protect',
    cue: '#6 and #8 protect Channel 3',
    playerMoves: [
      { playerId: 'home-6', to: { x: 39, y: 52 } },
      { playerId: 'home-8', to: { x: 46, y: 54 } },
    ],
    duration: 0.44,
  },
  {
    id: 'zone-3-wide-recovery',
    cue: '#11 delays the wide outlet; rest-defence holds',
    playerId: 'home-11',
    playerTo: { x: 24, y: 62 },
    duration: 0.42,
  },
]

const zone4Steps: PixiPitchPreviewStep[] = [
  { id: 'zone-4-loss', cue: 'Loss near goal: press before the counter starts', emphasizePlayerId: 'away-9', duration: 0.26 },
  {
    id: 'zone-4-press',
    cue: '#9 presses the ball at source',
    playerId: 'home-9',
    playerTo: { x: 52, y: 86 },
    duration: 0.4,
  },
  {
    id: 'zone-4-cover',
    cue: '#10 closes the central exit',
    playerId: 'home-10',
    playerTo: { x: 48, y: 83 },
    duration: 0.38,
  },
  {
    id: 'zone-4-delay',
    cue: '#7 delays the wide outlet while #6/#8 secure',
    playerMoves: [
      { playerId: 'home-7', to: { x: 71, y: 79 } },
      { playerId: 'home-6', to: { x: 47, y: 61 } },
      { playerId: 'home-8', to: { x: 53, y: 63 } },
    ],
    duration: 0.46,
  },
  { id: 'zone-4-rest-defence', cue: 'If broken, recover into compact organization', emphasizePlayerId: 'home-4', duration: 0.32 },
]

const zone1Routes: PixiPitchPreviewRoute[] = [
  { id: 'zone-1-delay-route', from: { x: 27, y: 22 }, to: { x: 42, y: 21 }, type: 'press', revealOnStepId: 'zone-1-delay' },
  { id: 'zone-1-six-cover', from: { x: 44, y: 29 }, to: { x: 46, y: 24 }, type: 'recovery', revealOnStepId: 'zone-1-central-cover' },
  { id: 'zone-1-eight-cover', from: { x: 56, y: 29 }, to: { x: 54, y: 24 }, type: 'recovery', revealOnStepId: 'zone-1-central-cover' },
  { id: 'zone-1-wide-recover', from: { x: 18, y: 38 }, to: { x: 25, y: 31 }, type: 'recovery', revealOnStepId: 'zone-1-wide-recovery' },
]

const zone2Routes: PixiPitchPreviewRoute[] = [
  { id: 'zone-2-press-route', from: { x: 58, y: 57 }, to: { x: 48, y: 47 }, type: 'press', revealOnStepId: 'zone-2-press' },
  { id: 'zone-2-cover-route', from: { x: 55, y: 49 }, to: { x: 53, y: 44 }, type: 'recovery', revealOnStepId: 'zone-2-cover' },
  { id: 'zone-2-six-cover', from: { x: 45, y: 46 }, to: { x: 46, y: 40 }, type: 'recovery', revealOnStepId: 'zone-2-central-protect' },
  { id: 'zone-2-wide-recover', from: { x: 79, y: 65 }, to: { x: 70, y: 55 }, type: 'recovery', revealOnStepId: 'zone-2-central-protect' },
]

const zone3Routes: PixiPitchPreviewRoute[] = [
  { id: 'zone-3-press-route', from: { x: 59, y: 80 }, to: { x: 54, y: 63 }, type: 'press', revealOnStepId: 'zone-3-press' },
  { id: 'zone-3-lock-route', from: { x: 43, y: 62 }, to: { x: 49, y: 58 }, type: 'recovery', revealOnStepId: 'zone-3-cover' },
  { id: 'zone-3-six-cover', from: { x: 34, y: 48 }, to: { x: 39, y: 52 }, type: 'recovery', revealOnStepId: 'zone-3-central-protect' },
  { id: 'zone-3-wide-delay', from: { x: 13, y: 72 }, to: { x: 24, y: 62 }, type: 'recovery', revealOnStepId: 'zone-3-wide-recovery' },
]

const zone4Routes: PixiPitchPreviewRoute[] = [
  { id: 'zone-4-press-route', from: { x: 54, y: 89 }, to: { x: 52, y: 86 }, type: 'press', revealOnStepId: 'zone-4-press' },
  { id: 'zone-4-cover-route', from: { x: 47, y: 81 }, to: { x: 48, y: 83 }, type: 'recovery', revealOnStepId: 'zone-4-cover' },
  { id: 'zone-4-wide-delay', from: { x: 80, y: 84 }, to: { x: 71, y: 79 }, type: 'recovery', revealOnStepId: 'zone-4-delay' },
  { id: 'zone-4-six-cover', from: { x: 46, y: 66 }, to: { x: 47, y: 61 }, type: 'recovery', revealOnStepId: 'zone-4-delay' },
]

export const DEFENSIVE_TRANSITION_PAGE_CASES: DefensiveTransitionPageCase[] = [
  {
    id: 'zone-1',
    tabLabel: 'Zone 1 loss',
    zoneFocus: 'Zone 1 loss',
    cue: zone1Steps[0].cue,
    caption: 'Deep loss: delay the carrier, close the centre, recover the wide lanes, and protect the goal before chasing a regain.',
    system: { shape: 'Emergency protective shape', description: 'The team collapses around Zone 1 with the double pivot central and the back line protecting the box.' },
    strategy: 'Do not gamble on a risky counter-press. Slow the ball, protect the central channel, and make the opponent play around a compact block.',
    tactics: ['Nearest player delays the carrier', '#6 and #8 protect Zone 1/2 centrally', 'Wide players recover to Channel 1 and 2', 'Back line protects the box and central channel'],
    skillSet: ['Delay and jockey', 'Recovery running', 'Cover shadow', 'Defensive communication', 'Box protection'],
    principles: ['DELAY', 'BALANCE', 'CONTROL & RESTRAINT'],
    players: buildPlayers(zone1Home, zone1Away),
    ballPosition: { x: 50, y: 20 },
    steps: zone1Steps,
    routes: zone1Routes,
    repeatDelay: 1.2,
    tokenScale: 0.72,
  },
  {
    id: 'zone-2',
    tabLabel: 'Zone 2 loss',
    zoneFocus: 'Zone 2 loss',
    cue: zone2Steps[0].cue,
    caption: 'Loss while progressing: pressure the first touch, block the forward lane, and keep #6/#8 and the back line connected behind the ball.',
    system: { shape: 'Connected counter-press', description: 'The nearest players can press, but the double pivot and back line preserve the route back into Zone 1.' },
    strategy: 'Use immediate pressure only with cover. Deny the line-breaking pass, delay any wide escape, and keep the defensive unit connected.',
    tactics: ['Nearest player presses the first touch', 'Second player blocks the forward lane', '#6 and #8 protect Channel 3', 'Wide players recover inside-to-out', 'Back line protects Zone 1'],
    skillSet: ['Reaction after loss', 'Press angle', 'Cover shadow', 'Recovery run', 'Unit connection'],
    principles: ['DENY', 'DELAY', 'BALANCE', 'DIRECT'],
    players: buildPlayers(zone2Home, zone2Away),
    ballPosition: { x: 48, y: 47 },
    steps: zone2Steps,
    routes: zone2Routes,
    repeatDelay: 1.15,
    tokenScale: 0.74,
  },
  {
    id: 'zone-3',
    tabLabel: 'Zone 3 loss',
    zoneFocus: 'Zone 3 loss — 5-second fuse',
    cue: zone3Steps[0].cue,
    caption: 'The established model: #7 presses, #10 locks the forward lane, #6/#8 protect Channel 3, and the unit delays every route out.',
    system: { shape: '5-second counter-press', description: 'Nearest players squeeze the loss immediately while #6, #8, and the back line protect the space behind the press.' },
    strategy: 'Attack the first touch, deny the forward escape, and recover before the opponent can counter. If the press breaks, the rest-defence protects Zone 1/2.',
    tactics: ['#7 presses the first touch within five seconds', '#10 locks the forward escape lane', '#6 and #8 protect Channel 3', '#11 delays the wide outlet', 'Back line protects Zone 1/2 behind the press'],
    skillSet: ['Reaction after loss', 'Press angle', 'Cover shadow', 'Counter-press communication', 'Recovery positioning'],
    principles: ['DENY', 'DELAY', 'DIRECT', 'BALANCE'],
    players: buildPlayers(zone3Home, zone3Away),
    ballPosition: { x: 54, y: 63 },
    steps: zone3Steps,
    routes: zone3Routes,
    repeatDelay: 1.15,
    tokenScale: 0.74,
    liveBoardScenarioId: 'protect-lead-in-back-five',
  },
  {
    id: 'zone-4',
    tabLabel: 'Zone 4 loss',
    zoneFocus: 'Zone 4 loss',
    cue: zone4Steps[0].cue,
    caption: 'Final-third loss: close the ball at source, seal the central exit, delay the wide outlet, then recover into compact defensive organization if needed.',
    system: { shape: 'Final-third counter-press', description: 'The front players counter-press at source while #6/#8 and the back line keep the rest-defence ready to recover.' },
    strategy: 'Use the 5-second fuse to stop the counter before it starts. If the first press is broken, drop immediately into a connected compact shape.',
    tactics: ['#9 presses the ball at source', '#10 closes the central exit', 'Wide player delays the outlet', '#6 and #8 maintain rest-defence', 'Back line recovers into compact organization'],
    skillSet: ['Reaction speed', 'Press timing', 'Defensive transition scanning', 'Recovery communication', 'Compactness'],
    principles: ['DENY', 'DELAY', 'DIRECT', 'BALANCE'],
    players: buildPlayers(zone4Home, zone4Away),
    ballPosition: { x: 52, y: 86 },
    steps: zone4Steps,
    routes: zone4Routes,
    repeatDelay: 1.1,
    tokenScale: 0.72,
  },
]

export const DEFENSIVE_TRANSITION_PAGE_DEFAULT_CASE_ID: DefensiveTransitionPageCase['id'] = 'zone-3'
