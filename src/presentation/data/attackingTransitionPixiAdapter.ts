import type {
  PixiPitchPreviewProps,
  PixiPitchPreviewRoute,
  PixiPitchPreviewStep,
} from '../../renderers/pixi/PixiPitchPreview'
import {
  ATTACKING_TRANSITION_BALL_START,
  ATTACKING_TRANSITION_CAPTION,
  ATTACKING_TRANSITION_MOVEMENTS,
  ATTACKING_TRANSITION_PLAYERS,
  type AttackingTransitionMovement,
} from './attackingTransitionScenario'

type AttackingTransitionPixiScenario = Pick<
  PixiPitchPreviewProps,
  'players' | 'ballPosition' | 'steps' | 'routes'
> & {
  caption: string
}

function getMovement(id: string): AttackingTransitionMovement {
  const movement = ATTACKING_TRANSITION_MOVEMENTS.find((item) => item.id === id)

  if (!movement) {
    throw new Error(`Missing attacking transition movement: ${id}`)
  }

  return movement
}

const firstPass = getMovement('first-pass')
const runnerMovements = [
  getMovement('nine-stretch'),
  getMovement('left-run'),
  getMovement('right-run'),
]
const supportMovement = getMovement('eight-support')

const steps: PixiPitchPreviewStep[] = [
  {
    id: 'regain',
    cue: 'Regain',
    emphasizePlayerId: 'regainer',
    duration: 0.2,
  },
  {
    id: 'release',
    cue: 'Forward first — runners go',
    ballFrom: firstPass.from,
    ballTo: firstPass.to,
    playerMoves: runnerMovements.flatMap((movement) =>
      movement.playerId ? [{ playerId: movement.playerId, to: movement.to }] : [],
    ),
    duration: 0.68,
  },
  {
    id: 'support',
    cue: 'Support underneath',
    playerId: supportMovement.playerId,
    playerTo: supportMovement.to,
    duration: 0.42,
  },
  {
    id: 'shape-formed',
    cue: 'Counter shape formed',
    duration: 0.4,
  },
]

const routes: PixiPitchPreviewRoute[] = ATTACKING_TRANSITION_MOVEMENTS.map((movement) => ({
  id: movement.id,
  from: movement.from,
  to: movement.to,
  type: movement.kind === 'support' ? 'recovery' : movement.kind,
  revealOnStepId: movement.id === 'eight-support' ? 'support' : 'release',
}))

export const ATTACKING_TRANSITION_PIXI_SCENARIO: AttackingTransitionPixiScenario = {
  players: ATTACKING_TRANSITION_PLAYERS.map((player) => ({
    id: player.id,
    label: player.label,
    x: player.start.x,
    y: player.start.y,
    tone: player.tone === 'opponent' ? 'opponent' : 'primary',
  })),
  ballPosition: ATTACKING_TRANSITION_BALL_START,
  steps,
  routes,
  caption: ATTACKING_TRANSITION_CAPTION,
}
