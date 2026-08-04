import type {
  PixiPitchPreviewProps,
  PixiPitchPreviewRoute,
  PixiPitchPreviewStep,
} from '../../renderers/pixi/PixiPitchPreview'
import {
  DEFENSIVE_ORGANIZATION_BALL,
  DEFENSIVE_ORGANIZATION_CAPTION,
  DEFENSIVE_ORGANIZATION_MOVEMENTS,
  DEFENSIVE_ORGANIZATION_PLAYERS,
  type DefensiveOrganizationMovement,
} from './defensiveOrganizationScenario'

type DefensiveOrganizationPixiScenario = Pick<
  PixiPitchPreviewProps,
  'players' | 'ballPosition' | 'steps' | 'routes'
> & {
  caption: string
}

function getMovement(id: string): DefensiveOrganizationMovement {
  const movement = DEFENSIVE_ORGANIZATION_MOVEMENTS.find((item) => item.id === id)

  if (!movement) {
    throw new Error(`Missing defensive organization movement: ${id}`)
  }

  return movement
}

const screenPivot = getMovement('screen-pivot')
const pressWide = getMovement('press-wide')
const gkSweep = getMovement('gk-sweep')

const steps: PixiPitchPreviewStep[] = [
  {
    id: 'setup',
    cue: 'Compact block – deny the middle',
    emphasizePlayerId: 'nine',
    duration: 0.3,
  },
  {
    id: 'screen',
    cue: '#9 screens the central pivot',
    playerId: screenPivot.playerId,
    playerTo: screenPivot.to,
    duration: 0.4,
  },
  {
    id: 'forced-wide',
    cue: 'Ball is forced into the wide channel',
    emphasizePlayerId: 'opponent-outlet',
    duration: 0.3,
  },
  {
    id: 'press',
    cue: '#7 presses the trigger',
    playerId: pressWide.playerId,
    playerTo: pressWide.to,
    duration: 0.4,
  },
  {
    id: 'shift',
    cue: 'Team shifts and compresses across',
    emphasizePlayerId: 'left-back',
    duration: 0.35,
  },
  {
    id: 'sweep',
    cue: 'GK sweeps behind the high line',
    playerId: gkSweep.playerId,
    playerTo: gkSweep.to,
    duration: 0.35,
  },
]

const routes: PixiPitchPreviewRoute[] = DEFENSIVE_ORGANIZATION_MOVEMENTS.map((movement) => ({
  id: movement.id,
  from: movement.from,
  to: movement.to,
  type: movement.kind,
  revealOnStepId:
    movement.id === 'screen-pivot'
      ? 'screen'
      : movement.id === 'press-wide'
        ? 'press'
        : 'sweep',
}))

export const DEFENSIVE_ORGANIZATION_PIXI_SCENARIO: DefensiveOrganizationPixiScenario = {
  players: DEFENSIVE_ORGANIZATION_PLAYERS.map((player) => ({
    id: player.id,
    label: player.label,
    x: player.start.x,
    y: player.start.y,
    tone: player.tone === 'opponent' || player.tone === 'keeper' ? player.tone : 'primary',
  })),
  ballPosition: DEFENSIVE_ORGANIZATION_BALL,
  steps,
  routes,
  caption: DEFENSIVE_ORGANIZATION_CAPTION,
}
