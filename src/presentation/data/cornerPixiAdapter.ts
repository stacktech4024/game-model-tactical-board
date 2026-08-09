import type {
  PixiPitchPreviewProps,
} from '../../renderers/pixi/PixiPitchPreview'
import {
  CORNER_PREVIEW_BALL_START,
  CORNER_PREVIEW_CAPTION,
  CORNER_PREVIEW_PLAYERS,
  CORNER_PREVIEW_ROUTES,
  CORNER_PREVIEW_STEPS,
} from './cornerScenario.ts'

type CornerPixiScenario = Pick<
  PixiPitchPreviewProps,
  'players' | 'ballPosition' | 'steps' | 'routes'
> & {
  caption: string
}

export const CORNER_PIXI_SCENARIO: CornerPixiScenario = {
  players: CORNER_PREVIEW_PLAYERS.map((player) => ({
    id: player.id,
    label: player.label,
    x: player.start.x,
    y: player.start.y,
    tone: player.tone === 'opponent' || player.tone === 'keeper' ? player.tone : 'primary',
    side: player.side,
    facingAngle: player.facingAngle,
  })),
  ballPosition: CORNER_PREVIEW_BALL_START,
  steps: CORNER_PREVIEW_STEPS,
  routes: CORNER_PREVIEW_ROUTES,
  caption: CORNER_PREVIEW_CAPTION,
}
