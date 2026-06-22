import { Application, Container, Graphics, Text } from 'pixi.js'
import { gsap } from 'gsap'
import { useEffect, useRef } from 'react'
import type { SquadPlayer } from '../../domain/players/playerTypes'
import { pitchToScreen } from '../../domain/pitch/coordTransforms'
import { PITCH } from '../../domain/pitch/pitchConstants'
import type { ScenarioArrow } from '../../domain/scenarios/scenarioTypes'
import { preloadTokenAssets } from './assets/preloadTokenAssets'
import { drawScenarioArrows } from './layers/ArrowLayer'
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

export type PixiPitchPreviewStep = {
  id: string
  playerId?: string
  playerTo?: { x: number; y: number }
  playerMoves?: { playerId: string; to: { x: number; y: number } }[]
  ballFrom?: { x: number; y: number }
  ballTo?: { x: number; y: number }
  duration: number
  emphasizePlayerId?: string
  cue: string
  emphasisCue?: string
}

export type PixiPitchPreviewRoute = {
  id: string
  from: { x: number; y: number }
  to: { x: number; y: number }
  type: 'pass' | 'run' | 'dribble' | 'press' | 'recovery'
  revealOnStepId?: string
}

export type PixiPitchPreviewProps = {
  width: number
  height: number
  players: PixiPitchPreviewPlayer[]
  ballPosition: { x: number; y: number }
  steps?: PixiPitchPreviewStep[]
  repeatDelay?: number
  onCueChange?: (cue: string) => void
  routes?: PixiPitchPreviewRoute[]
}

const PITCH_PADDING = 32

function percentageToPitchPosition(x: number, y: number) {
  return {
    x: (x * PITCH.WIDTH) / 100,
    y: (y * PITCH.LENGTH) / 100,
  }
}

function percentageToScreenPosition(
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const pitchPosition = percentageToPitchPosition(x, y)
  const screenPosition = pitchToScreen(
    pitchPosition.x,
    pitchPosition.y,
    width,
    height,
    PITCH_PADDING,
  )

  return { x: screenPosition.sx, y: screenPosition.sy }
}

function buildPlayerAdapter(players: PixiPitchPreviewPlayer[]) {
  const squad: SquadPlayer[] = []
  const positions: Record<number, { x: number; y: number }> = {}
  const labels = new Map<number, string>()
  const numbersById = new Map<string, number>()

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
    numbersById.set(player.id, number)
  })

  return { squad, positions, labels, numbersById }
}

