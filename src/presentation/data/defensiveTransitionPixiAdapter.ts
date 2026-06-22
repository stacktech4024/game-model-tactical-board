import type {
  PixiPitchPreviewProps,
  PixiPitchPreviewRoute,
  PixiPitchPreviewStep,
} from '../../renderers/pixi/PixiPitchPreview'
import {
  DEFENSIVE_TRANSITION_BALL,
  DEFENSIVE_TRANSITION_CAPTION,
  DEFENSIVE_TRANSITION_MOVEMENTS,
  DEFENSIVE_TRANSITION_PLAYERS,
  type DefensiveTransitionMovement,
} from './defensiveTransitionScenario'

type DefensiveTransitionPixiScenario = Pick<
  PixiPitchPreviewProps,
  'players' | 'ballPosition' | 'steps' | 'routes'
> & {
  caption: string
}

function getMovement(id: string): DefensiveTransitionMovement {
  const movement = DEFENSIVE_TRANSITION_MOVEMENTS.find((item) => item.id === id)

  if (!movement) {
    throw new Error(`Missing defensive transition movement: ${id}`)
  }

  return movement
}

const nearestPress = getMovement('nearest-press')
const blockEscape = getMovement('block-escape')
const sixCover = getMovement('six-cover')

const steps: PixiPitchPreviewStep[] = [
  {
    id: 'ball-lost',
    cue: 'Ball lost',
    emphasizePlayerId: 'loss-player',
    duration: 0.3,
  },
  {
    id: 'press',
    cue: 'Nearest player presses',
    playerId: nearestPress.playerId,
    playerTo: nearestPress.to,
    duration: 0.42,
  },
  {
    id: 'block',
    cue: 'Block forward escape',
    playerId: blockEscape.playerId,
    playerTo: blockEscape.to,
    duration: 0.38,
  },
  {
    id: 'cover',
    cue: '#6 protects Channel 3',
    playerId: sixCover.playerId,
    playerTo: sixCover.to,
    duration: 0.4,
  },
  {
    id: 'hold',
    cue: 'Back line holds',
    emphasizePlayerId: 'left-centre-back',
    duration: 0.32,
  },
  {
    id: 'shape-secured',
    cue: 'Compact shape secured',
    duration: 0.35,
  },
]

const routes: PixiPitchPreviewRoute[] = DEFENSIVE_TRANSITION_MOVEMENTS.map((movement) => ({
  id: movement.id,
  from: movement.from,
  to: movement.to,
  type: movement.kind,
  revealOnStepId:
    movement.id === 'nearest-press'
      ? 'press'
      : movement.id === 'block-escape'
        ? 'block'
        : 'cover',
}))

export const DEFENSIVE_TRANSITION_PIXI_SCENARIO: DefensiveTransitionPixiScenario = {
  players: DEFENSIVE_TRANSITION_PLAYERS.map((player) => ({
    id: player.id,
    label: player.label,
    x: player.start.x,
    y: player.start.y,
    tone: player.tone === 'opponent' ? 'opponent' : 'primary',
  })),
  ballPosition: DEFENSIVE_TRANSITION_BALL,
  steps,
  routes,
  caption: DEFENSIVE_TRANSITION_CAPTION,
}
