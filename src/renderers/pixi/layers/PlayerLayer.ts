import { Container, Graphics, Sprite, Text, Texture } from 'pixi.js'
import { getPitchScale, pitchToScreen } from '../../../domain/pitch/coordTransforms'
import { getZoneNumberForY } from '../../../domain/pitch/pitchConstants'
import type { SquadPlayer } from '../../../domain/players/playerTypes'

import shaperMaroonUrl from '../../../assets/shapers/player_maroon.svg'
import shaperYellowUrl from '../../../assets/shapers/player_yellow.svg'
import shaperGrayUrl from '../../../assets/shapers/player_gray.svg'
import shaperCyanUrl from '../../../assets/shapers/player_cyan.svg'

type FormationPosition = {
  x: number
  y: number
}

type PositionMap = Record<number, FormationPosition>

const PLAYER_RADIUS_PER_PITCH_METRE = 1.4
const MIN_HOME_OUTFIELD_RADIUS = 7
const MAX_HOME_OUTFIELD_RADIUS = 10.5
const GOALKEEPER_RADIUS_RATIO = 1.15
const AWAY_RADIUS_RATIO = 0.88
const GK_NUMBER_COLOR = 0x111111
const OUTFIELD_NUMBER_COLOR = 0xffffff
const SHADOW_COLOR = 0x000000
const SHADOW_ALPHA = 0.22
const SHADOW_OFFSET_RATIO = 0.7
const SHADOW_RADIUS_X_RATIO = 0.85
const SHADOW_RADIUS_Y_RATIO = 0.3
const FOCUS_RING_COLOR = 0xfbbf24
const FOCUS_RING_ALPHA = 0.88
const SHAPER_FORWARD_ROTATION_OFFSET_DEGREES = -90

// The Shapers artwork is a "head" circle plus a curved orientation arm,
// drawn on a 223x500 canvas where the head circle is ~171px in diameter
// (measured from the source asset). This constant lets us scale any
// Shapers texture so its head circle lines up with a given tokenRadius,
// regardless of the on-screen token size.
const SHAPER_HEAD_RADIUS_PX = 85.5

// Looked up lazily (not cached at module load) because Texture.from() only
// reads the Assets cache — it must run after preloadTokenAssets() resolves.
function getTokenTexture(player: SquadPlayer): Texture {
  if (player.side === 'away') {
    return Texture.from(player.isGoalkeeper ? shaperCyanUrl : shaperGrayUrl)
  }

  return Texture.from(player.isGoalkeeper ? shaperYellowUrl : shaperMaroonUrl)
}

