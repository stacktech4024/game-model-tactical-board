import type {
  PixiPitchPreviewProps,
  PixiPitchPreviewRoute,
  PixiPitchPreviewStep,
} from '../../renderers/pixi/PixiPitchPreview'
import {
  CORNER_PREVIEW_BALL_START,
  CORNER_PREVIEW_CAPTION,
  CORNER_PREVIEW_MOVEMENTS,
  CORNER_PREVIEW_PLAYERS,
  type CornerPreviewMovement,
} from './cornerScenario'

type CornerPixiScenario = Pick<
  PixiPitchPreviewProps,
  'players' | 'ballPosition' | 'steps' | 'routes'
> & {
  caption: string
}

function getMovement(id: string): CornerPreviewMovement {
  const movement = CORNER_PREVIEW_MOVEMENTS.find((item) => item.id === id)

  if (!movement) {
    throw new Error(`Missing corner preview movement: ${id}`)
  }

  return movement
}

const shortTouch = getMovement('short-touch')
const crossIn = getMovement('cross-in')
const secondBallSupport = getMovement('second-ball-support')
const nineAttacks = getMovement('nine-attacks')
const headerFinish = getMovement('header-finish')

const steps: PixiPitchPreviewStep[] = [
  {
    id: 'short-touch',
    cue: 'Short touch decoy',
    ballFrom: shortTouch.from,
    ballTo: shortTouch.to,
    duration: 0.35,
  },
  {
    id: 'cross-in',
    cue: 'Cross into the corridor',
    ballFrom: crossIn.from,
    ballTo: crossIn.to,
    playerId: secondBallSupport.playerId,
    playerTo: secondBallSupport.to,
    duration: 0.7,
  },
  {
    id: 'nine-arrives',
    cue: '#9 attacks the corridor',
    playerId: nineAttacks.playerId,
    playerTo: nineAttacks.to,
    duration: 0.55,
  },
  {
    id: 'header',
    cue: 'Header on goal',
    ballFrom: headerFinish.from,
    ballTo: headerFinish.to,
    emphasizePlayerId: 'nine',
    emphasisCue: 'Header!',
    duration: 0.4,
  },
  {
    id: 'goal',
    cue: 'Goal',
    emphasizePlayerId: 'nine',
    duration: 0.3,
  },
]

const REVEAL_STEP_BY_MOVEMENT_ID: Record<string, string> = {
  'short-touch': 'short-touch',
  'cross-in': 'cross-in',
  'second-ball-support': 'cross-in',
  'nine-attacks': 'nine-arrives',
  'header-finish': 'header',
}

const routes: PixiPitchPreviewRoute[] = CORNER_PREVIEW_MOVEMENTS.map((movement) => ({
  id: movement.id,
  from: movement.from,
  to: movement.to,
  type: movement.kind === 'support' ? 'recovery' : movement.kind,
  revealOnStepId: REVEAL_STEP_BY_MOVEMENT_ID[movement.id],
}))

export const CORNER_PIXI_SCENARIO: CornerPixiScenario = {
  players: CORNER_PREVIEW_PLAYERS.map((player) => ({
    id: player.id,
    label: player.label,
    x: player.start.x,
    y: player.start.y,
    tone: player.tone === 'opponent' || player.tone === 'keeper' ? player.tone : 'primary',
  })),
  ballPosition: CORNER_PREVIEW_BALL_START,
  steps,
  routes,
  caption: CORNER_PREVIEW_CAPTION,
}