export function PixiPitchPreview({
  width,
  height,
  players,
  ballPosition,
  steps,
  repeatDelay = 1.5,
  onCueChange,
  routes,
}: PixiPitchPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const gsapContextRef = useRef<gsap.Context | null>(null)
  const onCueChangeRef = useRef(onCueChange)

  useEffect(() => {
    onCueChangeRef.current = onCueChange
  }, [onCueChange])

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return undefined
    }

    const app = new Application()
    let cancelled = false
    let initialized = false
    let destroyed = false

    gsapContextRef.current?.revert()
    gsapContextRef.current = null

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
      const routesLayer = new Container()
      const ballLayer = new Container()
      const playerLayer = new Container()
      const playerTokenRefs = new Map<number, Container>()
      const routeGraphicsByRevealStepId = new Map<string, Graphics[]>()
      const { squad, positions, labels, numbersById } = buildPlayerAdapter(players)

      app.stage.addChild(grassLayer)
      app.stage.addChild(zonesLayer)
      app.stage.addChild(channelsLayer)
      app.stage.addChild(markingsLayer)
      app.stage.addChild(goalsLayer)
      app.stage.addChild(routesLayer)
      app.stage.addChild(ballLayer)
      app.stage.addChild(playerLayer)

      container.textContent = ''
      container.appendChild(app.canvas)

      drawGrass(grassLayer, width, height, PITCH_PADDING)
      drawZones(zonesLayer, app.stage, width, height, PITCH_PADDING)
      drawChannels(channelsLayer, width, height, PITCH_PADDING)
      drawMarkings(markingsLayer, width, height, PITCH_PADDING)
      drawGoals(goalsLayer, width, height, PITCH_PADDING)

      routes?.forEach((route) => {
        const routeGraphics = new Graphics()
        const arrow: ScenarioArrow = {
          id: route.id,
          type: route.type,
          from: percentageToPitchPosition(route.from.x, route.from.y),
          to: percentageToPitchPosition(route.to.x, route.to.y),
        }

        drawScenarioArrows(
          routeGraphics,
          [arrow],
          width,
          height,
          PITCH_PADDING,
        )
        routeGraphics.alpha = route.revealOnStepId ? 0 : 1
        routesLayer.addChild(routeGraphics)

        if (route.revealOnStepId) {
          const stepRoutes = routeGraphicsByRevealStepId.get(route.revealOnStepId) ?? []

          stepRoutes.push(routeGraphics)
          routeGraphicsByRevealStepId.set(route.revealOnStepId, stepRoutes)
        }
      })

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
      const ballToken = drawBall(ballLayer, ballPitchPosition, width, height, PITCH_PADDING)

      if (steps?.length && ballToken) {
        const playerTokensById = new Map<string, Container>()
        const initialPlayerPositions = new Map<string, { x: number; y: number }>()

        numbersById.forEach((number, id) => {
          const token = playerTokenRefs.get(number)

          if (token) {
            playerTokensById.set(id, token)
            initialPlayerPositions.set(id, { x: token.position.x, y: token.position.y })
          }
        })

        const initialBallPosition = {
          x: ballToken.position.x,
          y: ballToken.position.y,
        }

        const ctx = gsap.context(() => {
          const resetVisuals = () => {
            initialPlayerPositions.forEach((position, id) => {
              const token = playerTokensById.get(id)

              if (token) {
                token.position.set(position.x, position.y)
                token.scale.set(1)
              }
            })
            ballToken.position.set(initialBallPosition.x, initialBallPosition.y)
            routeGraphicsByRevealStepId.forEach((stepRoutes) => {
              stepRoutes.forEach((routeGraphics) => {
                routeGraphics.alpha = 0
              })
            })
          }

          resetVisuals()
          onCueChangeRef.current?.(steps[0]?.cue ?? '')

          const timeline = gsap.timeline({
            repeat: -1,
            repeatDelay,
            defaults: {
              ease: 'power1.inOut',
            },
          })

          timeline.call(resetVisuals)

          steps.forEach((step, stepIndex) => {
            if (step.emphasizePlayerId) {
              const emphasisToken = playerTokensById.get(step.emphasizePlayerId)

              timeline.call(() => {
                onCueChangeRef.current?.(step.emphasisCue ?? step.cue)
              })

              if (emphasisToken) {
                timeline.to(emphasisToken.scale, {
                  x: 1.18,
                  y: 1.18,
                  duration: 0.18,
                  ease: 'power1.inOut',
                  repeat: 1,
                  yoyo: true,
                })
              }

              timeline.to({}, { duration: 0.12 })
            }

            const stepLabel = `preview-step-${stepIndex}`

            timeline.addLabel(stepLabel)
            timeline.call(() => {
              onCueChangeRef.current?.(step.cue)
            })

            if (step.ballFrom) {
              timeline.set(
                ballToken.position,
                percentageToScreenPosition(
                  step.ballFrom.x,
                  step.ballFrom.y,
                  width,
                  height,
                ),
              )
            }

            const playerToken = step.playerId
              ? playerTokensById.get(step.playerId)
              : undefined

            if (playerToken && step.playerTo) {
              timeline.to(playerToken.position, {
                ...percentageToScreenPosition(
                  step.playerTo.x,
                  step.playerTo.y,
                  width,
                  height,
                ),
                duration: step.duration,
                ease: 'power2.inOut',
              })
            }

            if (step.ballTo) {
              timeline.to(
                ballToken.position,
                {
                  ...percentageToScreenPosition(
                    step.ballTo.x,
                    step.ballTo.y,
                    width,
                    height,
                  ),
                  duration: step.duration,
                  ease: 'power1.inOut',
                },
                playerToken ? '<35%' : undefined,
              )
            }

            step.playerMoves?.forEach((move) => {
              const moveToken = playerTokensById.get(move.playerId)

              if (moveToken) {
                timeline.to(
                  moveToken.position,
                  {
                    ...percentageToScreenPosition(
                      move.to.x,
                      move.to.y,
                      width,
                      height,
                    ),
                    duration: step.duration,
                    ease: 'power2.inOut',
                  },
                  stepLabel,
                )
              }
            })

            routeGraphicsByRevealStepId.get(step.id)?.forEach((routeGraphics) => {
              timeline.to(
                routeGraphics,
                {
                  alpha: 1,
                  duration: 0.12,
                  ease: 'power1.out',
                },
                stepLabel,
              )
            })
          })
        }, container)

        gsapContextRef.current = ctx
      }
    }

    void mount()

    return () => {
      cancelled = true
      gsapContextRef.current?.revert()
      gsapContextRef.current = null

      if (!initialized) {
        return
      }

      if (app.canvas.parentElement === container) {
        container.removeChild(app.canvas)
      }

      destroyApp()
    }
  }, [ballPosition, height, players, repeatDelay, routes, steps, width])

  return <div ref={containerRef} className="pixi-pitch-preview" />
}
