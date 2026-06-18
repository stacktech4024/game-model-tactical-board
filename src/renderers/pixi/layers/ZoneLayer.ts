import { Container, Graphics, Text } from 'pixi.js'
import { PITCH } from '../../../domain/pitch/pitchConstants'
import { pitchToScreen } from '../../../domain/pitch/coordTransforms'

const AMBER = 0xf59e0b
const ZONE_ONE_FILL = 0x1a3a5c
const ZONE_FOUR_FILL = 0x5c1a1a
const DASH_WIDTH = 1
const DASH_LENGTH_METERS = 3
const GAP_LENGTH_METERS = 2
const LABEL_OFFSET_PX = 6

function drawDashedBoundary(
  gfx: Graphics,
  y: number,
  canvasW: number,
  canvasH: number,
  padding: number,
): void {
  for (let startX = 0; startX < PITCH.WIDTH; startX += DASH_LENGTH_METERS + GAP_LENGTH_METERS) {
    const endX = Math.min(startX + DASH_LENGTH_METERS, PITCH.WIDTH)
    const start = pitchToScreen(startX, y, canvasW, canvasH, padding)
    const end = pitchToScreen(endX, y, canvasW, canvasH, padding)

    gfx.moveTo(start.sx, start.sy)
    gfx.lineTo(end.sx, end.sy)
    gfx.stroke({ color: AMBER, width: DASH_WIDTH, alpha: 1 })
  }
}

function addZoneLabel(
  container: Container,
  label: string,
  zoneStartY: number,
  zoneEndY: number,
  canvasW: number,
  canvasH: number,
  padding: number,
): void {
  const centerY = zoneStartY + (zoneEndY - zoneStartY) / 2
  const labelPosition = pitchToScreen(0, centerY, canvasW, canvasH, padding)
  const text = new Text({
    text: label,
    style: {
      fill: AMBER,
      fontSize: 11,
      fontFamily: 'Arial',
    },
  })

  text.anchor.set(0, 0.5)
  text.position.set(labelPosition.sx + LABEL_OFFSET_PX, labelPosition.sy)
  container.addChild(text)
}

export function drawZones(
  gfx: Graphics,
  container: Container,
  canvasW: number,
  canvasH: number,
  padding: number,
): void {
  const zones = PITCH.ZONES

  zones.forEach((zone, index) => {
    if (index === 0 || index === zones.length - 1) {
      const zoneTopLeft = pitchToScreen(0, zone.endY, canvasW, canvasH, padding)
      const zoneBottomRight = pitchToScreen(PITCH.WIDTH, zone.startY, canvasW, canvasH, padding)

      gfx.rect(
        zoneTopLeft.sx,
        zoneTopLeft.sy,
        zoneBottomRight.sx - zoneTopLeft.sx,
        zoneBottomRight.sy - zoneTopLeft.sy,
      )
      gfx.fill({ color: index === 0 ? ZONE_ONE_FILL : ZONE_FOUR_FILL, alpha: 0.25 })
    }

    addZoneLabel(container, zone.label, zone.startY, zone.endY, canvasW, canvasH, padding)

    if (index < zones.length - 1) {
      drawDashedBoundary(gfx, zone.endY, canvasW, canvasH, padding)
    }
  })
}
