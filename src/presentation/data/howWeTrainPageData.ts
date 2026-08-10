import type { PositionalProfileId } from './positionalProfiles.ts'
import type { PixiPitchPreviewProps } from '../../renderers/pixi/PixiPitchPreview.tsx'

type PreviewPlayer = PixiPitchPreviewProps['players'][number]
type PreviewStep = NonNullable<PixiPitchPreviewProps['steps']>[number]
type PreviewRoute = NonNullable<PixiPitchPreviewProps['routes']>[number]

export type HowWeTrainExampleId =
  | 'central-wide'
  | 'wide-pressure'
  | 'press-regain'
  | 'line-break-react'

export type TrainingMoment =
  | 'Attacking Organization'
  | 'Defensive Organization'
  | 'Attacking Transition'
  | 'Defensive Transition'

export type EvidenceClassification =
  | 'DIRECT SESSION EVIDENCE'
  | 'GAME MODEL REQUIREMENT'
  | 'COACH CONFIRMATION NEEDED'

export type MethodologyStatus =
  | 'CONFIRMED'
  | 'RECOMMENDATION — COACH CONFIRMATION NEEDED'

export type EvidenceDetail = {
  value: string
  status: EvidenceClassification
}

export type HowWeTrainVisualScenario = {
  players: PreviewPlayer[]
  ballPosition: { x: number; y: number }
  steps: PreviewStep[]
  routes: PreviewRoute[]
  caption: string
}

export type HowWeTrainExample = {
  id: HowWeTrainExampleId
  tabLabel: string
  title: string
  shortPurpose: string
  moments: TrainingMoment[]
  geography: string[]
  system: string
  strategy: string
  tactics: string[]
  skillSet: string[]
  principles: string[]
  primaryPlayers: string[]
  secondaryPlayers: string[]
  sessionSource: string
  methodology: string
  methodologyStatus: MethodologyStatus
  evidenceStrength: EvidenceClassification
  gameModelPrincipleEvidence: EvidenceClassification
  gameModelPrinciple: string[]
  positionalRequirement: string[]
  trainingDesign: string
  coachingDetail: {
    who: string
    what: string
    when: string
    where: string
    why: string
    how: string
  }
  matchTransfer: string[]
  design: {
    pitch: EvidenceDetail
    parameters: EvidenceDetail
    players: EvidenceDetail
    learningIntention: EvidenceDetail
    organization: EvidenceDetail
  }
  demands: {
    reward: EvidenceDetail
    relate: EvidenceDetail
    restrict: EvidenceDetail
  }
  successIndicator: string
  profileReferences: { profileId: PositionalProfileId; label: string }[]
  relatedSkill: string
  decisionFramework?: { phase: 'PERCEIVE' | 'DECIDE' | 'EXECUTE' | 'EVALUATE'; detail: string }[]
  visualScenario: HowWeTrainVisualScenario
}

export function splitHowWeTrainVisualScenario(
  scenario: HowWeTrainVisualScenario,
): [HowWeTrainVisualScenario, HowWeTrainVisualScenario] {
  const splitIndex = Math.ceil(scenario.steps.length / 2)
  const firstSteps = scenario.steps.slice(0, splitIndex)
  const secondSteps = scenario.steps.slice(splitIndex)
  const positions = new Map(scenario.players.map((player) => [player.id, { x: player.x, y: player.y }]))
  const facings = new Map(scenario.players.map((player) => [player.id, player.facingAngle]))
  let ballPosition = { ...scenario.ballPosition }

  firstSteps.forEach((step) => {
    if (step.playerId && step.playerTo) positions.set(step.playerId, step.playerTo)
    if (step.playerId && Number.isFinite(step.facingAngle)) facings.set(step.playerId, step.facingAngle)
    step.playerMoves?.forEach((move) => {
      positions.set(move.playerId, move.to)
      if (Number.isFinite(move.facingAngle)) facings.set(move.playerId, move.facingAngle)
    })
    step.playerFacings?.forEach((facing) => facings.set(facing.playerId, facing.facingAngle))
    if (step.ballTo) ballPosition = { ...step.ballTo }
  })

  const firstStepIds = new Set(firstSteps.map((step) => step.id))
  const secondStepIds = new Set(secondSteps.map((step) => step.id))
  const secondPlayers = scenario.players.map((player) => ({
    ...player,
    ...positions.get(player.id),
    facingAngle: facings.get(player.id),
  }))

  return [
    {
      ...scenario,
      steps: firstSteps,
      routes: scenario.routes.filter((route) => !route.revealOnStepId || firstStepIds.has(route.revealOnStepId)),
    },
    {
      ...scenario,
      players: secondPlayers,
      ballPosition,
      steps: secondSteps,
      routes: scenario.routes.filter((route) => !route.revealOnStepId || secondStepIds.has(route.revealOnStepId)),
    },
  ]
}

const home = (
  id: string,
  label: string,
  x: number,
  y: number,
  facingAngle: number,
): PreviewPlayer => ({
  id,
  label,
  x,
  y,
  tone: 'primary',
  facingAngle,
})

const away = (
  id: string,
  label: string,
  x: number,
  y: number,
  facingAngle: number,
): PreviewPlayer => ({
  id,
  label,
  x,
  y,
  tone: 'opponent',
  side: 'away',
  facingAngle,
})

const goalkeeper = (
  id: string,
  side: 'home' | 'away',
  y: number,
  facingAngle: number,
): PreviewPlayer => ({
  id,
  label: '1',
  x: 50,
  y,
  tone: 'keeper',
  side,
  facingAngle,
})

function facingToward(
  from: { x: number; y: number },
  to: { x: number; y: number },
): number {
  return Math.round((Math.atan2(to.x - from.x, from.y - to.y) * 180) / Math.PI)
}

