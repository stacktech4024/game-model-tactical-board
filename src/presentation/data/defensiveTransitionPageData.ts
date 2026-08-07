import type {
  PixiPitchPreviewProps,
  PixiPitchPreviewRoute,
  PixiPitchPreviewStep,
} from '../../renderers/pixi/PixiPitchPreview'
import { FORMATION_POSITIONS, OPPOSITION_POSITIONS } from '../../data/formations.ts'
import {
  formationMetresToPitchPercentPositions,
  pitchPercentToPreviewPoint,
  type TransitionPositionMap,
} from './transitionPreviewCoordinates.ts'

type PreviewPlayer = PixiPitchPreviewProps['players'][number]
type PitchPoint = { x: number; y: number }
type FormationPositionMap = TransitionPositionMap

export type DefensiveTransitionPageStep = PixiPitchPreviewStep & {
  ballFromPlayerId?: string
  ballToPlayerId?: string
}

export type DefensiveTransitionPageCase = {
  id: 'zone-1' | 'zone-2' | 'zone-3' | 'zone-4'
  tabLabel: string
  zoneFocus: string
  subtitle: string
  cue: string
  caption: string
  system: {
    shape: string
    description: string
  }
  strategy: string
  tactics: string[]
  coachingPoints: string[]
  principles: string[]
  players: PreviewPlayer[]
  ballPosition: PitchPoint
  initialPossessorId: `home-${number}`
  possessionStepId: string
  lossStepId: string
  counterStepId: string
  steps: DefensiveTransitionPageStep[]
  routes: PixiPitchPreviewRoute[]
  repeatDelay: number
  tokenScale: number
  liveBoardScenarioId?: string
}

const HOME_DEFENSIVE_4231 = formationMetresToPitchPercentPositions(FORMATION_POSITIONS['defensive-4231'])
const AWAY_DEFENSIVE_4231 = formationMetresToPitchPercentPositions(OPPOSITION_POSITIONS['defensive-4231'])
const HOME_ATTACKING_433 = formationMetresToPitchPercentPositions(FORMATION_POSITIONS['attacking-433'])
const AWAY_ATTACKING_433 = formationMetresToPitchPercentPositions(OPPOSITION_POSITIONS['attacking-433'])

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