function getNumberColor(player: SquadPlayer): number {
  if (player.side === 'away' && player.isGoalkeeper) {
    return GK_NUMBER_COLOR
  }

  return player.isGoalkeeper ? GK_NUMBER_COLOR : OUTFIELD_NUMBER_COLOR
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function getPlayerFocusMetrics(tokenRadius: number) {
  return {
    glowRadius: tokenRadius + clamp(tokenRadius * 0.64, 5, 9),
    ringRadius: tokenRadius + clamp(tokenRadius * 0.36, 3, 5),
    ringWidth: clamp(tokenRadius * 0.25, 2.25, 3.5),
  }
}

export function getPlayerTokenRadius(
  player: SquadPlayer,
  pitchScale: number,
  tokenScale = 1,
): number {
  const outfieldRadius = clamp(
    pitchScale * PLAYER_RADIUS_PER_PITCH_METRE,
    MIN_HOME_OUTFIELD_RADIUS,
    MAX_HOME_OUTFIELD_RADIUS,
  ) * tokenScale

  if (player.side === 'away') {
    return outfieldRadius * AWAY_RADIUS_RATIO
  }

  return player.isGoalkeeper ? outfieldRadius * GOALKEEPER_RADIUS_RATIO : outfieldRadius
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

function addFocusRing(tokenContainer: Container, tokenRadius: number): void {
  const ring = new Graphics()
  const glow = new Graphics()
  const { glowRadius, ringRadius, ringWidth } = getPlayerFocusMetrics(tokenRadius)

  glow.circle(0, 0, glowRadius)
  glow.fill({ color: FOCUS_RING_COLOR, alpha: 0.16 })
  tokenContainer.addChild(glow)
  ring.circle(0, 0, ringRadius)
  ring.stroke({ color: FOCUS_RING_COLOR, width: ringWidth, alpha: FOCUS_RING_ALPHA })
  tokenContainer.addChild(ring)
}

function addToken(
  container: Container,
  player: SquadPlayer,
  position: FormationPosition,
  canvasW: number,
  canvasH: number,
  padding: number,
  focusedPlayerNumbers?: Set<number>,
  tokenRefs?: Map<number, Container>,
  activeZones?: Set<number>,
  idleAnchorRefs?: Map<number, Container>,
  spriteRefs?: Map<number, Sprite>,
  tokenScale = 1,
): void {
  const screenPosition = pitchToScreen(position.x, position.y, canvasW, canvasH, padding)
  const pitchScale = getPitchScale(canvasW, canvasH, padding)
  const tokenContainer = new Container()
  const visualGroup = new Container()
  const tokenRadius = getPlayerTokenRadius(player, pitchScale, tokenScale)
  const numberFontSize = clamp(tokenRadius * 0.85, player.side === 'away' ? 8 : 9, 12)
  const tokenSprite = new Sprite(getTokenTexture(player))
  const numberText = new Text({
    text: String(player.isGoalkeeper ? 1 : player.number),
    style: {
      fill: getNumberColor(player),
      fontFamily: 'Arial',
      fontSize: numberFontSize,
      fontWeight: 'bold',
    },
  })
  const hasActiveFocus = player.side !== 'away' && Boolean(focusedPlayerNumbers?.size)
  const isFocused = player.side !== 'away' && (focusedPlayerNumbers?.has(player.number) ?? false)
  const isOutOfActiveZone = Boolean(activeZones?.size) && !activeZones?.has(getZoneNumberForY(position.y))
  const zoneDimFactor = isOutOfActiveZone ? 0.45 : 1
  const tokenAlpha =
    (player.side === 'away' ? 0.58 : hasActiveFocus && !isFocused ? 0.48 : 1) * zoneDimFactor

  addShadow(visualGroup, tokenRadius)

  if (player.side !== 'away' && focusedPlayerNumbers?.has(player.number)) {
    addFocusRing(visualGroup, tokenRadius)
  }

  const shapeScale = tokenRadius / SHAPER_HEAD_RADIUS_PX

  tokenSprite.anchor.set(0.5)
  tokenSprite.scale.set(shapeScale)
  tokenSprite.alpha = tokenAlpha
  // Shapers artwork naturally faces right. Rotate that axis onto the pitch so
  // home players default toward the top goal and away players toward the bottom.
  const facingAngle = player.facingAngle ?? (player.side === 'away' ? 180 : 0)
  tokenSprite.rotation =
    ((facingAngle + SHAPER_FORWARD_ROTATION_OFFSET_DEGREES) * Math.PI) / 180

  numberText.alpha = (hasActiveFocus && !isFocused ? 0.55 : 1) * zoneDimFactor
  numberText.anchor.set(0.5)
  numberText.position.set(0, 0)

  tokenContainer.position.set(screenPosition.sx, screenPosition.sy)
  visualGroup.addChild(tokenSprite)
  visualGroup.addChild(numberText)
  tokenContainer.addChild(visualGroup)
  container.addChild(tokenContainer)
  tokenRefs?.set(player.number, tokenContainer)
  idleAnchorRefs?.set(player.number, visualGroup)
  // tokenSprite is the only node future orientation tweens should rotate -
  // numberText, visualGroup, and tokenContainer must stay unrotated (see
  // Phase 3C audit). Exposed here, not yet consumed by any GSAP writer.
  spriteRefs?.set(player.number, tokenSprite)
}

export function drawPlayers(
  container: Container,
  players: SquadPlayer[],
  positions: PositionMap,
  canvasW: number,
  canvasH: number,
  padding: number,
  focusedPlayerNumbers?: Set<number>,
  tokenRefs?: Map<number, Container>,
  activeZones?: Set<number>,
  idleAnchorRefs?: Map<number, Container>,
  spriteRefs?: Map<number, Sprite>,
  tokenScale = 1,
): void {
  container.removeChildren()
  tokenRefs?.clear()
  idleAnchorRefs?.clear()
  spriteRefs?.clear()

  players.forEach((player) => {
    const position = positions[player.number]

    if (!position) {
      return
    }

    addToken(
      container,
      player,
      position,
      canvasW,
      canvasH,
      padding,
      focusedPlayerNumbers,
      tokenRefs,
      activeZones,
      idleAnchorRefs,
      spriteRefs,
      tokenScale,
    )
  })
}
