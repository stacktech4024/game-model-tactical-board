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

const forceWidePass = getMovement('force-wide-pass')
const widePressure = getMovement('wide-pressure')
const tenScreen = getMovement('ten-screen')
const sixSlide = getMovement('six-slide')
const backLineShift = getMovement('back-line-shift')

const steps: PixiPitchPreviewStep[] = [
  {
    id: 'compact-block',
    cue: 'Compact block',
    emphasizePlayerId: 'six',
    duration: 0.22,
  },
  {
    id: 'force-wide',
    cue: 'Force play wide',
    ballFrom: forceWidePass.from,
    ballTo: forceWidePass.to,
    playerId: widePressure.playerId,
    playerTo: widePressure.to,
    duration: 0.6,
  },
  {
    id: 'deny-middle',
    cue: 'Deny Channel 2/3',
    playerMoves: [
      { playerId: 'ten', to: tenScreen.to },
      { playerId: 'six', to: sixSlide.to },
    ],
    duration: 0.5,
  },
  {
    id: 'back-line-balance',
    cue: 'Back line slides together',
    playerId: backLineShift.playerId,
    playerTo: backLineShift.to,
    duration: 0.45,
  },
  {
    id: 'outlet-ready',
    cue: 'Outlet ready',
    emphasizePlayerId: 'nine',
    duration: 0.3,
  },
]

const REVEAL_STEP_BY_MOVEMENT_ID: Record<string, string> = {
  'force-wide-pass': 'force-wide',
  'wide-pressure': 'force-wide',
  'ten-screen': 'deny-middle',
  'six-slide': 'deny-middle',
  'back-line-shift': 'back-line-balance',
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
