import { Graphics } from 'pixi.js'
import { pitchToScreen } from '../../../domain/pitch/coordTransforms'
import type { ScenarioArrow, ScenarioArrowType } from '../../../domain/scenarios/scenarioTypes'

const ARROW_ALPHA = 0.75
const ARROW_WIDTH = 2
const ARROWHEAD_LENGTH = 9
const ARROWHEAD_ANGLE = Math.PI / 7

const ARROW_COLORS: Record<ScenarioArrowType, number> = {
  pass: 0xffffff,
  run: 0xf59e0b,
  dribble: 0x22d3ee,
  press: 0xef4444,
  recovery: 0x22c55e,
  shot: 0xa855f7,
  cross: 0xfb923c,
  header: 0xc026d3,
}

export function drawScenarioArrows(
  gfx: Graphics,
  arrows: ScenarioArrow[] | undefined,
  canvasW: number,
  canvasH: number,
  padding: number,
  activeArrowIds?: Set<string>,
): void {
  gfx.clear()

  if (!arrows?.length) {
    return
  }

  arrows.forEach((arrow) => {
    const start = pitchToScreen(arrow.from.x, arrow.from.y, canvasW, canvasH, padding)
    const via = arrow.via ? pitchToScreen(arrow.via.x, arrow.via.y, canvasW, canvasH, padding) : undefined
    const end = pitchToScreen(arrow.to.x, arrow.to.y, canvasW, canvasH, padding)
    const arrowheadStart = via ?? start
    const color = ARROW_COLORS[arrow.type]
    const hasActiveFilter = Boolean(activeArrowIds?.size)
    const isActive = activeArrowIds?.has(arrow.id) ?? false
    const alpha = hasActiveFilter ? (isActive ? 1 : 0.28) : ARROW_ALPHA
    const width = hasActiveFilter ? (isActive ? ARROW_WIDTH + 1.5 : ARROW_WIDTH) : ARROW_WIDTH
    const angle = Math.atan2(end.sy - arrowheadStart.sy, end.sx - arrowheadStart.sx)
    const leftHeadAngle = angle - Math.PI + ARROWHEAD_ANGLE
    const rightHeadAngle = angle - Math.PI - ARROWHEAD_ANGLE
    const leftHeadX = end.sx + Math.cos(leftHeadAngle) * ARROWHEAD_LENGTH
    const leftHeadY = end.sy + Math.sin(leftHeadAngle) * ARROWHEAD_LENGTH
    const rightHeadX = end.sx + Math.cos(rightHeadAngle) * ARROWHEAD_LENGTH
    const rightHeadY = end.sy + Math.sin(rightHeadAngle) * ARROWHEAD_LENGTH

    gfx.moveTo(start.sx, start.sy)
    if (via) {
      gfx.lineTo(via.sx, via.sy)
    }
    gfx.lineTo(end.sx, end.sy)
    gfx.stroke({ color, width, alpha })

    gfx.moveTo(end.sx, end.sy)
    gfx.lineTo(leftHeadX, leftHeadY)
    gfx.stroke({ color, width, alpha })

    gfx.moveTo(end.sx, end.sy)
    gfx.lineTo(rightHeadX, rightHeadY)
    gfx.stroke({ color, width, alpha })
  })
}
