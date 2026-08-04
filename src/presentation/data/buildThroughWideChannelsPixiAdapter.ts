import type {
  PixiPitchPreviewProps,
} from '../../renderers/pixi/PixiPitchPreview'
import {
  BUILD_THROUGH_WIDE_CHANNELS_BALL_START,
  BUILD_THROUGH_WIDE_CHANNELS_CAPTION,
  BUILD_THROUGH_WIDE_CHANNELS_PLAYERS,
  BUILD_THROUGH_WIDE_CHANNELS_ROUTES,
  BUILD_THROUGH_WIDE_CHANNELS_STEPS,
} from './buildThroughWideChannelsScenario'

type BuildThroughWideChannelsPixiScenario = Pick<
  PixiPitchPreviewProps,
  'players' | 'ballPosition' | 'steps' | 'routes'
> & {
  caption: string
}

export const BUILD_THROUGH_WIDE_CHANNELS_PIXI_SCENARIO: BuildThroughWideChannelsPixiScenario = {
  players: BUILD_THROUGH_WIDE_CHANNELS_PLAYERS.map((player) => ({
    id: player.id,
    label: player.label,
    x: player.start.x,
    y: player.start.y,
    tone: player.tone === 'opponent' || player.tone === 'keeper' ? player.tone : 'primary',
    side: player.side,
  })),
  ballPosition: BUILD_THROUGH_WIDE_CHANNELS_BALL_START,
  steps: BUILD_THROUGH_WIDE_CHANNELS_STEPS,
  routes: BUILD_THROUGH_WIDE_CHANNELS_ROUTES,
  caption: BUILD_THROUGH_WIDE_CHANNELS_CAPTION,
}
