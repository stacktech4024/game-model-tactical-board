import type {
  PixiPitchPreviewProps,
  PixiPitchPreviewRoute,
  PixiPitchPreviewStep,
} from '../../renderers/pixi/PixiPitchPreview'
import { pitchPercentToPreviewPoint } from './transitionPreviewCoordinates.ts'

type PreviewPlayer = PixiPitchPreviewProps['players'][number]
type PitchPoint = { x: number; y: number }
type PositionMap = Record<number, PitchPoint>

export type AttackingTransitionPageStep = PixiPitchPreviewStep & {
  ballFromPlayerId?: string
  ballToPlayerId?: string
  focusPoint?: PitchPoint
}

export type AttackingTransitionPageCase = {
  id: 'zone-1' | 'zone-2' | 'zone-3' | 'zone-4'
  tabLabel: string
  zoneFocus: string
  subtitle: string
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
  initialPossessorId: 'away-1'
  distributionStepId: string
  turnoverStepId: string
  regainPauseStepId: string
  steps: AttackingTransitionPageStep[]
  routes: PixiPitchPreviewRoute[]
  repeatDelay: number
  tokenScale: number
}

function buildPlayers(homePositions: PositionMap, awayPositions: PositionMap): PreviewPlayer[] {
  const players: PreviewPlayer[] = []

  for (let number = 1; number <= 11; number += 1) {
    const start = pitchPercentToPreviewPoint(homePositions[number])

    players.push({
      id: `home-${number}`,
      label: String(number),
      x: start.x,
      y: start.y,
      tone: number === 1 ? 'keeper' : undefined,
      facingAngle: number === 1 ? 0 : undefined,
    })
  }

  for (let number = 1; number <= 11; number += 1) {
    const start = pitchPercentToPreviewPoint(awayPositions[number])

    players.push({
      id: `away-${number}`,
      label: String(number),
      x: start.x,
      y: start.y,
      tone: number === 1 ? 'keeper' : 'opponent',
      side: 'away',
      facingAngle: number === 1 ? 180 : undefined,
    })
  }

  return players
}

