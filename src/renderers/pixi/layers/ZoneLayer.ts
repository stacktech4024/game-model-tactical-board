import { Container, Graphics, Text } from 'pixi.js'
import { pitchToScreen } from '../../../domain/pitch/coordTransforms'
import { PITCH } from '../../../domain/pitch/pitchConstants'

type ZoneColorConfig = {
  fill: number
  alpha: number
}

const ZONE_COLORS_BY_INDEX: ZoneColorConfig[] = [
  { fill: 0x4a90d9, alpha: 0.1 },
  { fill: 0xf5a623, alpha: 0.07 },
  { fill: 0x7ed321, alpha: 0.07 },
  { fill: 0xe24b4a, alpha: 0.08 },
]

const ZONE_LABEL_COLORS_BY_INDEX = [0x4a90d9, 0xf5a623, 0x7ed321, 0xe24b4a]
const BOUNDARY_COLOR = 0xf5a623
const BOUNDARY_ALPHA = 0.5
const BOUNDARY_WIDTH = 1
const BOUNDARY_DASH = 6
const BOUNDARY_GAP = 4
const ZONE_LABEL_CONTAINER_LABEL = '__zoneLabels'

function zoneToScreenRect(
  startY: number,
  endY: number,
  canvasW: number,
  canvasH: number,
  padding: number,
): { x: number; y: number; width: number; height: number } {
  const corner1 = pitchToScreen(0, startY, canvasW, canvasH, padding)
  const corner2 = pitchToScreen(PITCH.WIDTH, endY, canvasW, canvasH, padding)

  return {
    x: Math.min(corner1.sx, corner2.sx),
    y: Math.min(corner1.sy, corner2.sy),
    width: Math.abs(corner2.sx - corner1.sx),
    height: Math.abs(corner2.sy - corner1.sy),
  }
}

function drawZoneFills(
  zonesLayer: Graphics,
  canvasW: number,
  canvasH: number,
  padding: number,
  activeZones?: Set<number>,
): void {
  PITCH.ZONES.forEach((zone, index) => {
    const colorConfig = ZONE_COLORS_BY_INDEX[index]

    if (!colorConfig) {
      return
    }

    const isOutOfActiveZone = Boolean(activeZones?.size) && !activeZones?.has(index + 1)
    const rect = zoneToScreenRect(zone.startY, zone.endY, canvasW, canvasH, padding)

    zonesLayer.rect(rect.x, rect.y, rect.width, rect.height)
    zonesLayer.fill({
      color: colorConfig.fill,
      alpha: isOutOfActiveZone ? colorConfig.alpha * 0.4 : colorConfig.alpha,
    })
  })
}

function drawDashedLine(
  zonesLayer: Graphics,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): void {
  const totalLength = Math.hypot(x2 - x1, y2 - y1)
  const dashCycle = BOUNDARY_DASH + BOUNDARY_GAP
  const dashCount = Math.floor(totalLength / dashCycle)
  const dirX = (x2 - x1) / totalLength
  const dirY = (y2 - y1) / totalLength

  for (let i = 0; i < dashCount; i += 1) {
    const startDist = i * dashCycle
    const endDist = Math.min(startDist + BOUNDARY_DASH, totalLength)

    zonesLayer.moveTo(x1 + dirX * startDist, y1 + dirY * startDist)
    zonesLayer.lineTo(x1 + dirX * endDist, y1 + dirY * endDist)
  }

  zonesLayer.stroke({ color: BOUNDARY_COLOR, width: BOUNDARY_WIDTH, alpha: BOUNDARY_ALPHA })
}

function drawZoneBoundaries(
  zonesLayer: Graphics,
  canvasW: number,
  canvasH: number,
  padding: number,
): void {
  const internalBoundaryYs = PITCH.ZONES.map((zone) => zone.endY).filter(
    (y) => y > 0 && y < PITCH.LENGTH,
  )

  internalBoundaryYs.forEach((y) => {
    const left = pitchToScreen(0, y, canvasW, canvasH, padding)
    const right = pitchToScreen(PITCH.WIDTH, y, canvasW, canvasH, padding)

    drawDashedLine(zonesLayer, left.sx, left.sy, right.sx, right.sy)
  })
}

function drawZoneLabels(
  zonesLayer: Graphics,
  stage: Container,
  canvasW: number,
  canvasH: number,
  padding: number,
  activeZones?: Set<number>,
): void {
  const existing = stage.getChildByLabel(ZONE_LABEL_CONTAINER_LABEL)

  if (existing) {
    stage.removeChild(existing)
    existing.destroy({ children: true })
  }

  const labelContainer = new Container()
  labelContainer.label = ZONE_LABEL_CONTAINER_LABEL

  PITCH.ZONES.forEach((zone, index) => {
    const isOutOfActiveZone = Boolean(activeZones?.size) && !activeZones?.has(index + 1)
    const rect = zoneToScreenRect(zone.startY, zone.endY, canvasW, canvasH, padding)
    const labelColor = ZONE_LABEL_COLORS_BY_INDEX[index] ?? 0xffffff
    const label = new Text({
      text: zone.label,
      style: {
        fill: labelColor,
        fontFamily: 'Arial',
        fontSize: 10,
        fontWeight: '600',
      },
    })

    label.alpha = isOutOfActiveZone ? 0.22 : 0.55
    label.anchor.set(0, 0)
    label.position.set(rect.x + 8, rect.y + 8)
    labelContainer.addChild(label)
  })

  const zoneLayerIndex = stage.getChildIndex(zonesLayer)
  stage.addChildAt(labelContainer, Math.min(zoneLayerIndex + 1, stage.children.length))
}

export function drawZones(
  zonesLayer: Graphics,
  stage: Container,
  canvasW: number,
  canvasH: number,
  padding: number,
  activeZones?: Set<number>,
): void {
  zonesLayer.clear()

  drawZoneFills(zonesLayer, canvasW, canvasH, padding, activeZones)
  drawZoneBoundaries(zonesLayer, canvasW, canvasH, padding)
  drawZoneLabels(zonesLayer, stage, canvasW, canvasH, padding, activeZones)
}
