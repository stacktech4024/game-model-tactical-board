import type {
  PixiPitchPreviewProps,
  PixiPitchPreviewRoute,
  PixiPitchPreviewStep,
} from '../../renderers/pixi/PixiPitchPreview'
import {
  WING_BACK_ATTACK_BALL_START,
  WING_BACK_ATTACK_CAPTION,
  WING_BACK_ATTACK_MOVEMENTS,
  WING_BACK_ATTACK_PLAYERS,
  type WingBackAttackMovement,
} from './wingBackAttackScenario'

type WingBackAttackPixiScenario = Pick<
  PixiPitchPreviewProps,
  'players' | 'ballPosition' | 'steps' | 'routes'
> & {
  caption: string
}

function getMovement(id: string): WingBackAttackMovement {
  const movement = WING_BACK_ATTACK_MOVEMENTS.find((item) => item.id === id)

  if (!movement) {
    throw new Error(`Missing wing-back-attack movement: ${id}`)
  }

  return movement
}

const releaseLeftWingBack = getMovement('release-left-wing-back')
const leftWingBackHigh = getMovement('left-wing-back-high')
const rightWingBackHigh = getMovement('right-wing-back-high')
const eightSupport = getMovement('eight-support')
const wideToTen = getMovement('wide-to-ten')
const tenToNine = getMovement('ten-to-nine')

const steps: PixiPitchPreviewStep[] = [
  {
    id: 'secure-base',
    cue: 'Secure base',
    emphasizePlayerId: 'centre-back',
    duration: 0.22,
  },
  {
    id: 'release-wing-backs',
    cue: 'Release wing-backs',
    ballFrom: releaseLeftWingBack.from,
    ballTo: releaseLeftWingBack.to,
    playerMoves: [
      { playerId: leftWingBackHigh.playerId!, to: leftWingBackHigh.to },
      { playerId: rightWingBackHigh.playerId!, to: rightWingBackHigh.to },
    ],
    duration: 0.7,
  },
  {
    id: 'combine-centrally',
    cue: 'Combine centrally',
    ballFrom: wideToTen.from,
    ballTo: wideToTen.to,
    playerId: eightSupport.playerId,
    playerTo: eightSupport.to,
    duration: 0.6,
  },
  {
    id: 'wing-back-finish',
    cue: 'Finish',
    ballFrom: tenToNine.from,
    ballTo: tenToNine.to,
    emphasizePlayerId: 'nine',
    duration: 0.5,
  },
]

const routes: PixiPitchPreviewRoute[] = WING_BACK_ATTACK_MOVEMENTS.map((movement) => ({
  id: movement.id,
  from: movement.from,
  to: movement.to,
  type: movement.kind === 'support' ? 'recovery' : movement.kind,
  revealOnStepId:
    movement.id === 'release-left-wing-back' ||
    movement.id === 'left-wing-back-high' ||
    movement.id === 'right-wing-back-high'
      ? 'release-wing-backs'
      : movement.id === 'eight-support' || movement.id === 'wide-to-ten'
        ? 'combine-centrally'
        : 'wing-back-finish',
}))

export const WING_BACK_ATTACK_PIXI_SCENARIO: WingBackAttackPixiScenario = {
  players: WING_BACK_ATTACK_PLAYERS.map((player) => ({
    id: player.id,
    label: player.label,
    x: player.start.x,
    y: player.start.y,
    tone: player.tone === 'opponent' ? 'opponent' : 'primary',
  })),
  ballPosition: WING_BACK_ATTACK_BALL_START,
  steps,
  routes,
  caption: WING_BACK_ATTACK_CAPTION,
}
