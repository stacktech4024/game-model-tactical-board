import { Container, Graphics, Text } from 'pixi.js'
import { pitchToScreen } from '../../../domain/pitch/coordTransforms'
import type { SquadPlayer } from '../../../domain/players/playerTypes'

type FormationPosition = {
  x: number
  y: number
}

type PositionMap = Record<number, FormationPosition>

const HOME_OUTFIELD_RADIUS = 14
const HOME_GK_RADIUS = 17
const AWAY_TOKEN_RADIUS = 12
const TOKEN_STROKE_COLOR = 0xffffff
const TOKEN_STROKE_WIDTH = 1.75
const GK_FILL = 0xf2c94c
const OUTFIELD_FILL = 0xc0392b
const AWAY_GK_FILL = 0x2dd4bf
const AWAY_OUTFIELD_FILL = 0x2f3437
const GK_NUMBER_COLOR = 0x111111
const OUTFIELD_NUMBER_COLOR = 0xffffff
const SHADOW_COLOR = 0x000000
const SHADOW_ALPHA = 0.22
const SHADOW_OFFSET_RATIO = 0.7
const SHADOW_RADIUS_X_RATIO = 0.85
const SHADOW_RADIUS_Y_RATIO = 0.3

function getTokenFill(player: SquadPlayer): number {
  if (player.side === 'away') {
    return player.isGoalkeeper ? AWAY_GK_FILL : AWAY_OUTFIELD_FILL
  }

  return player.isGoalkeeper ? GK_FILL : OUTFIELD_FILL
}

function getNumberColor(player: SquadPlayer): number {
  if (player.side === 'away' && player.isGoalkeeper) {
    return GK_NUMBER_COLOR
  }

  return player.isGoalkeeper ? GK_NUMBER_COLOR : OUTFIELD_NUMBER_COLOR
}

function getTokenRadius(player: SquadPlayer): number {
  if (player.side === 'away') {
    return AWAY_TOKEN_RADIUS
  }

  return player.isGoalkeeper ? HOME_GK_RADIUS : HOME_OUTFIELD_RADIUS
}

function addShadow(tokenContainer: Container, tokenRadius: number): void {
  const shadow = new Graphics()

  shadow.eventMode = 'none'
  shadow.ellipse(
    0,
    tokenRadius * SHADOW_OFFSET_RATIO,
    tokenRadius * SHADOW_RADIUS_X_RATIO,
    tokenRadius * SHADOW_RADIUS_Y_RATIO,
  )
  shadow.fill({ color: SHADOW_COLOR, alpha: SHADOW_ALPHA })
  tokenContainer.addChild(shadow)
}

function addToken(
  container: Container,
  player: SquadPlayer,
  position: FormationPosition,
  canvasW: number,
  canvasH: number,
  padding: number,
  tokenRefs?: Map<number, Container>,
): void {
  const screenPosition = pitchToScreen(position.x, position.y, canvasW, canvasH, padding)
  const tokenContainer = new Container()
  const tokenFill = new Graphics()
  const tokenRadius = getTokenRadius(player)
  const numberText = new Text({
    text: String(player.number),
    style: {
      fill: getNumberColor(player),
      fontFamily: 'Arial',
      fontSize: player.side === 'away' ? 10 : 12,
      fontWeight: 'bold',
    },
  })

  addShadow(tokenContainer, tokenRadius)

  tokenFill.circle(0, 0, tokenRadius)
  tokenFill.fill({ color: getTokenFill(player), alpha: player.side === 'away' ? 0.72 : 1 })
  tokenFill.stroke({ color: TOKEN_STROKE_COLOR, width: TOKEN_STROKE_WIDTH, alpha: player.side === 'away' ? 0.42 : 0.7 })

  numberText.anchor.set(0.5)
  numberText.position.set(0, 0)

  tokenContainer.position.set(screenPosition.sx, screenPosition.sy)
  tokenContainer.addChild(tokenFill)
  tokenContainer.addChild(numberText)
  container.addChild(tokenContainer)
  tokenRefs?.set(player.number, tokenContainer)
}

export function drawPlayers(
  container: Container,
  players: SquadPlayer[],
  positions: PositionMap,
  canvasW: number,
  canvasH: number,
  padding: number,
  tokenRefs?: Map<number, Container>,
): void {
  container.removeChildren()
  tokenRefs?.clear()

  players.forEach((player) => {
    const position = positions[player.number]

    if (!position) {
      return
    }

    addToken(container, player, position, canvasW, canvasH, padding, tokenRefs)
  })
}