function orientRedTowardZoneFour(
  scenario: HowWeTrainVisualScenario,
): HowWeTrainVisualScenario {
  const mirrorPoint = (point: { x: number; y: number }) => ({
    x: point.x,
    y: 100 - point.y,
  })

  return {
    ...scenario,
    players: scenario.players.map((player) => ({
      ...player,
      y: 100 - player.y,
    })),
    ballPosition: mirrorPoint(scenario.ballPosition),
    steps: scenario.steps.map((step) => ({
      ...step,
      playerTo: step.playerTo ? mirrorPoint(step.playerTo) : undefined,
      playerMoves: step.playerMoves?.map((move) => ({
        ...move,
        to: mirrorPoint(move.to),
      })),
      ballFrom: step.ballFrom ? mirrorPoint(step.ballFrom) : undefined,
      ballTo: step.ballTo ? mirrorPoint(step.ballTo) : undefined,
    })),
    routes: scenario.routes.map((route) => ({
      ...route,
      from: mirrorPoint(route.from),
      to: mirrorPoint(route.to),
    })),
  }
}

function addGoalkeeperDirectionAnchors(
  scenarioId: HowWeTrainExampleId,
  scenario: HowWeTrainVisualScenario,
): HowWeTrainVisualScenario {
  const homeGoalkeeperId = `${scenarioId}-home-gk`
  const awayGoalkeeperId = `${scenarioId}-away-gk`
  const homeGoalkeeperPosition = { x: 50, y: 94 }
  const awayGoalkeeperPosition = { x: 50, y: 6 }
  let liveBallPosition = { ...scenario.ballPosition }

  const steps = scenario.steps.map((step) => {
    liveBallPosition = step.ballTo ? { ...step.ballTo } : liveBallPosition

    return {
      ...step,
      playerFacings: [
        ...(step.playerFacings ?? []),
        {
          playerId: homeGoalkeeperId,
          facingAngle: facingToward(homeGoalkeeperPosition, liveBallPosition),
        },
        {
          playerId: awayGoalkeeperId,
          facingAngle: facingToward(awayGoalkeeperPosition, liveBallPosition),
        },
      ],
    }
  })

  return {
    ...scenario,
    players: [
      goalkeeper(
        homeGoalkeeperId,
        'home',
        homeGoalkeeperPosition.y,
        facingToward(homeGoalkeeperPosition, scenario.ballPosition),
      ),
      ...scenario.players,
      goalkeeper(
        awayGoalkeeperId,
        'away',
        awayGoalkeeperPosition.y,
        facingToward(awayGoalkeeperPosition, scenario.ballPosition),
      ),
    ],
    steps,
  }
}

const direct = (value: string): EvidenceDetail => ({
  value,
  status: 'DIRECT SESSION EVIDENCE',
})

const confirmationNeeded = (value = 'Coach confirmation needed'): EvidenceDetail => ({
  value,
  status: 'COACH CONFIRMATION NEEDED',
})

