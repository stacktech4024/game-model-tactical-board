import { Application, Container, Graphics, Text } from 'pixi.js'
import { useEffect, useRef } from 'react'
import type { SquadPlayer } from '../../domain/players/playerTypes'
import { PITCH } from '../../domain/pitch/pitchConstants'
import { preloadTokenAssets } from './assets/preloadTokenAssets'
import { drawBall } from './layers/BallLayer'
import { drawChannels } from './layers/ChannelLayer'
import { drawGoals } from './layers/GoalLayer'
import { drawGrass } from './layers/GrassLayer'
import { drawMarkings } from './layers/MarkingsLayer'
import { drawPlayers } from './layers/PlayerLayer'
import { drawZones } from './layers/ZoneLayer'

type PixiPitchPreviewPlayer = {
  id: string
  label: string
  x: number
  y: number
  tone?: 'primary' | 'keeper' | 'opponent'
}

export type PixiPitchPreviewProps = {
  width: number
  height: number
  players: PixiPitchPreviewPlayer[]
  ballPosition: { x: number; y: number }
}

const PITCH_PADDING = 32

function percentageToPitchPosition(x: number, y: number) {
  return {
    x: (x * PITCH.WIDTH) / 100,
    y: (y * PITCH.LENGTH) / 100,
  }
}

function buildPlayerAdapter(players: PixiPitchPreviewPlayer[]) {
  const squad: SquadPlayer[] = []
  const positions: Record<number, { x: number; y: number }> = {}
  const labels = new Map<number, string>()

  players.forEach((player, index) => {
    const number = index + 1
    const isGoalkeeper = player.tone === 'keeper'
    const isOpponent = player.tone === 'opponent'

    squad.push({
      id: player.id,
      number,
      name: player.label,
      position: isGoalkeeper ? 'GK' : 'CM',
      isGoalkeeper,
      side: isOpponent ? 'away' : 'home',
    })
    positions[number] = percentageToPitchPosition(player.x, player.y)
    labels.set(number, player.label)
  })

  return { squad, positions, labels }
}

export function PixiPitchPreview({
  width,
  height,
  players,
  ballPosition,
}: PixiPitchPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return undefined
    }

    const app = new Application()
    let cancelled = false
    let initialized = false
    let destroyed = false

    const destroyApp = () => {
      if (destroyed) {
        return
      }

      destroyed = true
      app.destroy(true)
    }

    const mount = async () => {
      await Promise.all([
        app.init({
          width,
          height,
          background: 0x1a1a1a,
          antialias: true,
          autoDensity: true,
        }),
        preloadTokenAssets(),
      ])

      initialized = true

      if (cancelled) {
        destroyApp()
        return
      }

      const grassLayer = new Graphics()
      const zonesLayer = new Graphics()
      const channelsLayer = new Graphics()
      const markingsLayer = new Graphics()
      const goalsLayer = new Graphics()
      const ballLayer = new Container()
      const playerLayer = new Container()
      const playerTokenRefs = new Map<number, Container>()
      const { squad, positions, labels } = buildPlayerAdapter(players)

      app.stage.addChild(grassLayer)
      app.stage.addChild(zonesLayer)
      app.stage.addChild(channelsLayer)
      app.stage.addChild(markingsLayer)
      app.stage.addChild(goalsLayer)
      app.stage.addChild(ballLayer)
      app.stage.addChild(playerLayer)

      container.textContent = ''
      container.appendChild(app.canvas)

      drawGrass(grassLayer, width, height, PITCH_PADDING)
      drawZones(zonesLayer, app.stage, width, height, PITCH_PADDING)
      drawChannels(channelsLayer, width, height, PITCH_PADDING)
      drawMarkings(markingsLayer, width, height, PITCH_PADDING)
      drawGoals(goalsLayer, width, height, PITCH_PADDING)
      drawPlayers(
        playerLayer,
        squad,
        positions,
        width,
        height,
        PITCH_PADDING,
        undefined,
        playerTokenRefs,
      )

      playerTokenRefs.forEach((tokenContainer, number) => {
        const numberText = tokenContainer.getChildAt(0)?.children.find(
          (child) => child instanceof Text,
        )

        if (numberText instanceof Text) {
          numberText.text = labels.get(number) ?? numberText.text
        }
      })

      const ballPitchPosition = percentageToPitchPosition(ballPosition.x, ballPosition.y)
      drawBall(ballLayer, ballPitchPosition, width, height, PITCH_PADDING)
    }

    void mount()

    return () => {
      cancelled = true

      if (!initialized) {
        return
      }

      if (app.canvas.parentElement === container) {
        container.removeChild(app.canvas)
      }

      destroyApp()
    }
  }, [ballPosition, height, players, width])

  return <div ref={containerRef} className="pixi-pitch-preview" />
}
