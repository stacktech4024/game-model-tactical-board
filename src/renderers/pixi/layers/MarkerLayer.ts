import { Container, Graphics, Text } from 'pixi.js'
import { pitchToScreen } from '../../../domain/pitch/coordTransforms'
import type { ScenarioMarker, ScenarioMarkerTone } from '../../../domain/scenarios/scenarioTypes'

const MARKER_RADIUS = 8
const LABEL_OFFSET_X = 14
const LABEL_OFFSET_Y = -16

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

    label.alpha = 0.8
    label.position.set(LABEL_OFFSET_X, LABEL_OFFSET_Y)

    markerContainer.position.set(point.sx, point.sy)
    markerContainer.addChild(ring)
    markerContainer.addChild(label)
    container.addChild(markerContainer)
  })
}
