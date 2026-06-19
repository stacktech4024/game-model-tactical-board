import { Container, Graphics, Text } from 'pixi.js'
import { pitchToScreen } from '../../../domain/pitch/coordTransforms'
import type { ScenarioMarker, ScenarioMarkerTone } from '../../../domain/scenarios/scenarioTypes'

const MARKER_RADIUS = 8
const LABEL_OFFSET_X = 18
const LABEL_OFFSET_Y = -26
const LABEL_PLATE_PADDING_X = 4
const LABEL_PLATE_PADDING_Y = 2

const MARKER_COLORS: Record<ScenarioMarkerTone, number> = {
  primary: 0x22d3ee,
  warning: 0xf59e0b,
  success: 0x22c55e,
}

export function drawScenarioMarkers(
  container: Container,
  markers: ScenarioMarker[] | undefined,
  canvasW: number,
  canvasH: number,
  padding: number,
): void {
  container.removeChildren()

  if (!markers?.length) {
    return
  }

  markers.forEach((marker) => {
    const point = pitchToScreen(marker.point.x, marker.point.y, canvasW, canvasH, padding)
    const color = MARKER_COLORS[marker.tone ?? 'primary']
    const markerContainer = new Container()
    const ring = new Graphics()
    const labelPlate = new Graphics()
    const label = new Text({
      text: marker.label,
      style: {
        fill: 0xffffff,
        fontFamily: 'Arial',
        fontSize: 9,
        fontWeight: 'bold',
      },
    })

    ring.circle(0, 0, MARKER_RADIUS)
    ring.fill({ color, alpha: 0.16 })
    ring.stroke({ color, width: 1.5, alpha: 0.78 })

    label.alpha = 1
    label.position.set(LABEL_OFFSET_X, LABEL_OFFSET_Y)

    labelPlate.roundRect(
      LABEL_OFFSET_X - LABEL_PLATE_PADDING_X,
      LABEL_OFFSET_Y - LABEL_PLATE_PADDING_Y,
      label.width + LABEL_PLATE_PADDING_X * 2,
      label.height + LABEL_PLATE_PADDING_Y * 2,
      3,
    )
    labelPlate.fill({ color: 0x0f172a, alpha: 0.72 })

    markerContainer.position.set(point.sx, point.sy)
    markerContainer.addChild(ring)
    markerContainer.addChild(labelPlate)
    markerContainer.addChild(label)
    container.addChild(markerContainer)
  })
}