const centralWideVisual: HowWeTrainVisualScenario = addGoalkeeperDirectionAnchors('central-wide', orientRedTowardZoneFour({
  players: [
    home('cw-4', '4', 40, 28, 30),
    home('cw-5', '5', 60, 28, -45),
    home('cw-6', '6', 48, 43, -55),
    home('cw-8', '8', 62, 55, -55),
    home('cw-2', '2', 87, 58, -120),
    home('cw-7', '7', 90, 78, -145),
    home('cw-n1', '10', 36, 54, -155),
    home('cw-n2', '9', 54, 70, -160),
    away('cw-a1', '9', 49, 36, -115),
    away('cw-a2', '10', 58, 46, -125),
    away('cw-a3', '6', 70, 56, -110),
    away('cw-a4', '8', 78, 68, -120),
    away('cw-a5', '7', 42, 65, 175),
    away('cw-a6', '11', 55, 82, 170),
  ],
  ballPosition: { x: 40, y: 28 },
  steps: [
    {
      id: 'cw-circulate',
      cue: 'CIRCULATE — #9 presses, #10 screens #8, and the grey midfield protects the central lane.',
      ballFrom: { x: 40, y: 28 },
      ballTo: { x: 48, y: 43 },
      playerId: 'cw-6',
      playerTo: { x: 48, y: 43 },
      facingAngle: 48,
      playerMoves: [
        { playerId: 'cw-a1', to: { x: 48, y: 39 }, facingAngle: 0 },
        { playerId: 'cw-a2', to: { x: 56, y: 43 }, startDelay: 0.08, facingAngle: -90 },
      ],
      playerFacings: [
        { playerId: 'cw-4', facingAngle: 30 },
        { playerId: 'cw-8', facingAngle: -135 },
        { playerId: 'cw-2', facingAngle: -120 },
        { playerId: 'cw-7', facingAngle: -145 },
        { playerId: 'cw-a3', facingAngle: -120 },
        { playerId: 'cw-a4', facingAngle: -124 },
        { playerId: 'cw-a5', facingAngle: 165 },
        { playerId: 'cw-a6', facingAngle: -170 },
      ],
      duration: 0.48,
    },
    {
      id: 'cw-third-player',
      cue: 'THIRD PLAYER — #6 tracks #8 while the grey back line stays half-turned to ball and runners.',
      ballFrom: { x: 48, y: 43 },
      ballTo: { x: 62, y: 55 },
      playerId: 'cw-8',
      playerTo: { x: 62, y: 55 },
      facingAngle: 72,
      playerMoves: [
        { playerId: 'cw-2', to: { x: 92, y: 64 }, facingAngle: -107 },
        { playerId: 'cw-7', to: { x: 91, y: 83 }, startDelay: 0.1, facingAngle: -134 },
        { playerId: 'cw-a3', to: { x: 68, y: 56 }, startDelay: 0.08, facingAngle: -100 },
      ],
      playerFacings: [
        { playerId: 'cw-6', facingAngle: 48 },
        { playerId: 'cw-4', facingAngle: 42 },
        { playerId: 'cw-n2', facingAngle: -148 },
        { playerId: 'cw-a1', facingAngle: 41 },
        { playerId: 'cw-a2', facingAngle: 34 },
        { playerId: 'cw-a4', facingAngle: -120 },
        { playerId: 'cw-a5', facingAngle: 150 },
        { playerId: 'cw-a6', facingAngle: 176 },
      ],
      duration: 0.5,
    },
    {
      id: 'cw-wide-release',
      cue: 'SWITCH — #8 releases #2 as the grey #8 recovers outside and the far side squeezes across.',
      ballFrom: { x: 62, y: 55 },
      ballTo: { x: 92, y: 64 },
      playerId: 'cw-2',
      playerTo: { x: 92, y: 64 },
      facingAngle: 8,
      playerMoves: [
        { playerId: 'cw-a4', to: { x: 86, y: 70 }, facingAngle: 135 },
        { playerId: 'cw-n2', to: { x: 64, y: 72 }, startDelay: 0.08, facingAngle: 106 },
      ],
      playerFacings: [
        { playerId: 'cw-8', facingAngle: 72 },
        { playerId: 'cw-7', facingAngle: 165 },
        { playerId: 'cw-6', facingAngle: 62 },
        { playerId: 'cw-a1', facingAngle: 40 },
        { playerId: 'cw-a2', facingAngle: 44 },
        { playerId: 'cw-a3', facingAngle: 65 },
        { playerId: 'cw-a5', facingAngle: 130 },
        { playerId: 'cw-a6', facingAngle: 150 },
      ],
      duration: 0.56,
    },
    {
      id: 'cw-penetrate',
      cue: 'COMBINE WIDE — #2 connects with #7 while grey defenders delay, cover inside, and protect depth.',
      ballFrom: { x: 92, y: 64 },
      ballTo: { x: 91, y: 83 },
      playerId: 'cw-7',
      playerTo: { x: 91, y: 83 },
      facingAngle: 0,
      playerMoves: [
        { playerId: 'cw-8', to: { x: 70, y: 68 }, facingAngle: 54 },
        { playerId: 'cw-6', to: { x: 56, y: 58 }, startDelay: 0.1, facingAngle: 66 },
      ],
      playerFacings: [
        { playerId: 'cw-2', facingAngle: 4 },
        { playerId: 'cw-n2', facingAngle: 52 },
        { playerId: 'cw-a1', facingAngle: 47 },
        { playerId: 'cw-a2', facingAngle: 55 },
        { playerId: 'cw-a3', facingAngle: 80 },
        { playerId: 'cw-a4', facingAngle: 160 },
        { playerId: 'cw-a5', facingAngle: 110 },
        { playerId: 'cw-a6', facingAngle: 120 },
      ],
      duration: 0.48,
    },
  ],
  routes: [
    { id: 'cw-pass-1', from: { x: 40, y: 28 }, to: { x: 48, y: 43 }, type: 'pass', revealOnStepId: 'cw-circulate' },
    { id: 'cw-pass-2', from: { x: 48, y: 43 }, to: { x: 62, y: 55 }, type: 'pass', revealOnStepId: 'cw-third-player' },
    { id: 'cw-fullback-run', from: { x: 87, y: 58 }, to: { x: 92, y: 64 }, type: 'run', revealOnStepId: 'cw-third-player' },
    { id: 'cw-switch', from: { x: 62, y: 55 }, to: { x: 92, y: 64 }, type: 'pass', revealOnStepId: 'cw-wide-release' },
    { id: 'cw-wide-combination', from: { x: 92, y: 64 }, to: { x: 91, y: 83 }, type: 'pass', revealOnStepId: 'cw-penetrate' },
  ],
  caption: 'Confirmed MD+1 6v6+2 problem: central circulation, third-player support, wide release, and Zone 4 progression.',
}))