function toPreviewStep(step: AttackingTransitionPageStep): AttackingTransitionPageStep {
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

export function getTransitionFacingAngle(from: PitchPoint, to: PitchPoint): number {
  const deltaX = to.x - from.x
  const deltaY = to.y - from.y

  if (Math.abs(deltaX) < 0.001 && Math.abs(deltaY) < 0.001) {
    return 0
  }

  return (Math.atan2(deltaX, deltaY) * 180) / Math.PI
}

function addBodyPositioning(
  steps: AttackingTransitionPageStep[],
  homePositions: PositionMap,
  awayPositions: PositionMap,
): AttackingTransitionPageStep[] {
  const positions = new Map<string, PitchPoint>()

  for (let number = 1; number <= 11; number += 1) {
    positions.set(`home-${number}`, homePositions[number])
    positions.set(`away-${number}`, awayPositions[number])
  }

  const turnoverIndex = steps.findIndex((step) => step.id.endsWith('-turnover'))
  const frontUnit = new Set(['home-7', 'home-9', 'home-11'])
  const midfieldUnit = new Set(['home-6', 'home-8', 'home-10'])

  return steps.map((step, stepIndex) => {
    const ballFocus = step.ballTo ?? step.ballFrom ?? step.focusPoint
    const movedPlayerIds = new Set(step.playerMoves?.map((move) => move.playerId) ?? [])
    const nextAction = step.ballToPlayerId
      ? steps.slice(stepIndex + 1).find((candidate) => candidate.ballFromPlayerId === step.ballToPlayerId)
      : undefined
    const receiverTarget = nextAction?.ballTo
    const receiverEnd = step.playerTo ?? (step.playerId ? positions.get(step.playerId) : undefined)
    const facingAngle =
      step.facingAngle ??
      (receiverEnd
        ? getTransitionFacingAngle(receiverEnd, receiverTarget ?? { x: 50, y: 100 })
        : undefined)
    const playerMoves = step.playerMoves?.map((move) => {
      const start = positions.get(move.playerId)
      const isDefendingPlayer = move.playerId.startsWith('away-')
      const facingTarget =
        move.playerId === step.ballFromPlayerId && step.ballTo
          ? step.ballTo
          : isDefendingPlayer
            ? ballFocus
            : move.to

      return {
        ...move,
        startDelay:
          move.startDelay ??
          (move.playerId.startsWith('away-')
            ? 0.06
            : stepIndex <= turnoverIndex
              ? frontUnit.has(move.playerId)
                ? 0
                : midfieldUnit.has(move.playerId)
                  ? 0.1
                  : 0.2
              : midfieldUnit.has(move.playerId)
                ? 0.08
                : frontUnit.has(move.playerId)
                  ? 0.16
                  : 0.26),
        facingAngle:
          move.facingAngle ??
          (start && facingTarget
            ? getTransitionFacingAngle(isDefendingPlayer ? move.to : start, facingTarget)
            : undefined),
      }
    })
    const rotatingPlayerIds = new Set([
      ...movedPlayerIds,
      ...(step.playerId ? [step.playerId] : []),
    ])
    const playerFacings = [...positions.entries()]
      .filter(([playerId]) => {
        const playerNumber = Number(playerId.split('-')[1])

        return !rotatingPlayerIds.has(playerId) && (playerNumber !== 1 || playerId === step.ballFromPlayerId)
      })
      .map(([playerId, position]) => ({
        playerId,
        facingAngle: getTransitionFacingAngle(
          position,
          playerId === step.ballFromPlayerId && step.ballTo ? step.ballTo : ballFocus ?? position,
        ),
      }))

    if (step.playerId && step.playerTo) {
      positions.set(step.playerId, step.playerTo)
    }
    step.playerMoves?.forEach((move) => positions.set(move.playerId, move.to))

    return { ...step, facingAngle, playerMoves, playerFacings }
  })
}

function buildRoutes(
  steps: AttackingTransitionPageStep[],
  routeTypes: Record<string, PixiPitchPreviewRoute['type']>,
  extraRoutes: PixiPitchPreviewRoute[],
): PixiPitchPreviewRoute[] {
  const ballRoutes = steps.flatMap((step) => {
    if (!step.ballFrom || !step.ballTo) {
      return []
    }

    return [{
      id: `${step.id}-ball`,
      from: step.ballFrom,
      to: step.ballTo,
      type: routeTypes[step.id] ?? 'pass',
      revealOnStepId: step.id,
    } satisfies PixiPitchPreviewRoute]
  })

  return [...ballRoutes, ...extraRoutes]
}

function previewCase(
  definition: Omit<AttackingTransitionPageCase, 'players' | 'ballPosition' | 'steps' | 'routes'> & {
    homePositions: PositionMap
    awayPositions: PositionMap
    steps: AttackingTransitionPageStep[]
    routeTypes: Record<string, PixiPitchPreviewRoute['type']>
    extraRoutes: PixiPitchPreviewRoute[]
  },
): AttackingTransitionPageCase {
  const {
    homePositions,
    awayPositions,
    steps,
    routeTypes,
    extraRoutes,
    ...pageCase
  } = definition

  return {
    ...pageCase,
    players: buildPlayers(homePositions, awayPositions),
    ballPosition: pitchPercentToPreviewPoint(awayPositions[1]),
    steps: addBodyPositioning(steps, homePositions, awayPositions).map(toPreviewStep),
    routes: buildRoutes(steps, routeTypes, extraRoutes).map(toPreviewRoute),
  }
}

// Goal-kick reference shape: Canada's back four protect halfway against the
// direct ball, while the front and midfield lines press the opponent build-up.
// The opponent back line and midfield stay low; their attacking unit remains
// higher so the whole team is not unrealistically crowded around the box.
const HOME_HIGH_PRESS: PositionMap = {
  1: { x: 50, y: 8 },
  2: { x: 76, y: 52 },
  3: { x: 24, y: 50 },
  4: { x: 40, y: 49 },
  5: { x: 60, y: 49 },
  6: { x: 50, y: 62 },
  7: { x: 82, y: 80 },
  8: { x: 40, y: 68 },
  9: { x: 50, y: 82 },
  10: { x: 58, y: 75 },
  11: { x: 18, y: 80 },
}

const AWAY_GOAL_KICK: PositionMap = {
  1: { x: 50, y: 94 },
  2: { x: 82, y: 86 },
  3: { x: 18, y: 86 },
  4: { x: 39, y: 87 },
  5: { x: 61, y: 87 },
  6: { x: 50, y: 76 },
  7: { x: 20, y: 53 },
  8: { x: 39, y: 70 },
  9: { x: 50, y: 49 },
  10: { x: 59, y: 68 },
  11: { x: 80, y: 53 },
}

const zone1Steps: AttackingTransitionPageStep[] = [
  {
    id: 'zone-1-gk-distribution',
    cue: 'Opponent build-up — The goalkeeper plays short to centre-back #4.',
    ballFrom: { x: 50, y: 94 },
    ballTo: { x: 38, y: 86 },
    ballFromPlayerId: 'away-1',
    ballToPlayerId: 'away-4',
    playerId: 'away-4',
    playerTo: { x: 38, y: 86 },
    playerMoves: [
      { playerId: 'away-3', to: { x: 16, y: 84 } },
      { playerId: 'away-5', to: { x: 62, y: 86 } },
      { playerId: 'away-2', to: { x: 84, y: 84 } },
      { playerId: 'home-9', to: { x: 47, y: 80 } },
    ],
    duration: 0.48,
  },
  {
    id: 'zone-1-centre-back-switch',
    cue: 'Opponent circulation — #4 connects across the back line to centre-back #5.',
    ballFrom: { x: 38, y: 86 },
    ballTo: { x: 62, y: 86 },
    ballFromPlayerId: 'away-4',
    ballToPlayerId: 'away-5',
    playerId: 'away-5',
    playerTo: { x: 62, y: 86 },
    playerMoves: [
      { playerId: 'away-6', to: { x: 54, y: 74 } },
      { playerId: 'away-8', to: { x: 42, y: 69 } },
      { playerId: 'home-7', to: { x: 80, y: 77 } },
      { playerId: 'home-11', to: { x: 20, y: 77 } },
      { playerId: 'home-10', to: { x: 57, y: 72 } },
      { playerId: 'home-6', to: { x: 50, y: 59 } },
      { playerId: 'home-8', to: { x: 41, y: 66 } },
    ],
    duration: 0.46,
  },
  {
    id: 'zone-1-direct-ball',
    cue: 'Direct trigger — #5 plays long to #9 as Canada’s connected back four drop.',
    ballFrom: { x: 62, y: 86 },
    ballTo: { x: 50, y: 24 },
    ballFromPlayerId: 'away-5',
    ballToPlayerId: 'away-9',
    playerId: 'away-9',
    playerTo: { x: 50, y: 24 },
    playerMoves: [
      { playerId: 'away-7', to: { x: 22, y: 36 } },
      { playerId: 'away-10', to: { x: 58, y: 42 } },
      { playerId: 'away-11', to: { x: 78, y: 36 } },
      { playerId: 'home-2', to: { x: 74, y: 34 } },
      { playerId: 'home-3', to: { x: 26, y: 34 } },
      { playerId: 'home-4', to: { x: 41, y: 32 } },
      { playerId: 'home-5', to: { x: 59, y: 32 } },
      { playerId: 'home-6', to: { x: 50, y: 40 } },
      { playerId: 'home-8', to: { x: 42, y: 48 } },
      { playerId: 'home-10', to: { x: 58, y: 55 } },
      { playerId: 'home-7', to: { x: 78, y: 62 } },
      { playerId: 'home-9', to: { x: 50, y: 60 } },
      { playerId: 'home-11', to: { x: 22, y: 62 } },
    ],
    duration: 0.9,
  },
  {
    id: 'zone-1-turnover',
    cue: 'Zone 1 turnover — GK #1 reads the long ball, claims, and looks forward.',
    ballFrom: { x: 50, y: 24 },
    ballTo: { x: 50, y: 8 },
    ballFromPlayerId: 'away-9',
    ballToPlayerId: 'home-1',
    playerId: 'home-1',
    playerTo: { x: 50, y: 8 },
    focusPoint: { x: 50, y: 8 },
    emphasizePlayerId: 'home-1',
    duration: 0.58,
  },
  {
    id: 'zone-1-regain-scan',
    cue: 'Regain pause — GK #1 secures the ball, sets, and scans for #2 before releasing.',
    playerId: 'home-1',
    playerTo: { x: 50, y: 8 },
    duration: 0.34,
  },
  {
    id: 'zone-1-gk-release',
    cue: 'Zone 2 — GK #1 releases #2 as all three Canada units turn upfield.',
    ballFrom: { x: 50, y: 8 },
    ballTo: { x: 78, y: 38 },
    ballFromPlayerId: 'home-1',
    ballToPlayerId: 'home-2',
    playerId: 'home-2',
    playerTo: { x: 78, y: 38 },
    playerMoves: [
      { playerId: 'home-3', to: { x: 26, y: 36 } },
      { playerId: 'home-4', to: { x: 41, y: 34 } },
      { playerId: 'home-5', to: { x: 59, y: 34 } },
      { playerId: 'home-6', to: { x: 50, y: 44 } },
      { playerId: 'home-8', to: { x: 43, y: 50 } },
      { playerId: 'home-10', to: { x: 57, y: 58 } },
      { playerId: 'home-7', to: { x: 82, y: 66 } },
      { playerId: 'home-9', to: { x: 50, y: 65 } },
      { playerId: 'home-11', to: { x: 18, y: 66 } },
      { playerId: 'away-9', to: { x: 50, y: 40 } },
      { playerId: 'away-7', to: { x: 22, y: 50 } },
      { playerId: 'away-10', to: { x: 58, y: 52 } },
      { playerId: 'away-11', to: { x: 78, y: 50 } },
      { playerId: 'away-6', to: { x: 50, y: 80 } },
      { playerId: 'away-8', to: { x: 40, y: 76 } },
      { playerId: 'away-2', to: { x: 81, y: 89 } },
      { playerId: 'away-3', to: { x: 19, y: 89 } },
      { playerId: 'away-4', to: { x: 40, y: 90 } },
      { playerId: 'away-5', to: { x: 60, y: 90 } },
    ],
    duration: 0.72,
  },
  {
    id: 'zone-1-ten-connects',
    cue: 'Zone 2/3 — #2 finds #10 while the back line squeezes behind midfield.',
    ballFrom: { x: 78, y: 38 },
    ballTo: { x: 57, y: 58 },
    ballFromPlayerId: 'home-2',
    ballToPlayerId: 'home-10',
    playerId: 'home-10',
    playerTo: { x: 57, y: 58 },
    playerMoves: [
      { playerId: 'home-2', to: { x: 76, y: 48 } },
      { playerId: 'home-3', to: { x: 25, y: 44 } },
      { playerId: 'home-4', to: { x: 41, y: 42 } },
      { playerId: 'home-5', to: { x: 59, y: 42 } },
      { playerId: 'home-6', to: { x: 50, y: 51 } },
      { playerId: 'home-8', to: { x: 43, y: 56 } },
      { playerId: 'home-7', to: { x: 86, y: 70 } },
      { playerId: 'home-9', to: { x: 50, y: 70 } },
      { playerId: 'home-11', to: { x: 14, y: 70 } },
    ],
    duration: 0.66,
  },
  {
    id: 'zone-1-seven-released',
    cue: 'Zone 3 — #10 releases #7 into Channel 1; #9 holds Channel 3.',
    ballFrom: { x: 57, y: 58 },
    ballTo: { x: 89, y: 74 },
    ballFromPlayerId: 'home-10',
    ballToPlayerId: 'home-7',
    playerId: 'home-7',
    playerTo: { x: 89, y: 74 },
    playerMoves: [
      { playerId: 'home-2', to: { x: 75, y: 55 } },
      { playerId: 'home-3', to: { x: 25, y: 51 } },
      { playerId: 'home-4', to: { x: 41, y: 48 } },
      { playerId: 'home-5', to: { x: 59, y: 48 } },
      { playerId: 'home-6', to: { x: 50, y: 58 } },
      { playerId: 'home-8', to: { x: 44, y: 64 } },
      { playerId: 'home-10', to: { x: 58, y: 66 } },
      { playerId: 'home-9', to: { x: 50, y: 76 } },
      { playerId: 'home-11', to: { x: 12, y: 75 } },
    ],
    duration: 0.66,
  },
  {
    id: 'zone-1-seven-enters',
    cue: 'Zone 4 — #7 carries into crossing space as the units support underneath.',
    ballFrom: { x: 89, y: 74 },
    ballTo: { x: 91, y: 84 },
    ballFromPlayerId: 'home-7',
    ballToPlayerId: 'home-7',
    playerId: 'home-7',
    playerTo: { x: 91, y: 84 },
    playerMoves: [
      { playerId: 'home-9', to: { x: 50, y: 85 } },
      { playerId: 'home-11', to: { x: 20, y: 82 } },
      { playerId: 'home-6', to: { x: 50, y: 62 } },
      { playerId: 'home-8', to: { x: 45, y: 68 } },
      { playerId: 'home-10', to: { x: 58, y: 72 } },
    ],
    duration: 0.54,
  },
  {
    id: 'zone-1-cross',
    cue: 'Zone 4 — #7 crosses and #9 attacks Channel 3.',
    ballFrom: { x: 91, y: 84 },
    ballTo: { x: 50, y: 88 },
    ballFromPlayerId: 'home-7',
    ballToPlayerId: 'home-9',
    playerId: 'home-9',
    playerTo: { x: 50, y: 88 },
    playerMoves: [{ playerId: 'away-1', to: { x: 50, y: 93 } }],
    duration: 0.58,
  },
  {
    id: 'zone-1-finish',
    cue: 'Finish — #9 shoots into goal; the away goalkeeper reacts.',
    ballFrom: { x: 50, y: 88 },
    ballTo: { x: 50, y: 100 },
    ballFromPlayerId: 'home-9',
    playerMoves: [{ playerId: 'away-1', to: { x: 46, y: 96 } }],
    duration: 0.5,
  },
]

const zone2Steps: AttackingTransitionPageStep[] = [
  {
    id: 'zone-2-gk-distribution',
    cue: 'Opponent build-up — The goalkeeper starts short through centre-back #4.',
    ballFrom: { x: 50, y: 94 },
    ballTo: { x: 39, y: 86 },
    ballFromPlayerId: 'away-1',
    ballToPlayerId: 'away-4',
    playerId: 'away-4',
    playerTo: { x: 39, y: 86 },
    playerMoves: [
      { playerId: 'away-3', to: { x: 17, y: 84 } },
      { playerId: 'away-5', to: { x: 63, y: 86 } },
      { playerId: 'away-2', to: { x: 83, y: 84 } },
      { playerId: 'home-9', to: { x: 48, y: 79 } },
    ],
    duration: 0.48,
  },
  {
    id: 'zone-2-pivot-connection',
    cue: 'Opponent circulation — #4 finds pivot #6 underneath Canada’s first line.',
    ballFrom: { x: 39, y: 86 },
    ballTo: { x: 50, y: 74 },
    ballFromPlayerId: 'away-4',
    ballToPlayerId: 'away-6',
    playerId: 'away-6',
    playerTo: { x: 50, y: 74 },
    playerMoves: [
      { playerId: 'away-8', to: { x: 40, y: 68 } },
      { playerId: 'away-10', to: { x: 60, y: 66 } },
      { playerId: 'home-7', to: { x: 79, y: 77 } },
      { playerId: 'home-11', to: { x: 21, y: 77 } },
      { playerId: 'home-10', to: { x: 57, y: 68 } },
      { playerId: 'home-6', to: { x: 49, y: 55 } },
      { playerId: 'home-8', to: { x: 41, y: 60 } },
    ],
    duration: 0.5,
  },
  {
    id: 'zone-2-direct-to-nine',
    cue: 'Direct trigger — Pivot #6 clips toward #9 and Canada sets for the aerial second ball.',
    ballFrom: { x: 50, y: 74 },
    ballTo: { x: 50, y: 44 },
    ballFromPlayerId: 'away-6',
    ballToPlayerId: 'away-9',
    playerId: 'away-9',
    playerTo: { x: 50, y: 44 },
    playerMoves: [
      { playerId: 'away-7', to: { x: 21, y: 46 } },
      { playerId: 'away-10', to: { x: 58, y: 54 } },
      { playerId: 'away-11', to: { x: 79, y: 46 } },
      { playerId: 'home-2', to: { x: 75, y: 49 } },
      { playerId: 'home-3', to: { x: 25, y: 48 } },
      { playerId: 'home-4', to: { x: 41, y: 46 } },
      { playerId: 'home-5', to: { x: 59, y: 46 } },
      { playerId: 'home-6', to: { x: 49, y: 49 } },
      { playerId: 'home-8', to: { x: 41, y: 56 } },
      { playerId: 'home-10', to: { x: 57, y: 64 } },
      { playerId: 'home-7', to: { x: 80, y: 70 } },
      { playerId: 'home-9', to: { x: 50, y: 68 } },
      { playerId: 'home-11', to: { x: 20, y: 70 } },
    ],
    duration: 0.78,
  },
  {
    id: 'zone-2-turnover',
    cue: 'Zone 2 turnover — #5 contests #9 and #6 reads the knockdown to win the second ball.',
    ballFrom: { x: 50, y: 44 },
    ballTo: { x: 48, y: 43 },
    ballFromPlayerId: 'away-9',
    ballToPlayerId: 'home-6',
    playerId: 'home-6',
    playerTo: { x: 48, y: 43 },
    focusPoint: { x: 48, y: 43 },
    duration: 0.7,
  },
  {
    id: 'zone-2-regain-scan',
    cue: 'Regain pause — #6 settles the second ball, opens forward, and scans for #10.',
    playerId: 'home-6',
    playerTo: { x: 48, y: 43 },
    duration: 0.4,
  },
  {
    id: 'zone-2-ten-connects',
    cue: 'Zone 2/3 — #6 finds #10 as the back four squeeze and the front unit runs.',
    ballFrom: { x: 48, y: 43 },
    ballTo: { x: 56, y: 56 },
    ballFromPlayerId: 'home-6',
    ballToPlayerId: 'home-10',
    playerId: 'home-10',
    playerTo: { x: 56, y: 56 },
    playerMoves: [
      { playerId: 'home-2', to: { x: 75, y: 54 } },
      { playerId: 'home-3', to: { x: 25, y: 52 } },
      { playerId: 'home-4', to: { x: 41, y: 50 } },
      { playerId: 'home-5', to: { x: 59, y: 50 } },
      { playerId: 'home-6', to: { x: 49, y: 51 } },
      { playerId: 'home-8', to: { x: 42, y: 58 } },
      { playerId: 'home-7', to: { x: 85, y: 68 } },
      { playerId: 'home-9', to: { x: 50, y: 68 } },
      { playerId: 'home-11', to: { x: 15, y: 68 } },
      { playerId: 'away-9', to: { x: 50, y: 56 } },
      { playerId: 'away-7', to: { x: 22, y: 61 } },
      { playerId: 'away-10', to: { x: 58, y: 64 } },
      { playerId: 'away-11', to: { x: 78, y: 61 } },
      { playerId: 'away-6', to: { x: 50, y: 80 } },
      { playerId: 'away-8', to: { x: 40, y: 76 } },
      { playerId: 'away-2', to: { x: 81, y: 89 } },
      { playerId: 'away-3', to: { x: 19, y: 89 } },
      { playerId: 'away-4', to: { x: 40, y: 90 } },
      { playerId: 'away-5', to: { x: 60, y: 90 } },
    ],
    duration: 0.87,
  },
  {
    id: 'zone-2-seven-released',
    cue: 'Zone 3 — #10 releases #7 into Channel 1 while #9 stays central.',
    ballFrom: { x: 56, y: 56 },
    ballTo: { x: 89, y: 74 },
    ballFromPlayerId: 'home-10',
    ballToPlayerId: 'home-7',
    playerId: 'home-7',
    playerTo: { x: 89, y: 74 },
    playerMoves: [
      { playerId: 'home-2', to: { x: 74, y: 59 } },
      { playerId: 'home-3', to: { x: 26, y: 57 } },
      { playerId: 'home-4', to: { x: 41, y: 55 } },
      { playerId: 'home-5', to: { x: 59, y: 55 } },
      { playerId: 'home-6', to: { x: 49, y: 58 } },
      { playerId: 'home-8', to: { x: 43, y: 64 } },
      { playerId: 'home-10', to: { x: 57, y: 64 } },
      { playerId: 'home-9', to: { x: 50, y: 76 } },
      { playerId: 'home-11', to: { x: 13, y: 75 } },
    ],
    duration: 0.66,
  },
  {
    id: 'zone-2-seven-enters',
    cue: 'Zone 4 — #7 carries into crossing space with midfield connected underneath.',
    ballFrom: { x: 89, y: 74 },
    ballTo: { x: 91, y: 84 },
    ballFromPlayerId: 'home-7',
    ballToPlayerId: 'home-7',
    playerId: 'home-7',
    playerTo: { x: 91, y: 84 },
    playerMoves: [
      { playerId: 'home-9', to: { x: 50, y: 85 } },
      { playerId: 'home-11', to: { x: 20, y: 82 } },
      { playerId: 'home-6', to: { x: 49, y: 62 } },
      { playerId: 'home-8', to: { x: 44, y: 68 } },
      { playerId: 'home-10', to: { x: 58, y: 72 } },
    ],
    duration: 0.54,
  },
  {
    id: 'zone-2-cross',
    cue: 'Zone 4 — #7 crosses to #9 in Channel 3.',
    ballFrom: { x: 91, y: 84 },
    ballTo: { x: 50, y: 88 },
    ballFromPlayerId: 'home-7',
    ballToPlayerId: 'home-9',
    playerId: 'home-9',
    playerTo: { x: 50, y: 88 },
    playerMoves: [{ playerId: 'away-1', to: { x: 50, y: 93 } }],
    duration: 0.56,
  },
  {
    id: 'zone-2-finish',
    cue: 'Finish — #9 shoots into goal; the goalkeeper dives.',
    ballFrom: { x: 50, y: 88 },
    ballTo: { x: 50, y: 100 },
    ballFromPlayerId: 'home-9',
    playerMoves: [{ playerId: 'away-1', to: { x: 46, y: 96 } }],
    duration: 0.5,
  },
]

const zone3Steps: AttackingTransitionPageStep[] = [
  {
    id: 'zone-3-gk-distribution',
    cue: 'Opponent build-up — The goalkeeper plays short to centre-back #5.',
    ballFrom: { x: 50, y: 94 },
    ballTo: { x: 62, y: 86 },
    ballFromPlayerId: 'away-1',
    ballToPlayerId: 'away-5',
    playerId: 'away-5',
    playerTo: { x: 62, y: 86 },
    playerMoves: [
      { playerId: 'away-2', to: { x: 84, y: 84 } },
      { playerId: 'away-4', to: { x: 38, y: 86 } },
      { playerId: 'away-3', to: { x: 16, y: 84 } },
      { playerId: 'home-9', to: { x: 53, y: 81 } },
    ],
    duration: 0.48,
  },
  {
    id: 'zone-3-pivot-connection',
    cue: 'Opponent circulation — #5 finds pivot #6 as Canada’s front line curves the press.',
    ballFrom: { x: 62, y: 86 },
    ballTo: { x: 52, y: 75 },
    ballFromPlayerId: 'away-5',
    ballToPlayerId: 'away-6',
    playerId: 'away-6',
    playerTo: { x: 52, y: 75 },
    playerMoves: [
      { playerId: 'away-2', to: { x: 80, y: 79 } },
      { playerId: 'away-8', to: { x: 43, y: 68 } },
      { playerId: 'away-10', to: { x: 60, y: 68 } },
      { playerId: 'home-7', to: { x: 78, y: 80 } },
      { playerId: 'home-11', to: { x: 22, y: 80 } },
      { playerId: 'home-10', to: { x: 57, y: 71 } },
      { playerId: 'home-6', to: { x: 50, y: 62 } },
      { playerId: 'home-8', to: { x: 44, y: 66 } },
    ],
    duration: 0.5,
  },
  {
    id: 'zone-3-supply-pass',
    cue: 'Supply pass — Pivot #6 connects with #8 while Canada’s midfield anticipates the next central pass.',
    ballFrom: { x: 52, y: 75 },
    ballTo: { x: 43, y: 68 },
    ballFromPlayerId: 'away-6',
    ballToPlayerId: 'away-8',
    playerId: 'away-8',
    playerTo: { x: 43, y: 68 },
    playerMoves: [
      { playerId: 'away-7', to: { x: 22, y: 58 } },
      { playerId: 'away-9', to: { x: 50, y: 55 } },
      { playerId: 'away-11', to: { x: 78, y: 58 } },
      { playerId: 'home-9', to: { x: 52, y: 82 } },
      { playerId: 'home-7', to: { x: 78, y: 80 } },
      { playerId: 'home-11', to: { x: 22, y: 80 } },
      { playerId: 'home-10', to: { x: 57, y: 71 } },
      { playerId: 'home-8', to: { x: 45, y: 64 } },
      { playerId: 'home-6', to: { x: 50, y: 60 } },
      { playerId: 'home-2', to: { x: 75, y: 53 } },
      { playerId: 'home-3', to: { x: 25, y: 51 } },
      { playerId: 'home-4', to: { x: 41, y: 50 } },
      { playerId: 'home-5', to: { x: 59, y: 50 } },
    ],
    duration: 0.48,
  },
  {
    id: 'zone-3-turnover',
    cue: 'Zone 3 turnover — Away #8 tries to find #10; Canada #8 reads the pass and intercepts.',
    ballFrom: { x: 43, y: 68 },
    ballTo: { x: 46, y: 64 },
    ballFromPlayerId: 'away-8',
    ballToPlayerId: 'home-8',
    playerId: 'home-8',
    playerTo: { x: 46, y: 64 },
    focusPoint: { x: 46, y: 64 },
    duration: 0.7,
  },
  {
    id: 'zone-3-regain-scan',
    cue: 'Regain pause — #8 secures the interception, opens forward, and scans before releasing.',
    playerId: 'home-8',
    playerTo: { x: 46, y: 64 },
    duration: 0.4,
  },
  {
    id: 'zone-3-ten-connects',
    cue: 'Zone 3 — #8 connects with #10 as all three Canada units squeeze forward.',
    ballFrom: { x: 46, y: 64 },
    ballTo: { x: 56, y: 70 },
    ballFromPlayerId: 'home-8',
    ballToPlayerId: 'home-10',
    playerId: 'home-10',
    playerTo: { x: 56, y: 70 },
    playerMoves: [
      { playerId: 'home-2', to: { x: 74, y: 58 } },
      { playerId: 'home-3', to: { x: 26, y: 56 } },
      { playerId: 'home-4', to: { x: 41, y: 54 } },
      { playerId: 'home-5', to: { x: 59, y: 54 } },
      { playerId: 'home-6', to: { x: 50, y: 63 } },
      { playerId: 'home-8', to: { x: 46, y: 68 } },
      { playerId: 'home-7', to: { x: 86, y: 72 } },
      { playerId: 'home-9', to: { x: 50, y: 74 } },
      { playerId: 'home-11', to: { x: 14, y: 72 } },
      { playerId: 'away-9', to: { x: 50, y: 62 } },
      { playerId: 'away-7', to: { x: 21, y: 67 } },
      { playerId: 'away-10', to: { x: 58, y: 72 } },
      { playerId: 'away-11', to: { x: 79, y: 67 } },
      { playerId: 'away-6', to: { x: 50, y: 81 } },
      { playerId: 'away-8', to: { x: 42, y: 77 } },
      { playerId: 'away-2', to: { x: 81, y: 89 } },
      { playerId: 'away-3', to: { x: 19, y: 89 } },
      { playerId: 'away-4', to: { x: 40, y: 90 } },
      { playerId: 'away-5', to: { x: 60, y: 90 } },
    ],
    duration: 0.83,
  },
  {
    id: 'zone-3-seven-released',
    cue: 'Zone 3 — #10 releases #7 into Channel 1 before the block resets.',
    ballFrom: { x: 56, y: 70 },
    ballTo: { x: 89, y: 74 },
    ballFromPlayerId: 'home-10',
    ballToPlayerId: 'home-7',
    playerId: 'home-7',
    playerTo: { x: 89, y: 74 },
    playerMoves: [
      { playerId: 'home-2', to: { x: 73, y: 62 } },
      { playerId: 'home-3', to: { x: 27, y: 60 } },
      { playerId: 'home-4', to: { x: 41, y: 58 } },
      { playerId: 'home-5', to: { x: 59, y: 58 } },
      { playerId: 'home-6', to: { x: 50, y: 67 } },
      { playerId: 'home-8', to: { x: 46, y: 71 } },
      { playerId: 'home-10', to: { x: 57, y: 74 } },
      { playerId: 'home-9', to: { x: 50, y: 77 } },
      { playerId: 'home-11', to: { x: 13, y: 76 } },
    ],
    duration: 0.62,
  },
  {
    id: 'zone-3-seven-enters',
    cue: 'Zone 4 — #7 carries forward with the midfield unit underneath.',
    ballFrom: { x: 89, y: 74 },
    ballTo: { x: 91, y: 84 },
    ballFromPlayerId: 'home-7',
    ballToPlayerId: 'home-7',
    playerId: 'home-7',
    playerTo: { x: 91, y: 84 },
    playerMoves: [
      { playerId: 'home-9', to: { x: 50, y: 85 } },
      { playerId: 'home-11', to: { x: 20, y: 82 } },
      { playerId: 'home-6', to: { x: 50, y: 70 } },
      { playerId: 'home-8', to: { x: 46, y: 74 } },
      { playerId: 'home-10', to: { x: 58, y: 78 } },
    ],
    duration: 0.52,
  },
  {
    id: 'zone-3-cross',
    cue: 'Zone 4 — #7 crosses and #9 attacks Channel 3.',
    ballFrom: { x: 91, y: 84 },
    ballTo: { x: 50, y: 88 },
    ballFromPlayerId: 'home-7',
    ballToPlayerId: 'home-9',
    playerId: 'home-9',
    playerTo: { x: 50, y: 88 },
    playerMoves: [{ playerId: 'away-1', to: { x: 50, y: 93 } }],
    duration: 0.56,
  },
  {
    id: 'zone-3-finish',
    cue: 'Finish — #9 shoots into goal; the goalkeeper reacts.',
    ballFrom: { x: 50, y: 88 },
    ballTo: { x: 50, y: 100 },
    ballFromPlayerId: 'home-9',
    playerMoves: [{ playerId: 'away-1', to: { x: 46, y: 96 } }],
    duration: 0.5,
  },
]

const zone4Steps: AttackingTransitionPageStep[] = [
  {
    id: 'zone-4-gk-distribution',
    cue: 'Opponent GK — The goalkeeper plays short to #5 as Canada initiates the high press.',
    ballFrom: { x: 50, y: 94 },
    ballTo: { x: 62, y: 87 },
    ballFromPlayerId: 'away-1',
    ballToPlayerId: 'away-5',
    playerId: 'away-5',
    playerTo: { x: 62, y: 87 },
    duration: 0.75,
  },
  {
    id: 'zone-4-front-press',
    cue: 'Pressing trap — #5 takes a touch as #9 curves the press and the wingers close outside exits.',
    focusPoint: { x: 62, y: 87 },
    playerMoves: [
      { playerId: 'home-9', to: { x: 55, y: 85 } },
      { playerId: 'home-7', to: { x: 78, y: 83 } },
      { playerId: 'home-11', to: { x: 22, y: 80 } },
    ],
    duration: 0.55,
  },
  {
    id: 'zone-4-midfield-lock',
    cue: 'Support squeeze — #10 locks the inside receiver; #6 and #8 remove the next pass.',
    focusPoint: { x: 62, y: 87 },
    playerMoves: [
      { playerId: 'home-10', to: { x: 58, y: 79 } },
      { playerId: 'home-8', to: { x: 42, y: 72 } },
      { playerId: 'home-6', to: { x: 50, y: 66 } },
    ],
    duration: 0.45,
  },
  {
    id: 'zone-4-back-line-hold',
    cue: 'Rest-defence — the back four adjust together around halfway while staying ready for the long release.',
    focusPoint: { x: 62, y: 87 },
    playerMoves: [
      { playerId: 'home-2', to: { x: 75, y: 55 } },
      { playerId: 'home-3', to: { x: 25, y: 53 } },
      { playerId: 'home-4', to: { x: 41, y: 52 } },
      { playerId: 'home-5', to: { x: 59, y: 52 } },
    ],
    duration: 0.35,
  },
  {
    id: 'zone-4-turnover',
    cue: 'Zone 4 turnover — #10 closes the inside lane and wins the pressured pass.',
    ballFrom: { x: 62, y: 87 },
    ballTo: { x: 58, y: 84 },
    ballFromPlayerId: 'away-5',
    ballToPlayerId: 'home-10',
    playerId: 'home-10',
    playerTo: { x: 58, y: 84 },
    focusPoint: { x: 58, y: 84 },
    playerMoves: [
      { playerId: 'away-5', to: { x: 61, y: 91 } },
      { playerId: 'away-9', to: { x: 50, y: 58 } },
      { playerId: 'away-7', to: { x: 21, y: 62 } },
      { playerId: 'away-10', to: { x: 58, y: 76 } },
      { playerId: 'away-11', to: { x: 79, y: 62 } },
      { playerId: 'away-6', to: { x: 50, y: 82 } },
      { playerId: 'away-8', to: { x: 40, y: 80 } },
      { playerId: 'away-2', to: { x: 81, y: 90 } },
      { playerId: 'away-3', to: { x: 19, y: 90 } },
      { playerId: 'away-4', to: { x: 40, y: 91 } },
    ],
    duration: 0.55,
  },
  {
    id: 'zone-4-regain-scan',
    cue: 'Regain pause — #10 protects the turnover, opens forward, and scans before the release.',
    playerId: 'home-10',
    playerTo: { x: 58, y: 84 },
    duration: 0.36,
  },
  {
    id: 'zone-4-seven-released',
    cue: 'Zone 4 — #10 releases #7 outside the recovering block in Channel 1.',
    ballFrom: { x: 58, y: 84 },
    ballTo: { x: 91, y: 86 },
    ballFromPlayerId: 'home-10',
    ballToPlayerId: 'home-7',
    playerId: 'home-7',
    playerTo: { x: 91, y: 86 },
    playerMoves: [
      { playerId: 'home-9', to: { x: 50, y: 88 } },
      { playerId: 'home-11', to: { x: 18, y: 86 } },
      { playerId: 'home-2', to: { x: 73, y: 63 } },
      { playerId: 'home-3', to: { x: 27, y: 61 } },
      { playerId: 'home-4', to: { x: 41, y: 59 } },
      { playerId: 'home-5', to: { x: 59, y: 59 } },
      { playerId: 'home-6', to: { x: 50, y: 74 } },
      { playerId: 'home-8', to: { x: 44, y: 80 } },
      { playerId: 'home-10', to: { x: 58, y: 87 } },
    ],
    duration: 0.75,
  },
  {
    id: 'zone-4-cross',
    cue: 'Zone 4 — #7 crosses and #9 attacks Channel 3.',
    ballFrom: { x: 91, y: 86 },
    ballTo: { x: 50, y: 89 },
    ballFromPlayerId: 'home-7',
    ballToPlayerId: 'home-9',
    playerId: 'home-9',
    playerTo: { x: 50, y: 89 },
    playerMoves: [{ playerId: 'away-1', to: { x: 50, y: 93 } }],
    duration: 0.65,
  },
  {
    id: 'zone-4-finish',
    cue: 'Finish — #9 shoots before the opponent can reorganize.',
    ballFrom: { x: 50, y: 89 },
    ballTo: { x: 50, y: 100 },
    ballFromPlayerId: 'home-9',
    playerMoves: [{ playerId: 'away-1', to: { x: 46, y: 96 } }],
    duration: 0.45,
  },
]

const commonExtraRoutes: PixiPitchPreviewRoute[] = [
  { id: 'press-nine', from: { x: 50, y: 82 }, to: { x: 55, y: 85 }, type: 'press', revealOnStepId: 'zone-4-front-press' },
  { id: 'back-line-protection', from: { x: 24, y: 50 }, to: { x: 76, y: 52 }, type: 'recovery', revealOnStepId: 'zone-4-back-line-hold' },
]

export const ATTACKING_TRANSITION_PAGE_CASES: AttackingTransitionPageCase[] = [
  previewCase({
    id: 'zone-1',
    tabLabel: 'Zone 1 turnover',
    zoneFocus: 'Zone 1 turnover',
    subtitle: 'Circulation draws the press before a direct ball is secured by Canada’s goalkeeper.',
    caption: 'The opponent circulates across the back line before playing long. Canada shifts as a unit, drops as a connected back four, regains through GK #1 in Zone 1, then counters through #2, #10, #7, and #9.',
    system: { shape: 'High press with halfway protection', description: 'The front and midfield lines press the goal kick while the back four start around halfway, connected and ready to defend the long ball.' },
    strategy: 'Protect the space behind the press, secure the direct ball, and attack quickly from the Zone 1 regain.',
    tactics: ['Opponent build-up: circulate across the centre-backs before going direct.', 'Press trigger / regain: the back four drop and GK #1 claims in Zone 1.', 'Scan and support: GK #1 sets while all three units turn forward.', 'Transition forward: release #2, connect #10, then penetrate Channel 1.'],
    coachingPoints: ['Press and shift together; #4 and #5 stay connected and slightly deeper.', 'GK #1 secures first, opens forward, then releases into support.'],
    principles: ['DISPERSAL', 'SUPPORT', 'MOBILITY', 'PENETRATION'],
    homePositions: HOME_HIGH_PRESS,
    awayPositions: AWAY_GOAL_KICK,
    initialPossessorId: 'away-1',
    distributionStepId: 'zone-1-gk-distribution',
    turnoverStepId: 'zone-1-turnover',
    regainPauseStepId: 'zone-1-regain-scan',
    steps: zone1Steps,
    routeTypes: { 'zone-1-gk-distribution': 'pass', 'zone-1-centre-back-switch': 'pass', 'zone-1-direct-ball': 'pass', 'zone-1-turnover': 'shot', 'zone-1-gk-release': 'pass', 'zone-1-ten-connects': 'pass', 'zone-1-seven-released': 'pass', 'zone-1-seven-enters': 'dribble', 'zone-1-cross': 'cross', 'zone-1-finish': 'shot' },
    extraRoutes: [
      { id: 'zone-1-back-four-drop', from: { x: 50, y: 50 }, to: { x: 50, y: 32 }, type: 'recovery', revealOnStepId: 'zone-1-direct-ball' },
      { id: 'zone-1-seven-run', from: { x: 82, y: 66 }, to: { x: 89, y: 74 }, type: 'run', revealOnStepId: 'zone-1-seven-released' },
      { id: 'zone-1-units-squeeze', from: { x: 50, y: 34 }, to: { x: 50, y: 58 }, type: 'recovery', revealOnStepId: 'zone-1-ten-connects' },
    ],
    repeatDelay: 1.5,
    tokenScale: 0.68,
  }),
  previewCase({
    id: 'zone-2',
    tabLabel: 'Zone 2 turnover',
    zoneFocus: 'Zone 2 turnover',
    subtitle: 'A short build draws pressure before Canada dominates the direct ball and knockdown.',
    caption: 'The opponent builds through centre-back and pivot before targeting #9. Canada shifts behind the press, contests the aerial ball, #6 wins the knockdown in Zone 2, and the connected units counter through #10 and #7.',
    system: { shape: 'High press with second-ball security', description: 'The front line presses the goal kick, midfield protects the landing zone, and the back four hold a connected line around halfway.' },
    strategy: 'Force the direct pass, dominate the second ball in Zone 2, and attack before the opponent recovers.',
    tactics: ['Opponent build-up: connect goalkeeper, centre-back, and pivot.', 'Press trigger / regain: contest #9 and have #6 attack the knockdown.', 'Scan and support: #6 opens forward as the units squeeze around the ball.', 'Transition forward: find #10, release Channel 1, and attack Channel 3.'],
    coachingPoints: ['Front pressure screens the short return while midfield owns the landing zone.', '#6 reads the duel early, receives side-on, and plays forward with support.'],
    principles: ['DISPERSAL', 'SUPPORT', 'MOBILITY', 'PENETRATION'],
    homePositions: HOME_HIGH_PRESS,
    awayPositions: AWAY_GOAL_KICK,
    initialPossessorId: 'away-1',
    distributionStepId: 'zone-2-gk-distribution',
    turnoverStepId: 'zone-2-turnover',
    regainPauseStepId: 'zone-2-regain-scan',
    steps: zone2Steps,
    routeTypes: { 'zone-2-gk-distribution': 'pass', 'zone-2-pivot-connection': 'pass', 'zone-2-direct-to-nine': 'pass', 'zone-2-turnover': 'pass', 'zone-2-ten-connects': 'pass', 'zone-2-seven-released': 'pass', 'zone-2-seven-enters': 'dribble', 'zone-2-cross': 'cross', 'zone-2-finish': 'shot' },
    extraRoutes: [
      { id: 'zone-2-back-four-hold', from: { x: 24, y: 50 }, to: { x: 76, y: 52 }, type: 'recovery', revealOnStepId: 'zone-2-direct-to-nine' },
      { id: 'zone-2-seven-run', from: { x: 80, y: 70 }, to: { x: 89, y: 74 }, type: 'run', revealOnStepId: 'zone-2-seven-released' },
      { id: 'zone-2-away-recovery', from: { x: 50, y: 56 }, to: { x: 50, y: 80 }, type: 'recovery', revealOnStepId: 'zone-2-ten-connects' },
    ],
    repeatDelay: 1.35,
    tokenScale: 0.68,
  }),
  previewCase({
    id: 'zone-3',
    tabLabel: 'Zone 3 turnover',
    zoneFocus: 'Zone 3 turnover',
    subtitle: 'Canada reads the next central pass after the opponent builds through its pivot.',
    caption: 'The opponent circulates from goalkeeper to centre-back, pivot, and supply player. Canada’s connected lines shift with the ball, #8 anticipates the pass into #10 and regains in Zone 3, then #10 releases the wide counter.',
    system: { shape: 'Connected high press', description: 'The front line shapes the goalkeeper’s pass, midfield locks the central receiver, and the back four squeeze just beyond halfway without abandoning long-ball protection.' },
    strategy: 'Guide circulation toward a predictable central pass, intercept in Zone 3, and penetrate Channel 1.',
    tactics: ['Opponent build-up: connect goalkeeper, centre-back, pivot, and supply player.', 'Press trigger / regain: lock #10 and have #8 intercept the central pass.', 'Scan and support: #8 opens forward while the three units squeeze together.', 'Transition forward: combine with #10 and penetrate Channel 1 before recovery.'],
    coachingPoints: ['Curve the press to keep the central destination predictable and protected.', '#8 scans the receiver and passer, steps on the cue, then opens to play forward.'],
    principles: ['DISPERSAL', 'SUPPORT', 'MOBILITY', 'PENETRATION'],
    homePositions: HOME_HIGH_PRESS,
    awayPositions: AWAY_GOAL_KICK,
    initialPossessorId: 'away-1',
    distributionStepId: 'zone-3-gk-distribution',
    turnoverStepId: 'zone-3-turnover',
    regainPauseStepId: 'zone-3-regain-scan',
    steps: zone3Steps,
    routeTypes: { 'zone-3-gk-distribution': 'pass', 'zone-3-pivot-connection': 'pass', 'zone-3-supply-pass': 'pass', 'zone-3-turnover': 'pass', 'zone-3-ten-connects': 'pass', 'zone-3-seven-released': 'pass', 'zone-3-seven-enters': 'dribble', 'zone-3-cross': 'cross', 'zone-3-finish': 'shot' },
    extraRoutes: [
      { id: 'zone-3-front-press', from: { x: 50, y: 82 }, to: { x: 53, y: 81 }, type: 'press', revealOnStepId: 'zone-3-gk-distribution' },
      { id: 'zone-3-eight-intercepts', from: { x: 45, y: 64 }, to: { x: 46, y: 64 }, type: 'press', revealOnStepId: 'zone-3-turnover' },
      { id: 'zone-3-seven-run', from: { x: 86, y: 72 }, to: { x: 89, y: 74 }, type: 'run', revealOnStepId: 'zone-3-seven-released' },
    ],
    repeatDelay: 1.25,
    tokenScale: 0.68,
  }),
  previewCase({
    id: 'zone-4',
    tabLabel: 'Zone 4 turnover',
    zoneFocus: 'Zone 4 turnover',
    subtitle: 'High press against the short goal kick',
    caption: 'The ball visibly starts with the opponent goalkeeper. Canada’s front line presses the short pass, midfield locks the inside options, the back four protect halfway, and #10 regains in Zone 4.',
    system: { shape: 'Narrow 4-3-3 goal-kick press', description: 'The front three initiate the press, midfield locks central progression, and the connected back four stay around halfway to handle a direct release.' },
    strategy: 'Allow the predictable short pass, close the inside lane in unison, and attack immediately after the Zone 4 turnover.',
    tactics: ['Opponent build-up: allow the goalkeeper’s short pass to #5.', 'Press trigger / regain: curve the press, lock inside, and force #10’s interception.', 'Scan and support: #10 protects the regain as all three units squeeze.', 'Transition forward: release Channel 1, cross, and attack Channel 3.'],
    coachingPoints: ['Curve the first press and keep the inside lane in the cover shadow.', '#10 receives the regain open to goal while the back line advances in balance.'],
    principles: ['DISPERSAL', 'SUPPORT', 'MOBILITY', 'PENETRATION'],
    homePositions: HOME_HIGH_PRESS,
    awayPositions: AWAY_GOAL_KICK,
    initialPossessorId: 'away-1',
    distributionStepId: 'zone-4-gk-distribution',
    turnoverStepId: 'zone-4-turnover',
    regainPauseStepId: 'zone-4-regain-scan',
    steps: zone4Steps,
    routeTypes: { 'zone-4-gk-distribution': 'pass', 'zone-4-turnover': 'pass', 'zone-4-seven-released': 'pass', 'zone-4-cross': 'cross', 'zone-4-finish': 'shot' },
    extraRoutes: commonExtraRoutes,
    repeatDelay: 1.15,
    tokenScale: 0.68,
  }),
]

export const ATTACKING_TRANSITION_PAGE_DEFAULT_CASE_ID: AttackingTransitionPageCase['id'] = 'zone-4'
