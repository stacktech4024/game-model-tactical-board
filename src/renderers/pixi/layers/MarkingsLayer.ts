import { Graphics } from 'pixi.js'
import { PITCH } from '../../../domain/pitch/pitchConstants'
import { pitchToScreen } from '../../../domain/pitch/coordTransforms'

const LINE_COLOR = 0xffffff
const LINE_WIDTH = 2
const PENALTY_SPOT_RADIUS = 0.5

function drawRectLine(
  gfx: Graphics,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  canvasW: number,
  canvasH: number,
  padding: number,
): void {
  const topLeft = pitchToScreen(x1, y2, canvasW, canvasH, padding)
  const bottomRight = pitchToScreen(x2, y1, canvasW, canvasH, padding)

  gfx.rect(topLeft.sx, topLeft.sy, bottomRight.sx - topLeft.sx, bottomRight.sy - topLeft.sy)
  gfx.stroke({ color: LINE_COLOR, width: LINE_WIDTH })
}

function drawArc(
  gfx: Graphics,
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  canvasW: number,
  canvasH: number,
  padding: number,
): void {
  const center = pitchToScreen(x, y, canvasW, canvasH, padding)
  const edge = pitchToScreen(x + radius, y, canvasW, canvasH, padding)
  const screenRadius = Math.abs(edge.sx - center.sx)
  const startX = center.sx + screenRadius * Math.cos(startAngle)
  const startY = center.sy + screenRadius * Math.sin(startAngle)

  gfx.moveTo(startX, startY)
  gfx.arc(center.sx, center.sy, screenRadius, startAngle, endAngle)
  gfx.stroke({ color: LINE_COLOR, width: LINE_WIDTH })
}

export function drawMarkings(
  gfx: Graphics,
  canvasW: number,
  canvasH: number,
  padding: number,
): void {
  gfx.clear()

  drawRectLine(gfx, 0, 0, PITCH.WIDTH, PITCH.LENGTH, canvasW, canvasH, padding)

  const halfwayLeft = pitchToScreen(0, 52.5, canvasW, canvasH, padding)
  const halfwayRight = pitchToScreen(PITCH.WIDTH, 52.5, canvasW, canvasH, padding)
  gfx.moveTo(halfwayLeft.sx, halfwayLeft.sy)
  gfx.lineTo(halfwayRight.sx, halfwayRight.sy)
  gfx.stroke({ color: LINE_COLOR, width: LINE_WIDTH })

  const centre = pitchToScreen(PITCH.WIDTH / 2, PITCH.LENGTH / 2, canvasW, canvasH, padding)
  const centreRadiusPoint = pitchToScreen(PITCH.WIDTH / 2 + PITCH.CENTRE_CIRCLE_RADIUS, PITCH.LENGTH / 2, canvasW, canvasH, padding)
  const centreRadius = Math.abs(centreRadiusPoint.sx - centre.sx)

  gfx.arc(centre.sx, centre.sy, centreRadius, 0, Math.PI * 2)
  gfx.stroke({ color: LINE_COLOR, width: LINE_WIDTH })

  gfx.circle(centre.sx, centre.sy, Math.max(LINE_WIDTH / 2, 1))
  gfx.fill({ color: LINE_COLOR })

  const penaltyAreaHalfWidth = PITCH.PENALTY_AREA_WIDTH / 2
  const goalAreaHalfWidth = PITCH.GOAL_AREA_WIDTH / 2
  const pitchCenterX = PITCH.WIDTH / 2

  drawRectLine(
    gfx,
    pitchCenterX - penaltyAreaHalfWidth,
    0,
    pitchCenterX + penaltyAreaHalfWidth,
    PITCH.PENALTY_AREA_DEPTH,
    canvasW,
    canvasH,
    padding,
  )
  drawRectLine(
    gfx,
    pitchCenterX - penaltyAreaHalfWidth,
    PITCH.LENGTH - PITCH.PENALTY_AREA_DEPTH,
    pitchCenterX + penaltyAreaHalfWidth,
    PITCH.LENGTH,
    canvasW,
    canvasH,
    padding,
  )

  drawRectLine(
    gfx,
    pitchCenterX - goalAreaHalfWidth,
    0,
    pitchCenterX + goalAreaHalfWidth,
    PITCH.GOAL_AREA_DEPTH,
    canvasW,
    canvasH,
    padding,
  )
  drawRectLine(
    gfx,
    pitchCenterX - goalAreaHalfWidth,
    PITCH.LENGTH - PITCH.GOAL_AREA_DEPTH,
    pitchCenterX + goalAreaHalfWidth,
    PITCH.LENGTH,
    canvasW,
    canvasH,
    padding,
  )

  const bottomPenaltySpot = pitchToScreen(pitchCenterX, PITCH.PENALTY_SPOT_DIST, canvasW, canvasH, padding)
  const topPenaltySpot = pitchToScreen(pitchCenterX, PITCH.LENGTH - PITCH.PENALTY_SPOT_DIST, canvasW, canvasH, padding)
  const penaltySpotRadiusPoint = pitchToScreen(
    pitchCenterX + PENALTY_SPOT_RADIUS,
    PITCH.PENALTY_SPOT_DIST,
    canvasW,
    canvasH,
    padding,
  )
  const penaltySpotRadius = Math.abs(penaltySpotRadiusPoint.sx - bottomPenaltySpot.sx)

  gfx.circle(bottomPenaltySpot.sx, bottomPenaltySpot.sy, penaltySpotRadius)
  gfx.fill({ color: LINE_COLOR })

  gfx.circle(topPenaltySpot.sx, topPenaltySpot.sy, penaltySpotRadius)
  gfx.fill({ color: LINE_COLOR })

  drawArc(gfx, 0, 0, PITCH.CORNER_ARC_RADIUS, Math.PI * 1.5, Math.PI * 2, canvasW, canvasH, padding)
  drawArc(gfx, PITCH.WIDTH, 0, PITCH.CORNER_ARC_RADIUS, Math.PI, Math.PI * 1.5, canvasW, canvasH, padding)
  drawArc(gfx, 0, PITCH.LENGTH, PITCH.CORNER_ARC_RADIUS, 0, Math.PI / 2, canvasW, canvasH, padding)
  drawArc(
    gfx,
    PITCH.WIDTH,
    PITCH.LENGTH,
    PITCH.CORNER_ARC_RADIUS,
    Math.PI / 2,
    Math.PI,
    canvasW,
    canvasH,
    padding,
  )
}