const widePressureVisual: HowWeTrainVisualScenario = addGoalkeeperDirectionAnchors('wide-pressure', orientRedTowardZoneFour({
  players: [
    home('wp-7', '7', 72, 60, 90),
    home('wp-2', '2', 72, 45, 50),
    home('wp-6', '6', 58, 48, 68),
    home('wp-4', '4', 57, 34, 50),
    away('wp-a7', '11', 88, 60, 90),
    away('wp-a8', '8', 72, 68, 117),
    away('wp-a9', '10', 58, 62, 88),
    away('wp-a2', '2', 91, 43, -10),
  ],
  ballPosition: { x: 88, y: 60 },
  steps: [
    {
      id: 'wp-picture',
      cue: 'PICTURE — the opponent receives wide with the inside lane still protected.',
      emphasizePlayerId: 'wp-7',
      playerFacings: [
        { playerId: 'wp-7', facingAngle: 90 },
        { playerId: 'wp-2', facingAngle: 50 },
        { playerId: 'wp-6', facingAngle: 68 },
        { playerId: 'wp-4', facingAngle: 50 },
        { playerId: 'wp-a7', facingAngle: 90 },
        { playerId: 'wp-a8', facingAngle: 117 },
        { playerId: 'wp-a9', facingAngle: 88 },
        { playerId: 'wp-a2', facingAngle: -10 },
      ],
      duration: 0.35,
    },
    {
      id: 'wp-press',
      cue: 'PRESS INSIDE-OUT — #7 controls the approach and removes the next inside pass.',
      ballFrom: { x: 88, y: 60 },
      ballTo: { x: 95, y: 60 },
      playerId: 'wp-a7',
      playerTo: { x: 95, y: 60 },
      facingAngle: 90,
      playerMoves: [
        { playerId: 'wp-7', to: { x: 87, y: 60 }, facingAngle: 90 },
        { playerId: 'wp-2', to: { x: 82, y: 49 }, startDelay: 0.08, facingAngle: 50 },
        { playerId: 'wp-6', to: { x: 66, y: 50 }, startDelay: 0.12, facingAngle: 71 },
        { playerId: 'wp-4', to: { x: 64, y: 38 }, startDelay: 0.16, facingAngle: 56 },
      ],
      playerFacings: [
        { playerId: 'wp-a8', facingAngle: 128 },
        { playerId: 'wp-a9', facingAngle: 92 },
        { playerId: 'wp-a2', facingAngle: 8 },
      ],
      duration: 0.56,
    },
    {
      id: 'wp-contain',
      cue: 'DIRECT WIDE — pressure, cover, and compact shifting contain play against the touchline.',
      ballFrom: { x: 95, y: 60 },
      ballTo: { x: 96, y: 51 },
      playerId: 'wp-a2',
      playerTo: { x: 96, y: 51 },
      facingAngle: 180,
      playerMoves: [
        { playerId: 'wp-2', to: { x: 89, y: 49 }, facingAngle: 74 },
        { playerId: 'wp-7', to: { x: 91, y: 58 }, startDelay: 0.08, facingAngle: 144 },
      ],
      playerFacings: [
        { playerId: 'wp-a7', facingAngle: 174 },
        { playerId: 'wp-6', facingAngle: 88 },
        { playerId: 'wp-4', facingAngle: 68 },
        { playerId: 'wp-a8', facingAngle: 135 },
        { playerId: 'wp-a9', facingAngle: 104 },
      ],
      duration: 0.48,
    },
  ],
  routes: [
    { id: 'wp-press-route', from: { x: 72, y: 60 }, to: { x: 87, y: 60 }, type: 'press', revealOnStepId: 'wp-press' },
    { id: 'wp-cover-route', from: { x: 72, y: 45 }, to: { x: 82, y: 49 }, type: 'recovery', revealOnStepId: 'wp-press' },
    { id: 'wp-force-route', from: { x: 88, y: 60 }, to: { x: 96, y: 51 }, type: 'pass', revealOnStepId: 'wp-contain' },
  ],
  caption: 'Role illustration: inside-out pressure, secondary cover, and a connected shift that forces play toward Channel 1.',
}))

const pressRegainVisual: HowWeTrainVisualScenario = addGoalkeeperDirectionAnchors('press-regain', orientRedTowardZoneFour({
  players: [
    home('pr-7', '7', 30, 60, 53),
    home('pr-9', '9', 50, 66, -34),
    home('pr-11', '11', 70, 60, -63),
    home('pr-6', '6', 42, 46, 9),
    home('pr-8', '8', 58, 46, -25),
    home('pr-10', '10', 50, 54, -13),
    away('pr-a4', '4', 46, 72, 164),
    away('pr-a5', '5', 60, 72, -95),
    away('pr-a6', '6', 50, 58, 0),
    away('pr-a2', '2', 76, 65, -98),
  ],
  ballPosition: { x: 46, y: 72 },
  steps: [
    {
      id: 'pr-press',
      cue: 'PRESS TOGETHER — the front three coordinate angles while midfield protects underneath.',
      ballFrom: { x: 46, y: 72 },
      ballTo: { x: 50, y: 58 },
      playerId: 'pr-a6',
      playerTo: { x: 50, y: 58 },
      facingAngle: 180,
      playerMoves: [
        { playerId: 'pr-9', to: { x: 49, y: 65 }, facingAngle: 172 },
        { playerId: 'pr-7', to: { x: 38, y: 64 }, startDelay: 0.05, facingAngle: 117 },
        { playerId: 'pr-11', to: { x: 63, y: 64 }, startDelay: 0.1, facingAngle: -115 },
        { playerId: 'pr-10', to: { x: 51, y: 56 }, startDelay: 0.12, facingAngle: -27 },
        { playerId: 'pr-6', to: { x: 44, y: 50 }, startDelay: 0.16, facingAngle: 37 },
        { playerId: 'pr-8', to: { x: 58, y: 50 }, startDelay: 0.18, facingAngle: -45 },
      ],
      playerFacings: [
        { playerId: 'pr-a4', facingAngle: 164 },
        { playerId: 'pr-a5', facingAngle: -104 },
        { playerId: 'pr-a2', facingAngle: -97 },
      ],
      duration: 0.58,
    },
    {
      id: 'pr-regain',
      cue: 'REGAIN — #9 wins the next action and scans before forcing the transition.',
      ballFrom: { x: 50, y: 58 },
      ballTo: { x: 49, y: 65 },
      playerId: 'pr-9',
      playerTo: { x: 49, y: 65 },
      facingAngle: 170,
      playerMoves: [
        { playerId: 'pr-7', to: { x: 30, y: 76 }, facingAngle: 120 },
        { playerId: 'pr-6', to: { x: 43, y: 55 }, startDelay: 0.08, facingAngle: 31 },
        { playerId: 'pr-a6', to: { x: 52, y: 62 }, startDelay: 0.04, facingAngle: -45 },
        { playerId: 'pr-a4', to: { x: 47, y: 68 }, startDelay: 0.08, facingAngle: 164 },
        { playerId: 'pr-a5', to: { x: 58, y: 69 }, startDelay: 0.1, facingAngle: -116 },
        { playerId: 'pr-a2', to: { x: 72, y: 63 }, startDelay: 0.12, facingAngle: -101 },
      ],
      playerFacings: [
        { playerId: 'pr-8', facingAngle: -34 },
        { playerId: 'pr-10', facingAngle: -15 },
        { playerId: 'pr-11', facingAngle: -105 },
      ],
      duration: 0.42,
    },
    {
      id: 'pr-counter-picture',
      cue: 'COUNTER PICTURE — #9 opens toward #7 when the forward lane preserves the advantage.',
      emphasizePlayerId: 'pr-9',
      playerFacings: [
        { playerId: 'pr-9', facingAngle: -60 },
        { playerId: 'pr-7', facingAngle: 120 },
        { playerId: 'pr-11', facingAngle: -85 },
        { playerId: 'pr-8', facingAngle: -18 },
        { playerId: 'pr-10', facingAngle: -34 },
        { playerId: 'pr-a4', facingAngle: -70 },
        { playerId: 'pr-a5', facingAngle: -100 },
        { playerId: 'pr-a6', facingAngle: -48 },
        { playerId: 'pr-a2', facingAngle: -108 },
      ],
      duration: 0.38,
    },
    {
      id: 'pr-retain-picture',
      cue: 'RETAIN PICTURE — if the lane closes, #9 reopens toward #6 while #8/#10 present secure support.',
      playerFacings: [
        { playerId: 'pr-9', facingAngle: -145 },
        { playerId: 'pr-6', facingAngle: 31 },
        { playerId: 'pr-8', facingAngle: -32 },
        { playerId: 'pr-10', facingAngle: -18 },
        { playerId: 'pr-7', facingAngle: 132 },
        { playerId: 'pr-a4', facingAngle: 178 },
        { playerId: 'pr-a5', facingAngle: -145 },
        { playerId: 'pr-a6', facingAngle: -135 },
        { playerId: 'pr-a2', facingAngle: -115 },
      ],
      duration: 0.38,
    },
  ],
  routes: [
    { id: 'pr-press-9', from: { x: 50, y: 66 }, to: { x: 49, y: 65 }, type: 'press', revealOnStepId: 'pr-press' },
    { id: 'pr-press-7', from: { x: 30, y: 60 }, to: { x: 38, y: 64 }, type: 'press', revealOnStepId: 'pr-press' },
    { id: 'pr-press-11', from: { x: 70, y: 60 }, to: { x: 63, y: 64 }, type: 'press', revealOnStepId: 'pr-press' },
    { id: 'pr-counter-option', from: { x: 49, y: 65 }, to: { x: 30, y: 76 }, type: 'pass', revealOnStepId: 'pr-counter-picture' },
    { id: 'pr-retain-option', from: { x: 49, y: 65 }, to: { x: 43, y: 55 }, type: 'recovery', revealOnStepId: 'pr-retain-picture' },
  ],
  caption: 'Role illustration: coordinated pressure, regain, scan, and the live counter-or-retain decision.',
}))

