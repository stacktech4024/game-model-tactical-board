import { Container, Graphics, Text } from 'pixi.js'
import { pitchToScreen } from '../../../domain/pitch/coordTransforms'
import type { SquadPlayer } from '../../../domain/players/playerTypes'

type FormationPosition = {
  x: number
  y: number
}

type PositionMap = Record<number, FormationPosition>

const TOKEN_RADIUS = 11
const TOKEN_STROKE_COLOR = 0xffffff
const TOKEN_STROKE_WIDTH = 1
const GK_FILL = 0xf2c94c
const OUTFIELD_FILL = 0xc0392b
const AWAY_GK_FILL = 0x2dd4bf
const AWAY_OUTFIELD_FILL = 0x2f3437
const GK_NUMBER_COLOR = 0x111111
const OUTFIELD_NUMBER_COLOR = 0xffffff

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

function addToken(
  container: Container,
  player: SquadPlayer,
  position: FormationPosition,
  canvasW: number,
  canvasH: number,
  padding: number,
): void {
  const screenPosition = pitchToScreen(position.x, position.y, canvasW, canvasH, padding)
  const tokenContainer = new Container()
  const tokenFill = new Graphics()
  const numberText = new Text({
    text: String(player.number),
    style: {
      fill: getNumberColor(player),
      fontFamily: 'Arial',
      fontSize: 12,
      fontWeight: 'bold',
    },
  })

  tokenFill.circle(0, 0, TOKEN_RADIUS)
  tokenFill.fill({ color: getTokenFill(player) })
  tokenFill.stroke({ color: TOKEN_STROKE_COLOR, width: TOKEN_STROKE_WIDTH, alpha: 0.7 })

  numberText.anchor.set(0.5)
  numberText.position.set(0, 0)

  tokenContainer.position.set(screenPosition.sx, screenPosition.sy)
  tokenContainer.addChild(tokenFill)
  tokenContainer.addChild(numberText)
  container.addChild(tokenContainer)
}

export function drawPlayers(
  container: Container,
  players: SquadPlayer[],
  positions: PositionMap,
  canvasW: number,
  canvasH: number,
  padding: number,
): void {
  container.removeChildren()

  players.forEach((player) => {
    const position = positions[player.number]

    if (!position) {
      return
    }

    addToken(container, player, position, canvasW, canvasH, padding)
  })
}