function toPreviewStep(step: DefensiveTransitionPageStep): DefensiveTransitionPageStep {
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
  1: { x: 50, y: 7 },
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
  1: { x: 50, y: 7 },
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
  1: { x: 50, y: 7 },
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
  1: { x: 50, y: 7 },
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

const zone1Steps: DefensiveTransitionPageStep[] = [
  {
    id: 'zone-1-canada-possession',
    cue: 'Canada possession — GK #1 secures in Zone 1 and scans the first line.',
    emphasizePlayerId: 'home-1',
    duration: 0.24,
  },
  {
    id: 'zone-1-gk-to-four',
    cue: 'Canada buildup — GK #1 finds #4 as the opponent shifts toward the ball.',
    ballFrom: { x: 51.5, y: 7 },
    ballTo: { x: 39.5, y: 18 },
    ballFromPlayerId: 'home-1',
    ballToPlayerId: 'home-4',
    playerId: 'home-4',
    playerTo: { x: 41, y: 18 },
    playerMoves: [
      { playerId: 'away-10', to: { x: 47, y: 22 } },
      { playerId: 'away-9', to: { x: 53, y: 28 } },
      { playerId: 'away-11', to: { x: 25, y: 39 } },
      { playerId: 'away-3', to: { x: 30, y: 81 } },
      { playerId: 'away-4', to: { x: 43, y: 81 } },
    ],
    duration: 0.42,
  },
  {
    id: 'zone-1-four-to-five',
    cue: 'Canada buildup — #4 switches to #5 while away #10 anticipates the square lane.',
    ballFrom: { x: 39.5, y: 18 },
    ballTo: { x: 60.5, y: 18 },
    ballFromPlayerId: 'home-4',
    ballToPlayerId: 'home-5',
    playerId: 'home-5',
    playerTo: { x: 59, y: 18 },
    playerMoves: [
      { playerId: 'away-10', to: { x: 49, y: 20 } },
      { playerId: 'away-7', to: { x: 73, y: 37 } },
      { playerId: 'away-8', to: { x: 58, y: 32 } },
      { playerId: 'away-5', to: { x: 58, y: 80 } },
      { playerId: 'away-2', to: { x: 70, y: 80 } },
    ],
    duration: 0.42,
  },
  {
    id: 'zone-1-loss',
    cue: 'Zone 1 loss — #5’s square pass is read and intercepted centrally by away #10.',
    ballFrom: { x: 60.5, y: 18 },
    ballTo: { x: 51.5, y: 20 },
    ballFromPlayerId: 'home-5',
    ballToPlayerId: 'away-10',
    playerId: 'away-10',
    playerTo: { x: 50, y: 20 },
    emphasizePlayerId: 'away-10',
    duration: 0.46,
  },
  {
    id: 'zone-1-counter-intent',
    cue: 'Opponent counter — #10 takes the first touch toward goal as #9 offers Channel 3 support.',
    ballFrom: { x: 51.5, y: 20 },
    ballTo: { x: 51.5, y: 15 },
    ballFromPlayerId: 'away-10',
    ballToPlayerId: 'away-10',
    playerId: 'away-10',
    playerTo: { x: 50, y: 15 },
    playerMoves: [
      { playerId: 'away-9', to: { x: 59, y: 21 } },
      { playerId: 'away-7', to: { x: 72, y: 34 } },
      { playerId: 'away-6', to: { x: 45, y: 34 } },
      { playerId: 'away-8', to: { x: 59, y: 31 } },
      { playerId: 'away-4', to: { x: 42, y: 77 } },
      { playerId: 'away-5', to: { x: 58, y: 77 } },
    ],
    duration: 0.5,
  },
  {
    id: 'zone-1-delay',
    cue: 'First defender — #3 applies DELAY with CONTROL & RESTRAINT.',
    playerId: 'home-3',
    playerTo: { x: 43, y: 18.5 },
    duration: 0.48,
  },
  {
    id: 'zone-1-central-cover',
    cue: 'Cover and BALANCE — #6/#8 stagger centrally as #9 reconnects toward halfway.',
    playerMoves: [
      { playerId: 'home-6', to: { x: 45, y: 25 } },
      { playerId: 'home-8', to: { x: 57, y: 27 } },
      { playerId: 'home-9', to: { x: 61, y: 55 }, startDelay: 0.12 },
    ],
    duration: 0.46,
  },
  {
    id: 'zone-1-wide-recovery',
    cue: 'Weak-side BALANCE — wide players recover inside-to-out.',
    playerMoves: [
      { playerId: 'home-11', to: { x: 25, y: 31 } },
      { playerId: 'home-7', to: { x: 75, y: 31 } },
    ],
    duration: 0.42,
  },
  {
    id: 'zone-1-rest-defence',
    cue: 'Recovery outcome — the back line protects Zone 1 and GK #1 stays set.',
    emphasizePlayerId: 'home-4',
    playerMoves: [
      { playerId: 'home-2', to: { x: 71, y: 20 } },
      { playerId: 'home-4', to: { x: 42, y: 16 } },
      { playerId: 'home-5', to: { x: 58, y: 16 } },
      { playerId: 'home-1', to: { x: 50, y: 7 } },
    ],
    duration: 0.3,
  },
  {
    id: 'zone-1-grey-reset',
    cue: 'Opponent reset — the supporting unit drops together as Canada blocks the first counter.',
    playerMoves: [
      { playerId: 'away-6', to: { x: 45, y: 39 } },
      { playerId: 'away-8', to: { x: 58, y: 37 } },
      { playerId: 'away-4', to: { x: 42, y: 82 } },
      { playerId: 'away-5', to: { x: 58, y: 82 } },
    ],
    duration: 0.26,
  },
]

const zone2Steps: DefensiveTransitionPageStep[] = [
  {
    id: 'zone-2-canada-possession',
    cue: 'Canada possession — GK #1 starts the progression toward Zone 2.',
    emphasizePlayerId: 'home-1',
    duration: 0.24,
  },
  {
    id: 'zone-2-gk-to-four',
    cue: 'Canada buildup — GK #1 plays into #4 as the opponent’s midfield shifts centrally.',
    ballFrom: { x: 51.5, y: 7 },
    ballTo: { x: 39.5, y: 32 },
    ballFromPlayerId: 'home-1',
    ballToPlayerId: 'home-4',
    playerId: 'home-4',
    playerTo: { x: 41, y: 32 },
    playerMoves: [
      { playerId: 'away-10', to: { x: 44, y: 48 } },
      { playerId: 'away-9', to: { x: 51, y: 34 } },
      { playerId: 'away-7', to: { x: 76, y: 54 } },
      { playerId: 'away-3', to: { x: 30, y: 81 } },
      { playerId: 'away-4', to: { x: 42, y: 80 } },
    ],
    duration: 0.42,
  },
  {
    id: 'zone-2-four-to-six',
    cue: 'Canada buildup — #4 finds #6 in Channel 2 as away #10 closes the next touch.',
    ballFrom: { x: 39.5, y: 32 },
    ballTo: { x: 43.5, y: 46 },
    ballFromPlayerId: 'home-4',
    ballToPlayerId: 'home-6',
    playerId: 'home-6',
    playerTo: { x: 45, y: 46 },
    playerMoves: [
      { playerId: 'away-10', to: { x: 49, y: 46 } },
      { playerId: 'away-8', to: { x: 57, y: 42 } },
      { playerId: 'away-11', to: { x: 25, y: 53 } },
      { playerId: 'away-5', to: { x: 58, y: 79 } },
      { playerId: 'away-2', to: { x: 70, y: 80 } },
    ],
    duration: 0.42,
  },
  {
    id: 'zone-2-loss',
    cue: 'Zone 2 loss — #6’s heavy touch is collected by away #10.',
    ballFrom: { x: 43.5, y: 46 },
    ballTo: { x: 50.5, y: 44 },
    ballFromPlayerId: 'home-6',
    ballToPlayerId: 'away-10',
    playerId: 'away-10',
    playerTo: { x: 49, y: 44 },
    emphasizePlayerId: 'away-10',
    duration: 0.46,
  },
  {
    id: 'zone-2-counter-intent',
    cue: 'Opponent counter — #10 drives forward while #9 and the Channel 1 runner break beyond.',
    ballFrom: { x: 50.5, y: 44 },
    ballTo: { x: 50.5, y: 38.5 },
    ballFromPlayerId: 'away-10',
    ballToPlayerId: 'away-10',
    playerId: 'away-10',
    playerTo: { x: 49, y: 38.5 },
    playerMoves: [
      { playerId: 'away-9', to: { x: 56, y: 29 } },
      { playerId: 'away-7', to: { x: 75, y: 48 } },
      { playerId: 'away-6', to: { x: 42, y: 47 } },
      { playerId: 'away-8', to: { x: 59, y: 45 } },
      { playerId: 'away-4', to: { x: 41, y: 77 } },
      { playerId: 'away-5', to: { x: 59, y: 77 } },
    ],
    duration: 0.5,
  },
  {
    id: 'zone-2-press',
    cue: 'First defender — #10 applies DENY pressure to stop the forward release.',
    playerId: 'home-10',
    playerTo: { x: 54, y: 44.5 },
    duration: 0.44,
  },
  {
    id: 'zone-2-cover',
    cue: 'Second defender — #8 covers the Channel 3 lane behind pressure.',
    playerId: 'home-8',
    playerTo: { x: 60, y: 41 },
    duration: 0.4,
  },
  {
    id: 'zone-2-central-protect',
    cue: 'Cover and BALANCE — #6/#8 protect separate lanes as #9 drops toward halfway.',
    playerMoves: [
      { playerId: 'home-6', to: { x: 42, y: 37 } },
      { playerId: 'home-7', to: { x: 70, y: 55 } },
      { playerId: 'home-11', to: { x: 30, y: 55 } },
      { playerId: 'home-9', to: { x: 50, y: 58 }, startDelay: 0.12 },
    ],
    duration: 0.46,
  },
  {
    id: 'zone-2-rest-defence',
    cue: 'Recovery outcome — the back line manages Zone 1 space and GK #1 adjusts.',
    emphasizePlayerId: 'home-5',
    playerMoves: [
      { playerId: 'home-2', to: { x: 70, y: 35 } },
      { playerId: 'home-3', to: { x: 30, y: 35 } },
      { playerId: 'home-4', to: { x: 42, y: 30 } },
      { playerId: 'home-5', to: { x: 58, y: 30 } },
      { playerId: 'home-1', to: { x: 50, y: 7 } },
    ],
    duration: 0.3,
  },
  {
    id: 'zone-2-grey-reset',
    cue: 'Opponent reset — midfield and the back line drop as Canada closes the forward lanes.',
    playerMoves: [
      { playerId: 'away-6', to: { x: 43, y: 51 } },
      { playerId: 'away-8', to: { x: 59, y: 49 } },
      { playerId: 'away-4', to: { x: 41, y: 81 } },
      { playerId: 'away-5', to: { x: 59, y: 81 } },
    ],
    duration: 0.26,
  },
]

const zone3Steps: DefensiveTransitionPageStep[] = [
  {
    id: 'zone-3-canada-possession',
    cue: 'Canada possession — GK #1 scans before starting the Zone 3 buildup.',
    emphasizePlayerId: 'home-1',
    duration: 0.22,
  },
  {
    id: 'zone-3-gk-to-five',
    cue: 'Canada buildup — GK #1 finds #5 as the opponent shifts toward Channel 3.',
    ballFrom: { x: 51.5, y: 7 },
    ballTo: { x: 43.5, y: 25 },
    ballFromPlayerId: 'home-1',
    ballToPlayerId: 'home-5',
    playerId: 'home-5',
    playerTo: { x: 42, y: 25 },
    playerMoves: [
      { playerId: 'away-2', to: { x: 58, y: 76 } },
      { playerId: 'away-6', to: { x: 36, y: 67 } },
      { playerId: 'away-7', to: { x: 57, y: 42 } },
      { playerId: 'away-3', to: { x: 30, y: 80 } },
      { playerId: 'away-4', to: { x: 42, y: 79 } },
    ],
    duration: 0.38,
  },
  {
    id: 'zone-3-five-to-six',
    cue: 'Canada buildup — #5 connects with #6 while away #2 begins to anticipate the supply lane.',
    ballFrom: { x: 43.5, y: 25 },
    ballTo: { x: 32.5, y: 48 },
    ballFromPlayerId: 'home-5',
    ballToPlayerId: 'home-6',
    playerId: 'home-6',
    playerTo: { x: 34, y: 48 },
    playerMoves: [
      { playerId: 'away-2', to: { x: 57, y: 69 } },
      { playerId: 'away-6', to: { x: 38, y: 64 } },
      { playerId: 'away-9', to: { x: 37, y: 35 } },
      { playerId: 'away-5', to: { x: 58, y: 78 } },
    ],
    duration: 0.4,
  },
  {
    id: 'zone-3-six-to-eight',
    cue: 'Canada buildup — #6 finds #8, but the opponent presses the next supply action.',
    ballFrom: { x: 32.5, y: 48 },
    ballTo: { x: 44.5, y: 58 },
    ballFromPlayerId: 'home-6',
    ballToPlayerId: 'home-8',
    playerId: 'home-8',
    playerTo: { x: 46, y: 58 },
    playerMoves: [
      { playerId: 'away-2', to: { x: 57, y: 64 } },
      { playerId: 'away-7', to: { x: 60, y: 40 } },
      { playerId: 'away-8', to: { x: 54, y: 57 } },
      { playerId: 'away-4', to: { x: 41, y: 77 } },
    ],
    duration: 0.4,
  },
  {
    id: 'zone-3-loss',
    cue: 'Zone 3 loss — away #2 steps across and intercepts Canada’s supply pass.',
    ballFrom: { x: 44.5, y: 58 },
    ballTo: { x: 61.5, y: 63 },
    ballFromPlayerId: 'home-8',
    ballToPlayerId: 'away-2',
    playerId: 'away-2',
    playerTo: { x: 60, y: 63 },
    emphasizePlayerId: 'away-2',
    duration: 0.46,
  },
  {
    id: 'zone-3-counter-intent',
    cue: 'Opponent counter — #2 escapes forward and wide as #7 accelerates into Channel 1.',
    ballFrom: { x: 61.5, y: 63 },
    ballTo: { x: 66.5, y: 55 },
    ballFromPlayerId: 'away-2',
    ballToPlayerId: 'away-2',
    playerId: 'away-2',
    playerTo: { x: 65, y: 55 },
    playerMoves: [
      { playerId: 'away-7', to: { x: 72, y: 39 } },
      { playerId: 'away-9', to: { x: 39, y: 32 } },
      { playerId: 'away-6', to: { x: 43, y: 56 } },
      { playerId: 'away-8', to: { x: 55, y: 51 } },
      { playerId: 'away-4', to: { x: 41, y: 74 } },
      { playerId: 'away-5', to: { x: 59, y: 74 } },
    ],
    duration: 0.5,
  },
  {
    id: 'zone-3-press',
    cue: 'First defender — #7 applies immediate DENY pressure inside the five-second fuse.',
    playerId: 'home-7',
    playerTo: { x: 60, y: 60 },
    duration: 0.44,
  },
  {
    id: 'zone-3-cover',
    cue: 'Second defender — #10 locks Channel 2 and DIRECTS play away from goal.',
    playerId: 'home-10',
    playerTo: { x: 53, y: 54 },
    duration: 0.4,
  },
  {
    id: 'zone-3-central-protect',
    cue: 'Cover and BALANCE — #6/#8 stagger in Channel 3 as #9 drops out of the attacking line.',
    playerMoves: [
      { playerId: 'home-6', to: { x: 39, y: 49 } },
      { playerId: 'home-8', to: { x: 47, y: 55 } },
      { playerId: 'home-9', to: { x: 35, y: 60 }, startDelay: 0.12 },
    ],
    duration: 0.44,
  },
  {
    id: 'zone-3-wide-recovery',
    cue: 'Recovery outcome — #11 delays wide while rest-defence and GK #1 hold.',
    playerId: 'home-11',
    playerTo: { x: 24, y: 62 },
    playerMoves: [
      { playerId: 'home-2', to: { x: 60, y: 29 } },
      { playerId: 'home-3', to: { x: 74, y: 27 } },
      { playerId: 'home-4', to: { x: 28, y: 24 } },
      { playerId: 'home-5', to: { x: 44, y: 24 } },
      { playerId: 'home-1', to: { x: 50, y: 7 } },
    ],
    duration: 0.42,
  },
  {
    id: 'zone-3-grey-reset',
    cue: 'Opponent reset — the support line and defenders drop after Canada delays the escape.',
    playerMoves: [
      { playerId: 'away-6', to: { x: 43, y: 60 } },
      { playerId: 'away-8', to: { x: 55, y: 56 } },
      { playerId: 'away-4', to: { x: 41, y: 79 } },
      { playerId: 'away-5', to: { x: 59, y: 79 } },
    ],
    duration: 0.26,
  },
]

const zone4Steps: DefensiveTransitionPageStep[] = [
  {
    id: 'zone-4-canada-possession',
    cue: 'Canada possession — #7 secures the wide delivery and scans inside in Zone 4.',
    emphasizePlayerId: 'home-7',
    duration: 0.22,
  },
  {
    id: 'zone-4-seven-to-ten',
    cue: 'Canada buildup — #7 plays inside to #10 as the opponent shifts toward the cutback lane.',
    ballFrom: { x: 81.5, y: 84 },
    ballTo: { x: 48.5, y: 81 },
    ballFromPlayerId: 'home-7',
    ballToPlayerId: 'home-10',
    playerId: 'home-10',
    playerTo: { x: 47, y: 81 },
    playerMoves: [
      { playerId: 'away-11', to: { x: 27, y: 80 } },
      { playerId: 'away-10', to: { x: 45, y: 79 } },
      { playerId: 'away-6', to: { x: 51, y: 72 } },
      { playerId: 'away-3', to: { x: 32, y: 72 } },
    ],
    duration: 0.4,
  },
  {
    id: 'zone-4-ten-to-nine',
    cue: 'Canada combination — #10 finds #9 between lines while grey #8 screens the return pass.',
    ballFrom: { x: 48.5, y: 81 },
    ballTo: { x: 55.5, y: 86 },
    ballFromPlayerId: 'home-10',
    ballToPlayerId: 'home-9',
    playerId: 'home-9',
    playerTo: { x: 54, y: 86 },
    playerMoves: [
      { playerId: 'away-9', to: { x: 51, y: 87 } },
      { playerId: 'away-8', to: { x: 58, y: 80 } },
      { playerId: 'away-2', to: { x: 68, y: 72 } },
      { playerId: 'away-5', to: { x: 59, y: 75 } },
    ],
    duration: 0.34,
  },
  {
    id: 'zone-4-nine-set',
    cue: 'Canada combination — #9 sets #10 for the cutback as the grey unit squeezes underneath.',
    ballFrom: { x: 55.5, y: 86 },
    ballTo: { x: 50.5, y: 82 },
    ballFromPlayerId: 'home-9',
    ballToPlayerId: 'home-10',
    playerId: 'home-10',
    playerTo: { x: 49, y: 82 },
    playerMoves: [
      { playerId: 'away-9', to: { x: 53, y: 85 } },
      { playerId: 'away-8', to: { x: 59, y: 78 } },
      { playerId: 'away-6', to: { x: 52, y: 70 } },
      { playerId: 'away-4', to: { x: 41, y: 74 } },
    ],
    duration: 0.32,
  },
  {
    id: 'zone-4-loss',
    cue: 'Zone 4 loss — away #9 reads and intercepts Canada’s cutback.',
    ballFrom: { x: 50.5, y: 82 },
    ballTo: { x: 54.5, y: 85 },
    ballFromPlayerId: 'home-10',
    ballToPlayerId: 'away-9',
    playerId: 'away-9',
    playerTo: { x: 53, y: 85 },
    emphasizePlayerId: 'away-9',
    duration: 0.44,
  },
  {
    id: 'zone-4-counter-intent',
    cue: 'Opponent counter — #9 attempts the first escape pass into #8 with Channel 1 support.',
    ballFrom: { x: 54.5, y: 85 },
    ballTo: { x: 60.5, y: 77 },
    ballFromPlayerId: 'away-9',
    ballToPlayerId: 'away-8',
    playerId: 'away-8',
    playerTo: { x: 59, y: 77 },
    playerMoves: [
      { playerId: 'away-7', to: { x: 72, y: 74 } },
      { playerId: 'away-2', to: { x: 67, y: 67 } },
      { playerId: 'away-6', to: { x: 50, y: 66 } },
      { playerId: 'away-10', to: { x: 45, y: 75 } },
      { playerId: 'away-4', to: { x: 39, y: 70 } },
      { playerId: 'away-5', to: { x: 63, y: 70 } },
    ],
    duration: 0.5,
  },
  {
    id: 'zone-4-press',
    cue: 'First defender — #9 applies DENY pressure to the outlet receiver.',
    playerId: 'home-9',
    playerTo: { x: 57, y: 82.5 },
    duration: 0.4,
  },
  {
    id: 'zone-4-cover',
    cue: 'Second defender — #10 closes the central exit and DIRECTS play wide.',
    playerId: 'home-10',
    playerTo: { x: 51, y: 77 },
    duration: 0.38,
  },
  {
    id: 'zone-4-delay',
    cue: 'Cover and BALANCE — #7 delays wide while #6/#8 secure behind.',
    playerMoves: [
      { playerId: 'home-7', to: { x: 70, y: 78 } },
      { playerId: 'home-6', to: { x: 46, y: 61 } },
      { playerId: 'home-8', to: { x: 55, y: 64 } },
    ],
    duration: 0.46,
  },
  {
    id: 'zone-4-rest-defence',
    cue: 'Recovery outcome — rest-defence protects the escape and GK #1 stays connected.',
    emphasizePlayerId: 'home-4',
    playerMoves: [
      { playerId: 'home-2', to: { x: 66, y: 55 } },
      { playerId: 'home-3', to: { x: 34, y: 55 } },
      { playerId: 'home-4', to: { x: 43, y: 49 } },
      { playerId: 'home-5', to: { x: 57, y: 49 } },
      { playerId: 'home-1', to: { x: 50, y: 7 } },
    ],
    duration: 0.32,
  },
  {
    id: 'zone-4-grey-reset',
    cue: 'Opponent reset — the grey support line drops when Canada contains the first outlet.',
    playerMoves: [
      { playerId: 'away-6', to: { x: 51, y: 70 } },
      { playerId: 'away-10', to: { x: 45, y: 79 } },
      { playerId: 'away-4', to: { x: 40, y: 75 } },
      { playerId: 'away-5', to: { x: 62, y: 75 } },
    ],
    duration: 0.26,
  },
]

const zone1Routes: PixiPitchPreviewRoute[] = [
  { id: 'zone-1-gk-pass', from: { x: 51.5, y: 7 }, to: { x: 39.5, y: 18 }, type: 'pass', revealOnStepId: 'zone-1-gk-to-four' },
  { id: 'zone-1-centre-back-switch', from: { x: 39.5, y: 18 }, to: { x: 60.5, y: 18 }, type: 'pass', revealOnStepId: 'zone-1-four-to-five' },
  { id: 'zone-1-turnover', from: { x: 60.5, y: 18 }, to: { x: 51.5, y: 20 }, type: 'pass', revealOnStepId: 'zone-1-loss' },
  { id: 'zone-1-counter-dribble', from: { x: 51.5, y: 20 }, to: { x: 51.5, y: 15 }, type: 'dribble', revealOnStepId: 'zone-1-counter-intent' },
  { id: 'zone-1-delay-route', from: { x: 27, y: 22 }, to: { x: 43, y: 18.5 }, type: 'press', revealOnStepId: 'zone-1-delay' },
  { id: 'zone-1-six-cover', from: { x: 44, y: 29 }, to: { x: 45, y: 25 }, type: 'recovery', revealOnStepId: 'zone-1-central-cover' },
  { id: 'zone-1-eight-cover', from: { x: 56, y: 29 }, to: { x: 57, y: 27 }, type: 'recovery', revealOnStepId: 'zone-1-central-cover' },
  { id: 'zone-1-nine-recovery', from: { x: 50, y: 72 }, to: { x: 61, y: 55 }, type: 'recovery', revealOnStepId: 'zone-1-central-cover' },
  { id: 'zone-1-wide-recover', from: { x: 18, y: 38 }, to: { x: 25, y: 31 }, type: 'recovery', revealOnStepId: 'zone-1-wide-recovery' },
]

const zone2Routes: PixiPitchPreviewRoute[] = [
  { id: 'zone-2-gk-pass', from: { x: 51.5, y: 7 }, to: { x: 39.5, y: 32 }, type: 'pass', revealOnStepId: 'zone-2-gk-to-four' },
  { id: 'zone-2-pivot-pass', from: { x: 39.5, y: 32 }, to: { x: 43.5, y: 46 }, type: 'pass', revealOnStepId: 'zone-2-four-to-six' },
  { id: 'zone-2-turnover', from: { x: 43.5, y: 46 }, to: { x: 50.5, y: 44 }, type: 'pass', revealOnStepId: 'zone-2-loss' },
  { id: 'zone-2-counter-dribble', from: { x: 50.5, y: 44 }, to: { x: 50.5, y: 38.5 }, type: 'dribble', revealOnStepId: 'zone-2-counter-intent' },
  { id: 'zone-2-press-route', from: { x: 58, y: 57 }, to: { x: 54, y: 44.5 }, type: 'press', revealOnStepId: 'zone-2-press' },
  { id: 'zone-2-cover-route', from: { x: 55, y: 49 }, to: { x: 60, y: 41 }, type: 'recovery', revealOnStepId: 'zone-2-cover' },
  { id: 'zone-2-six-cover', from: { x: 45, y: 46 }, to: { x: 42, y: 37 }, type: 'recovery', revealOnStepId: 'zone-2-central-protect' },
  { id: 'zone-2-nine-recovery', from: { x: 50, y: 76 }, to: { x: 50, y: 58 }, type: 'recovery', revealOnStepId: 'zone-2-central-protect' },
  { id: 'zone-2-wide-recover', from: { x: 79, y: 65 }, to: { x: 70, y: 55 }, type: 'recovery', revealOnStepId: 'zone-2-central-protect' },
]

const zone3Routes: PixiPitchPreviewRoute[] = [
  { id: 'zone-3-gk-pass', from: { x: 51.5, y: 7 }, to: { x: 43.5, y: 25 }, type: 'pass', revealOnStepId: 'zone-3-gk-to-five' },
  { id: 'zone-3-six-connection', from: { x: 43.5, y: 25 }, to: { x: 32.5, y: 48 }, type: 'pass', revealOnStepId: 'zone-3-five-to-six' },
  { id: 'zone-3-eight-connection', from: { x: 32.5, y: 48 }, to: { x: 44.5, y: 58 }, type: 'pass', revealOnStepId: 'zone-3-six-to-eight' },
  { id: 'zone-3-turnover', from: { x: 44.5, y: 58 }, to: { x: 61.5, y: 63 }, type: 'pass', revealOnStepId: 'zone-3-loss' },
  { id: 'zone-3-counter-dribble', from: { x: 61.5, y: 63 }, to: { x: 66.5, y: 55 }, type: 'dribble', revealOnStepId: 'zone-3-counter-intent' },
  { id: 'zone-3-press-route', from: { x: 59, y: 80 }, to: { x: 60, y: 60 }, type: 'press', revealOnStepId: 'zone-3-press' },
  { id: 'zone-3-lock-route', from: { x: 43, y: 62 }, to: { x: 53, y: 54 }, type: 'recovery', revealOnStepId: 'zone-3-cover' },
  { id: 'zone-3-six-cover', from: { x: 34, y: 48 }, to: { x: 39, y: 49 }, type: 'recovery', revealOnStepId: 'zone-3-central-protect' },
  { id: 'zone-3-nine-recovery', from: { x: 34, y: 88 }, to: { x: 35, y: 60 }, type: 'recovery', revealOnStepId: 'zone-3-central-protect' },
  { id: 'zone-3-wide-delay', from: { x: 13, y: 72 }, to: { x: 24, y: 62 }, type: 'recovery', revealOnStepId: 'zone-3-wide-recovery' },
]

const zone4Routes: PixiPitchPreviewRoute[] = [
  { id: 'zone-4-wide-inside', from: { x: 81.5, y: 84 }, to: { x: 48.5, y: 81 }, type: 'pass', revealOnStepId: 'zone-4-seven-to-ten' },
  { id: 'zone-4-ten-nine-combination', from: { x: 48.5, y: 81 }, to: { x: 55.5, y: 86 }, type: 'pass', revealOnStepId: 'zone-4-ten-to-nine' },
  { id: 'zone-4-nine-set', from: { x: 55.5, y: 86 }, to: { x: 50.5, y: 82 }, type: 'pass', revealOnStepId: 'zone-4-nine-set' },
  { id: 'zone-4-turnover', from: { x: 50.5, y: 82 }, to: { x: 54.5, y: 85 }, type: 'pass', revealOnStepId: 'zone-4-loss' },
  { id: 'zone-4-counter-pass', from: { x: 54.5, y: 85 }, to: { x: 60.5, y: 77 }, type: 'pass', revealOnStepId: 'zone-4-counter-intent' },
  { id: 'zone-4-press-route', from: { x: 54, y: 89 }, to: { x: 57, y: 82.5 }, type: 'press', revealOnStepId: 'zone-4-press' },
  { id: 'zone-4-cover-route', from: { x: 47, y: 81 }, to: { x: 51, y: 77 }, type: 'recovery', revealOnStepId: 'zone-4-cover' },
  { id: 'zone-4-wide-delay', from: { x: 80, y: 84 }, to: { x: 70, y: 78 }, type: 'recovery', revealOnStepId: 'zone-4-delay' },
  { id: 'zone-4-six-cover', from: { x: 46, y: 66 }, to: { x: 46, y: 61 }, type: 'recovery', revealOnStepId: 'zone-4-delay' },
]

export const DEFENSIVE_TRANSITION_PAGE_CASES: DefensiveTransitionPageCase[] = [
  {
    id: 'zone-1',
    tabLabel: 'Zone 1 loss',
    zoneFocus: 'Zone 1 loss',
    subtitle: 'Protect goal first after a dangerous central interception.',
    cue: zone1Steps[0].cue,
    caption: 'Canada builds from GK #1 through #4 and #5 before the Zone 1 interception. Away #10 drives, #3 applies DELAY, #6/#8 protect centrally, and #9 reconnects behind the ball.',
    system: { shape: 'Emergency protective shape', description: 'The team collapses around Zone 1 with the double pivot central and the back line protecting the box.' },
    strategy: 'Slow the counter, protect the central channels, and recover behind the ball before chasing the regain.',
    tactics: ['Canada possession/loss: GK #1 connects #4 to #5 before the central interception.', 'First defender: #3 delays the forward touch without diving in.', 'Cover and balance: #6/#8 separate central lanes while #9 drops to screen.', 'Recovery outcome: the back line protects goal and GK #1 stays set.'],
    coachingPoints: ['Arrive under control, show away from goal, and delay the next action.', '#6/#8 protect different depths; #9 drops toward halfway to reconnect the unit.'],
    principles: ['DELAY', 'BALANCE', 'CONTROL & RESTRAINT'],
    players: buildPlayers(zone1Home, zone1Away),
    ballPosition: pitchPercentToPreviewPoint({ x: 51.5, y: 7 }),
    initialPossessorId: 'home-1',
    possessionStepId: 'zone-1-canada-possession',
    lossStepId: 'zone-1-loss',
    counterStepId: 'zone-1-counter-intent',
    steps: zone1Steps.map(toPreviewStep),
    routes: zone1Routes.map(toPreviewRoute),
    repeatDelay: 1.2,
    tokenScale: 0.72,
  },
  {
    id: 'zone-2',
    tabLabel: 'Zone 2 loss',
    zoneFocus: 'Zone 2 loss',
    subtitle: 'Pressure the midfield turnover with cover behind the first defender.',
    cue: zone2Steps[0].cue,
    caption: 'Canada builds from GK #1 through #4 into #6 before the Zone 2 heavy touch. Away #10 drives with support while pressure, cover, #9 recovery, and the back line restore BALANCE.',
    system: { shape: 'Connected counter-press', description: 'The nearest players can press, but the double pivot and back line preserve the route back into Zone 1.' },
    strategy: 'Pressure with cover, deny the line-breaking release, and keep midfield connected to the back line.',
    tactics: ['Canada possession/loss: GK #1 and #4 connect into #6 before the heavy touch.', 'First defender: #10 pressures from an angle and denies the forward release.', 'Cover and balance: #8 covers, #6 screens, and #9 drops toward halfway.', 'Recovery outcome: the back line manages the space behind and GK #1 adjusts.'],
    coachingPoints: ['Nearest pressure approaches beside the ball carrier; the second defender protects another lane.', '#6/#8 separate centrally while #9 drops to remove the free forward pass.'],
    principles: ['DENY', 'DELAY', 'BALANCE'],
    players: buildPlayers(zone2Home, zone2Away),
    ballPosition: pitchPercentToPreviewPoint({ x: 51.5, y: 7 }),
    initialPossessorId: 'home-1',
    possessionStepId: 'zone-2-canada-possession',
    lossStepId: 'zone-2-loss',
    counterStepId: 'zone-2-counter-intent',
    steps: zone2Steps.map(toPreviewStep),
    routes: zone2Routes.map(toPreviewRoute),
    repeatDelay: 1.15,
    tokenScale: 0.74,
  },
  {
    id: 'zone-3',
    tabLabel: 'Zone 3 loss',
    zoneFocus: 'Zone 3 loss — 5-second fuse',
    subtitle: 'React to the intercepted supply pass before the opponent can escape.',
    cue: zone3Steps[0].cue,
    caption: 'Canada builds from GK #1 through #5, #6, and #8 before the Zone 3 supply loss. #7 presses, #10 DIRECTS, #6/#8 protect different depths, and #9 drops out of the attacking line.',
    system: { shape: '5-second counter-press', description: 'Nearest players squeeze the loss immediately while #6, #8, and the back line protect the space behind the press.' },
    strategy: 'Attack the first escape within five seconds, deny the forward lane, and recover if the counter-press breaks.',
    tactics: ['Canada possession/loss: GK #1 connects #5, #6, and #8 before the supply interception.', 'First defender: #7 presses beside the escape path within the five-second fuse.', 'Cover and balance: #10 locks inside, #6/#8 stagger, and #9 drops.', 'Recovery outcome: #11 delays wide and rest-defence protects Zone 1/2.'],
    coachingPoints: ['#7 curves the press to DENY forward play; #10 covers a separate central lane.', '#6/#8 stagger behind pressure while #9 recovers toward halfway.'],
    principles: ['DENY', 'DELAY', 'BALANCE'],
    players: buildPlayers(zone3Home, zone3Away),
    ballPosition: pitchPercentToPreviewPoint({ x: 51.5, y: 7 }),
    initialPossessorId: 'home-1',
    possessionStepId: 'zone-3-canada-possession',
    lossStepId: 'zone-3-loss',
    counterStepId: 'zone-3-counter-intent',
    steps: zone3Steps.map(toPreviewStep),
    routes: zone3Routes.map(toPreviewRoute),
    repeatDelay: 1.15,
    tokenScale: 0.74,
    liveBoardScenarioId: 'protect-lead-in-back-five',
  },
  {
    id: 'zone-4',
    tabLabel: 'Zone 4 loss',
    zoneFocus: 'Zone 4 loss',
    subtitle: 'Counter-press the intercepted cutback while rest-defence secures behind.',
    cue: zone4Steps[0].cue,
    caption: 'Canada combines from #7 through #10 and #9 before the Zone 4 cutback is intercepted. The opponent attempts a Channel 1 escape as #9, #10, and #7 counter-press in separate lanes.',
    system: { shape: 'Final-third counter-press', description: 'The front players counter-press at source while #6/#8 and the back line keep the rest-defence ready to recover.' },
    strategy: 'Stop the first escape with the five-second fuse; if it breaks, recover immediately into a compact shape.',
    tactics: ['Canada possession/loss: #7 combines with #10/#9 before the cutback is intercepted.', 'First defender: #9 pressures beside the attempted outlet and denies progression.', 'Cover and balance: #10 and #7 occupy separate lanes while #6/#8 secure.', 'Recovery outcome: rest-defence protects the escape and recovers compactly.'],
    coachingPoints: ['Front players counter-press in sequence: pressure, cover, then DIRECT the escape.', '#6/#8 protect the space behind; the back line and GK #1 stay connected.'],
    principles: ['DENY', 'DIRECT', 'BALANCE'],
    players: buildPlayers(zone4Home, zone4Away),
    ballPosition: pitchPercentToPreviewPoint({ x: 81.5, y: 84 }),
    initialPossessorId: 'home-7',
    possessionStepId: 'zone-4-canada-possession',
    lossStepId: 'zone-4-loss',
    counterStepId: 'zone-4-counter-intent',
    steps: zone4Steps.map(toPreviewStep),
    routes: zone4Routes.map(toPreviewRoute),
    repeatDelay: 1.1,
    tokenScale: 0.72,
  },
]

export const DEFENSIVE_TRANSITION_PAGE_DEFAULT_CASE_ID: DefensiveTransitionPageCase['id'] = 'zone-3'