const lineBreakReactVisual: HowWeTrainVisualScenario = addGoalkeeperDirectionAnchors('line-break-react', orientRedTowardZoneFour({
  players: [
    home('lr-6', '6', 42, 40, 21),
    home('lr-8', '8', 58, 46, -111),
    home('lr-10', '10', 51, 64, -70),
    home('lr-7', '7', 24, 68, 147),
    home('lr-9', '9', 58, 82, -165),
    away('lr-a6', '6', 48, 54, -160),
    away('lr-a8', '8', 61, 57, -113),
    away('lr-a4', '4', 43, 75, 178),
    away('lr-a5', '5', 62, 75, -170),
  ],
  ballPosition: { x: 42, y: 40 },
  steps: [
    {
      id: 'lr-create',
      cue: 'CREATE THE LANE — movement before the pass separates the midfield line.',
      playerMoves: [
        { playerId: 'lr-10', to: { x: 56, y: 65 }, facingAngle: -60 },
        { playerId: 'lr-7', to: { x: 20, y: 74 }, startDelay: 0.08, facingAngle: 147 },
        { playerId: 'lr-9', to: { x: 62, y: 85 }, startDelay: 0.12, facingAngle: -154 },
        { playerId: 'lr-a6', to: { x: 45, y: 56 }, startDelay: 0.1, facingAngle: -169 },
      ],
      playerFacings: [
        { playerId: 'lr-6', facingAngle: 21 },
        { playerId: 'lr-8', facingAngle: -110 },
        { playerId: 'lr-a8', facingAngle: -104 },
        { playerId: 'lr-a4', facingAngle: 178 },
        { playerId: 'lr-a5', facingAngle: -170 },
      ],
      duration: 0.46,
    },
    {
      id: 'lr-break',
      cue: 'BREAK THE LINE — #6 uses body shape and pass weight to find #10 beyond pressure.',
      ballFrom: { x: 42, y: 40 },
      ballTo: { x: 56, y: 65 },
      playerId: 'lr-10',
      playerTo: { x: 56, y: 65 },
      facingAngle: 20,
      playerMoves: [
        { playerId: 'lr-8', to: { x: 63, y: 54 }, facingAngle: -32 },
        { playerId: 'lr-a8', to: { x: 59, y: 62 }, startDelay: 0.08, facingAngle: -45 },
      ],
      playerFacings: [
        { playerId: 'lr-6', facingAngle: 21 },
        { playerId: 'lr-9', facingAngle: -163 },
        { playerId: 'lr-7', facingAngle: 143 },
        { playerId: 'lr-a6', facingAngle: 14 },
        { playerId: 'lr-a4', facingAngle: 175 },
        { playerId: 'lr-a5', facingAngle: -160 },
      ],
      duration: 0.52,
    },
    {
      id: 'lr-loss',
      cue: 'LOSS — the next action turns over and the nearest players recognize the transition immediately.',
      ballFrom: { x: 56, y: 65 },
      ballTo: { x: 59, y: 62 },
      playerId: 'lr-a8',
      playerTo: { x: 59, y: 62 },
      facingAngle: 145,
      playerFacings: [
        { playerId: 'lr-10', facingAngle: 135 },
        { playerId: 'lr-8', facingAngle: -27 },
        { playerId: 'lr-6', facingAngle: 38 },
        { playerId: 'lr-7', facingAngle: 96 },
        { playerId: 'lr-a6', facingAngle: 24 },
        { playerId: 'lr-a4', facingAngle: 138 },
        { playerId: 'lr-a5', facingAngle: -142 },
      ],
      duration: 0.34,
    },
    {
      id: 'lr-react',
      cue: 'REACT — #10 pressures, #8 covers, and the supporting unit restores connection behind the ball.',
      playerMoves: [
        { playerId: 'lr-10', to: { x: 58, y: 63 }, facingAngle: 135 },
        { playerId: 'lr-8', to: { x: 57, y: 57 }, startDelay: 0.06, facingAngle: 22 },
        { playerId: 'lr-6', to: { x: 47, y: 51 }, startDelay: 0.1, facingAngle: 48 },
        { playerId: 'lr-7', to: { x: 28, y: 67 }, startDelay: 0.14, facingAngle: 99 },
      ],
      playerFacings: [
        { playerId: 'lr-a8', facingAngle: 145 },
        { playerId: 'lr-a4', facingAngle: 145 },
        { playerId: 'lr-a5', facingAngle: -160 },
        { playerId: 'lr-a6', facingAngle: 32 },
        { playerId: 'lr-9', facingAngle: -150 },
      ],
      duration: 0.5,
    },
  ],
  routes: [
    { id: 'lr-line-break', from: { x: 42, y: 40 }, to: { x: 56, y: 65 }, type: 'pass', revealOnStepId: 'lr-break' },
    { id: 'lr-turnover', from: { x: 56, y: 65 }, to: { x: 59, y: 62 }, type: 'pass', revealOnStepId: 'lr-loss' },
    { id: 'lr-pressure', from: { x: 56, y: 65 }, to: { x: 58, y: 63 }, type: 'press', revealOnStepId: 'lr-react' },
    { id: 'lr-cover', from: { x: 63, y: 54 }, to: { x: 57, y: 57 }, type: 'recovery', revealOnStepId: 'lr-react' },
  ],
  caption: 'Role illustration: create the lane, break the line, lose possession, and apply immediate pressure with cover.',
}))

