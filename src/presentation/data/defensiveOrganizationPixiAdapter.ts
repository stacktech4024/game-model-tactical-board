import type {
  PixiPitchPreviewProps,
} from '../../renderers/pixi/PixiPitchPreview'
import {
  DEFENSIVE_ORGANIZATION_PAGE_CASE,
} from './defensiveOrganizationPageData'

type DefensiveOrganizationPixiScenario = Pick<
  PixiPitchPreviewProps,
  'players' | 'ballPosition' | 'steps' | 'routes'
> & {
  caption: string
}

export const DEFENSIVE_ORGANIZATION_PIXI_SCENARIO: DefensiveOrganizationPixiScenario = {
  players: DEFENSIVE_ORGANIZATION_PAGE_CASE.players.map((player) => ({
    id: player.id,
    label: player.label,
    x: player.start.x,
    y: player.start.y,
    tone: player.tone ?? 'primary',
  })),
  ballPosition: DEFENSIVE_ORGANIZATION_PAGE_CASE.ballPosition,
  steps: DEFENSIVE_ORGANIZATION_PAGE_CASE.steps,
  routes: DEFENSIVE_ORGANIZATION_PAGE_CASE.routes,
  caption: DEFENSIVE_ORGANIZATION_PAGE_CASE.caption,
}
