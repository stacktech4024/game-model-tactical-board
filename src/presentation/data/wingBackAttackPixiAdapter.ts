import type {
  PixiPitchPreviewProps,
  PixiPitchPreviewRoute,
  PixiPitchPreviewStep,
} from '../../renderers/pixi/PixiPitchPreview'
import {
  WING_BACK_PREVIEW_BALL_START,
  WING_BACK_PREVIEW_CAPTION,
  WING_BACK_PREVIEW_MOVEMENTS,
  WING_BACK_PREVIEW_PLAYERS,
  type WingBackPreviewMovement,
} from './wingBackAttackScenario'

type WingBackAttackPixiScenario = Pick<
  PixiPitchPreviewProps,
  'players' | 'ballPosition' | 'steps' | 'routes'
> & {
  caption: string
}

function getMovement(id: string): WingBackPreviewMovement {
  const movement = WING_BACK_PREVIEW_MOVEMENTS.find((item) => item.id === id)

  if (!movement) {
    throw new Error(`Missing wing-back preview movement: ${id}`)
  }

  return movement
}

const releaseLeft = getMovement('release-left')
const rightWingBackHigh = getMovement('right-wing-back-high')
const leftWingBackCarries = getMovement('left-wing-back-carries')
const combineCentral = getMovement('combine-central')
const tenArrives = getMovement('ten-arrives')
const finish = getMovement('finish')

const steps: PixiPitchPreviewStep[] = [
  {
    id: 'secure-base',
    cue: 'Secure base',
    emphasizePlayerId: 'centre-back',
    duration: 0.22,
  },
  {
    id: 'release-left',
    cue: 'Release left wing-back',
    ballFrom: releaseLeft.from,
    ballTo: releaseLeft.to,
    playerId: rightWingBackHigh.playerId,
    playerTo: rightWingBackHigh.to,
    duration: 0.6,
  },
  {
    id: 'lwb-carries',
    cue: 'Left wing-back carries forward',
    ballFrom: leftWingBackCarries.from,
    ballTo: leftWingBackCarries.to,
    playerId: leftWingBackCarries.playerId,
    playerTo: leftWingBackCarries.to,
    duration: 0.65,
  },
  {
    id: 'combine-central',
    cue: 'Combine centrally',
    ballFrom: combineCentral.from,
    ballTo: combineCentral.to,
    playerId: tenArrives.playerId,
    playerTo: tenArrives.to,
    duration: 0.6,
  },
  {
    id: 'finish',
    cue: 'Finish',
    ballFrom: finish.from,
    ballTo: finish.to,
    emphasizePlayerId: 'ten',
    emphasisCue: 'Finish!',
    duration: 0.5,
  },
  {
    id: 'goal',
    cue: 'Goal',
    emphasizePlayerId: 'ten',
    duration: 0.3,
  },
]

const REVEAL_STEP_BY_MOVEMENT_ID: Record<string, string> = {
  'release-left': 'release-left',
  'right-wing-back-high': 'release-left',
  'left-wing-back-carries': 'lwb-carries',
  'combine-central': 'combine-central',
  'ten-arrives': 'combine-central',
  finish: 'finish',
}

const routes: PixiPitchPreviewRoute[] = WING_BACK_PREVIEW_MOVEMENTS.map((movement) => ({
  id: movement.id,
  from: movement.from,
  to: movement.to,
  type: movement.kind === 'support' ? 'recovery' : movement.kind,
  revealOnStepId: REVEAL_STEP_BY_MOVEMENT_ID[movement.id],
}))

export const WING_BACK_ATTACK_PIXI_SCENARIO: WingBackAttackPixiScenario = {
  players: WING_BACK_PREVIEW_PLAYERS.map((player) => ({
    id: player.id,
    label: player.label,
    x: player.start.x,
    y: player.start.y,
    tone: player.tone === 'opponent' ? 'opponent' : 'primary',
  })),
  ballPosition: WING_BACK_PREVIEW_BALL_START,
  steps,
  routes,
  caption: WING_BACK_PREVIEW_CAPTION,
}