export const HOW_WE_TRAIN_DEFAULT_EXAMPLE_ID: HowWeTrainExampleId = 'central-wide'

export const HOW_WE_TRAIN_EXAMPLES: HowWeTrainExample[] = [
  {
    id: 'central-wide',
    tabLabel: 'Central → Wide',
    title: 'Central → Wide Progression',
    shortPurpose: 'Move the opponent centrally, then release the free wide player without increasing the MD+1 load.',
    moments: ['Attacking Organization'],
    geography: ['Zone 2 — Unbalance', 'Zone 3 — Supply', 'toward Zone 4 — Penetrate', 'Channel 1 — Wide'],
    system: '1-4-4-2',
    strategy: 'Circulate calmly, recognize closed central access, switch the point of attack, and progress through the wide channel.',
    tactics: ['Circulate to draw pressure', 'Use third-player support', 'Release wide when the centre closes', 'Combine toward Zone 4'],
    skillSet: ['Scanning', 'Body shape', 'First touch', 'One/two-touch play', 'Line-breaking pass', 'Wide combination'],
    principles: ['DISPERSAL', 'SUPPORT', 'MOBILITY', 'PENETRATION'],
    primaryPlayers: ['GK', 'CBs', '#6/#8/#10', 'Fullbacks', 'Wide Players'],
    secondaryPlayers: ['#9 / finishing support'],
    sessionSource: 'MD+1',
    methodology: 'Whole',
    methodologyStatus: 'CONFIRMED',
    evidenceStrength: 'DIRECT SESSION EVIDENCE',
    gameModelPrincipleEvidence: 'GAME MODEL REQUIREMENT',
    gameModelPrinciple: ['Calm possession', 'Recognize closed central access', 'Switch the point of attack', 'Progress wide toward Zone 4'],
    positionalRequirement: ['Scan before receiving', 'Receive open', 'Provide third-player support', 'Release and combine in Channel 1'],
    trainingDesign: 'Recovery plus a Whole 6v6+2 environment that preserves perception and decision making through high-touch, low-load technical/tactical reinforcement.',
    coachingDetail: {
      who: 'Ball carrier, third player, wide receiver, supporting unit',
      what: 'Scan, receive open, circulate, break or switch',
      when: 'Central lane closes or pressure commits',
      where: 'Zones 2/3 into Channel 1 toward Zone 4',
      why: 'Move the opponent and open progression',
      how: 'One/two-touch play, third-player support, wide release',
    },
    matchTransfer: ['CIRCULATE', 'DRAW PRESSURE', 'SWITCH', 'COMBINE WIDE', 'PENETRATE'],
    design: {
      pitch: confirmationNeeded('Central-to-wide game-related area; exact dimensions — Coach confirmation needed'),
      parameters: direct('60–75 minutes · RPE 2–3 · low physical load · high touch volume · no tackling/heavy interceptions'),
      players: direct('6v6+2'),
      learningIntention: direct('Scanning, body shape, first touch, line-breaking, third-player release, and central-to-wide recognition'),
      organization: direct('Whole 6v6+2 with wide combination / finishing incentives'),
    },
    demands: {
      reward: direct('Wide combination / finishing incentives'),
      relate: direct('Recognize when central pressure opens the wide progression route'),
      restrict: direct('One/two-touch play; no tackling / heavy interceptions'),
    },
    successIndicator: 'Players circulate, draw pressure, recognize the switch, and arrive wide with connected support.',
    profileReferences: [
      { profileId: 'goalkeeper', label: 'Goalkeeper #1' },
      { profileId: 'centre-backs', label: 'Centre Backs #4/#5' },
      { profileId: 'fullbacks', label: 'Fullbacks #2/#3' },
      { profileId: 'central-midfield', label: 'Central Midfield #6/#8' },
      { profileId: 'wide-players', label: 'Wide Players #7/#11' },
    ],
    relatedSkill: 'Fullback wide release',
    visualScenario: centralWideVisual,
  },
  {
    id: 'wide-pressure',
    tabLabel: 'Wide Pressure',
    title: 'Wide Pressure / Force Outside',
    shortPurpose: 'Protect the inside first, then turn wide pressure into a connected team action.',
    moments: ['Defensive Organization'],
    geography: ['Channel 1 — Wide', 'deny Channel 2 — Half Space', 'deny Channel 3 — Central'],
    system: '1-4-2-3-1',
    strategy: 'Protect the inside first, deny Channels 2–3, and direct the opponent toward Channel 1/touchline.',
    tactics: ['Press inside-out', 'Protect the next inside lane', 'Provide secondary cover', 'Shift as a compact unit'],
    skillSet: ['Approach angle', 'Low body position', 'Side shuffle', 'Controlled pressure', 'Cover', 'Communication'],
    principles: ['DENY', 'DELAY', 'DIRECT', 'BALANCE', 'CONTROL & RESTRAINT'],
    primaryPlayers: ['#7/#11', 'Fullbacks'],
    secondaryPlayers: ['#6/#8', 'Covering CB'],
    sessionSource: 'Practice Session 8',
    methodology: 'Progressive',
    methodologyStatus: 'RECOMMENDATION — COACH CONFIRMATION NEEDED',
    evidenceStrength: 'DIRECT SESSION EVIDENCE',
    gameModelPrincipleEvidence: 'GAME MODEL REQUIREMENT',
    gameModelPrinciple: ['Protect inside first', 'Deny Channels 2–3', 'Direct play toward Channel 1 and the touchline'],
    positionalRequirement: ['Control the approach angle', 'Use a low body position and side shuffle', 'Provide secondary cover', 'Shift as a compact unit'],
    trainingDesign: 'Progress from the individual pressure angle to support/cover and then connected unit defending. Formal methodology requires coach confirmation.',
    coachingDetail: {
      who: 'Nearest wide player, fullback, pivot, covering CB',
      what: 'Press inside-out and protect the next inside lane',
      when: 'Opponent receives in a controllable wide picture',
      where: 'Channel 1 / touchline',
      why: 'Deny central progression',
      how: 'Controlled approach, side shuffle, cover, connected shift',
    },
    matchTransfer: ['PRESS', 'PROTECT INSIDE', 'DIRECT WIDE', 'CONTAIN / REGAIN'],
    design: {
      pitch: confirmationNeeded(),
      parameters: confirmationNeeded(),
      players: confirmationNeeded('Role relationships identified; exact formal player count — Coach confirmation needed'),
      learningIntention: direct('Pressure the ball carrier, reduce time/space, force one direction, cover, and deny line-breaking passes'),
      organization: confirmationNeeded('Progressive individual → support/cover → connected unit recommendation — Coach confirmation needed'),
    },
    demands: {
      reward: confirmationNeeded(),
      relate: confirmationNeeded(),
      restrict: confirmationNeeded(),
    },
    successIndicator: 'The nearest player presses under control while the unit protects inside access and contains or regains wide.',
    profileReferences: [
      { profileId: 'wide-players', label: 'Wide Players #7/#11' },
      { profileId: 'fullbacks', label: 'Fullbacks #2/#3' },
      { profileId: 'central-midfield', label: 'Central Midfield #6/#8' },
      { profileId: 'centre-backs', label: 'Centre Backs #4/#5' },
    ],
    relatedSkill: 'Fullback wide duel',
    visualScenario: widePressureVisual,
  },
  {
    id: 'press-regain',
    tabLabel: 'Press → Regain',
    title: 'Press → Regain → Counter or Retain',
    shortPurpose: 'Coordinate the regain, then exploit advantage without forcing a low-quality transition.',
    moments: ['Defensive Organization', 'Attacking Transition'],
    geography: ['Selected pressure area', 'Exact Zone — Coach confirmation needed'],
    system: 'Coach confirmation needed',
    strategy: 'Press together, regain with connected support, then counter when advantage exists or retain and switch when it does not.',
    tactics: ['Front three press together', 'Midfield protects underneath', 'Scan immediately after regain', 'Counter or secure based on advantage'],
    skillSet: ['Pressure angle', 'Compact support', 'Regain action', 'Early scan', 'First-forward pass', 'Secure pass'],
    principles: ['DENY', 'DIRECT', 'SUPPORT', 'PENETRATION', 'IMPROVISATION'],
    primaryPlayers: ['#7', '#9', '#11'],
    secondaryPlayers: ['#6', '#8', '#10'],
    sessionSource: 'Practice Session 8 · supported by Practice Session 5',
    methodology: 'Whole-Part-Whole',
    methodologyStatus: 'RECOMMENDATION — COACH CONFIRMATION NEEDED',
    evidenceStrength: 'DIRECT SESSION EVIDENCE',
    gameModelPrincipleEvidence: 'GAME MODEL REQUIREMENT',
    gameModelPrinciple: ['Coordinate pressure', 'Regain with support', 'Counter when advantage exists', 'Retain when the counter is unavailable'],
    positionalRequirement: ['Front three initiate together', 'Midfield protects and supports', 'Scan immediately after regain', 'Identify first-forward and secure outlets'],
    trainingDesign: 'Game-related pressing and regain problem with a live first decision: counter into advantage or secure possession before switching.',
    coachingDetail: {
      who: 'Front three initiate; midfield protects and supports',
      what: 'Press together, regain, then counter or retain',
      when: 'Recognized press cue and immediately after regain',
      where: 'Selected pressure area; exact Zone unconfirmed',
      why: 'Exploit disorder without forcing poor transition',
      how: 'Coordinated angles, compact support, early scan after regain',
    },
    matchTransfer: ['PRESS TOGETHER', 'REGAIN', 'ADVANTAGE?', 'YES — COUNTER QUICKLY', 'NO — SECURE / SWITCH'],
    design: {
      pitch: confirmationNeeded('Selected pressure area; exact Zone and dimensions — Coach confirmation needed'),
      parameters: confirmationNeeded(),
      players: confirmationNeeded('Role relationships identified; exact formal player count — Coach confirmation needed'),
      learningIntention: direct('Coordinate pressure, regain, identify the first-forward option and support outlet, then counter or retain'),
      organization: confirmationNeeded('Whole-Part-Whole recommendation — Coach confirmation needed'),
    },
    demands: {
      reward: confirmationNeeded(),
      relate: confirmationNeeded(),
      restrict: confirmationNeeded(),
    },
    successIndicator: 'The unit regains together and the first action preserves the available advantage instead of forcing play.',
    profileReferences: [
      { profileId: 'wide-players', label: 'Wide Players #7/#11' },
      { profileId: 'striker', label: 'Striker #9' },
      { profileId: 'attacking-midfielder', label: 'Attacking Midfielder #10' },
      { profileId: 'central-midfield', label: 'Central Midfield #6/#8' },
    ],
    relatedSkill: 'Fullback transition balance',
    decisionFramework: [
      { phase: 'PERCEIVE', detail: 'Recognize the press/regain picture' },
      { phase: 'DECIDE', detail: 'Counter or retain' },
      { phase: 'EXECUTE', detail: 'First action' },
      { phase: 'EVALUATE', detail: 'Was the advantage preserved?' },
    ],
    visualScenario: pressRegainVisual,
  },
  {
    id: 'line-break-react',
    tabLabel: 'Line Break + React',
    title: 'Line-Breaking + Immediate Reaction',
    shortPurpose: 'Progress through a prepared receiver while keeping the nearest response connected if possession turns over.',
    moments: ['Attacking Organization', 'Defensive Transition'],
    geography: ['Between / beyond opposition lines', 'Exact Zone — Coach confirmation needed'],
    system: 'Coach confirmation needed',
    strategy: 'Create the lane with off-ball movement, break the line with the correct pass, and react immediately if the next action is lost.',
    tactics: ['Move before the pass', 'Prepare the receiver to play forward', 'Break the line with correct weight', 'Pressure and cover immediately after loss'],
    skillSet: ['Scanning', 'Off-ball movement', 'Body shape', 'Pass weight', 'Line-breaking pass', 'Immediate pressure'],
    principles: ['SUPPORT', 'MOBILITY', 'PENETRATION', 'DENY', 'DELAY'],
    primaryPlayers: ['Midfield', 'Wide Players', '#9/#10'],
    secondaryPlayers: ['Nearest supporting unit after loss'],
    sessionSource: 'Practice Session 5',
    methodology: 'Whole-Part-Whole',
    methodologyStatus: 'RECOMMENDATION — COACH CONFIRMATION NEEDED',
    evidenceStrength: 'DIRECT SESSION EVIDENCE',
    gameModelPrincipleEvidence: 'GAME MODEL REQUIREMENT',
    gameModelPrinciple: ['Circulate to create the lane', 'Break opposition lines', 'Remain connected', 'React immediately after loss'],
    positionalRequirement: ['Move before the pass', 'Receive with forward body shape', 'Use correct pass weight', 'Apply immediate pressure and cover after turnover'],
    trainingDesign: 'Game-related line-breaking problem that preserves the turnover and immediate regain response instead of ending at the forward pass.',
    coachingDetail: {
      who: 'Passer, receiver, support players, nearest player after loss',
      what: 'Create the lane, break the line, immediately react on loss',
      when: 'Receiver is prepared to play forward; immediately after turnover',
      where: 'Between / beyond opposition lines',
      why: 'Progress while remaining connected',
      how: 'Movement before pass, correct body shape, immediate pressure/cover',
    },
    matchTransfer: ['CREATE LANE', 'BREAK LINE', 'LOSS?', 'IMMEDIATE PRESSURE / RECOVERY'],
    design: {
      pitch: confirmationNeeded(),
      parameters: confirmationNeeded(),
      players: confirmationNeeded('Role relationships identified; exact formal player count — Coach confirmation needed'),
      learningIntention: direct('Circulation, off-ball movement, body shape, pass weight, line-breaking, and immediate regain reaction'),
      organization: confirmationNeeded('Whole-Part-Whole recommendation — Coach confirmation needed'),
    },
    demands: {
      reward: confirmationNeeded(),
      relate: confirmationNeeded(),
      restrict: confirmationNeeded(),
    },
    successIndicator: 'The receiver can play forward and the nearest unit applies immediate pressure and cover when the next action is lost.',
    profileReferences: [
      { profileId: 'central-midfield', label: 'Central Midfield #6/#8' },
      { profileId: 'attacking-midfielder', label: 'Attacking Midfielder #10' },
      { profileId: 'wide-players', label: 'Wide Players #7/#11' },
      { profileId: 'striker', label: 'Striker #9' },
    ],
    relatedSkill: 'Fullback transition reaction',
    visualScenario: lineBreakReactVisual,
  },
]

export function getHowWeTrainExample(id: HowWeTrainExampleId): HowWeTrainExample {
  const example = HOW_WE_TRAIN_EXAMPLES.find((item) => item.id === id)

  if (!example) {
    throw new Error(`Missing How We Train example ${id}`)
  }

  return example
}
