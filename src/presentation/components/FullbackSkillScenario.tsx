import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import {
  FULLBACK_SKILL_SCENARIOS,
  type FullbackScenarioPoint,
  type FullbackSkillScenarioData,
  type FullbackSkillVariant,
} from '../data/fullbackSkillScenario'

function toPositionVars(point: FullbackScenarioPoint) {
  return {
    left: `${point.x}%`,
    top: `${point.y}%`,
  }
}

function getIdlePlayerIds(scenario: FullbackSkillScenarioData) {
  const scriptedPlayerIds = new Set<string>()

  scenario.steps.forEach((step) => {
    if (step.playerId) {
      scriptedPlayerIds.add(step.playerId)
    }

    if (step.emphasizePlayerId) {
      scriptedPlayerIds.add(step.emphasizePlayerId)
    }
  })

  return scenario.players
    .map((player) => player.id)
    .filter((playerId) => !scriptedPlayerIds.has(playerId))
}

function startIdleWander(token: HTMLDivElement, index: number) {
  const angle = Math.random() * Math.PI * 2
  const distance = 1.4 + Math.random() * 1.1

  gsap.to(token, {
    xPercent: Math.cos(angle) * distance,
    yPercent: Math.sin(angle) * distance,
    duration: 2.5 + Math.random() * 2,
    delay: index * 0.18 + Math.random() * 0.6,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  })
}

type FullbackSkillScenarioProps = {
  variant: FullbackSkillVariant
}

export function FullbackSkillScenario({ variant }: FullbackSkillScenarioProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const ballRef = useRef<HTMLDivElement | null>(null)
  const playerRefs = useRef(new Map<string, HTMLDivElement>())
  const gsapContextRef = useRef<gsap.Context | null>(null)
  const scenario = FULLBACK_SKILL_SCENARIOS[variant]
  const [activeCue, setActiveCue] = useState(scenario.steps[0]?.cue ?? '')

  useEffect(() => {
    const root = rootRef.current
    const ball = ballRef.current
    const activeScenario = FULLBACK_SKILL_SCENARIOS[variant]

    gsapContextRef.current?.revert()
    gsapContextRef.current = null

    if (!root || !ball) {
      return undefined
    }

    setActiveCue(activeScenario.steps[0]?.cue ?? '')

    const ctx = gsap.context(() => {
      const resetVisuals = () => {
        activeScenario.players.forEach((player) => {
          const token = playerRefs.current.get(player.id)

          if (token) {
            gsap.set(token, { ...toPositionVars(player.start), scale: 1 })
          }
        })
        gsap.set(ball, toPositionVars(activeScenario.ballStart))
      }

      resetVisuals()
      getIdlePlayerIds(activeScenario).forEach((playerId, index) => {
        const token = playerRefs.current.get(playerId)

        if (token) {
          startIdleWander(token, index)
        }
      })

      const timeline = gsap.timeline({
        repeat: -1,
        repeatDelay: 1.5,
        defaults: {
          ease: 'power1.inOut',
        },
      })

      timeline.call(resetVisuals)

      activeScenario.steps.forEach((step) => {
        if (step.emphasizePlayerId) {
          const emphasisToken = playerRefs.current.get(step.emphasizePlayerId)

          timeline.call(() => setActiveCue(step.emphasisCue ?? step.cue))

          if (emphasisToken) {
            timeline.to(emphasisToken, {
              scale: 1.18,
              duration: 0.18,
              ease: 'power1.inOut',
              repeat: 1,
              yoyo: true,
            })
          }

          timeline.to({}, { duration: 0.12 })
        }

        timeline.call(() => setActiveCue(step.cue))

        if (step.ballFrom) {
          timeline.set(ball, toPositionVars(step.ballFrom))
        }

        if (step.playerId && step.playerTo) {
          const token = playerRefs.current.get(step.playerId)

          if (token) {
            timeline.to(token, {
              ...toPositionVars(step.playerTo),
              duration: step.duration,
              ease: 'power2.inOut',
            })
          }
        }

        if (step.ballTo) {
          timeline.to(ball, {
            ...toPositionVars(step.ballTo),
            duration: step.duration,
            ease: step.kind === 'cross' ? 'power2.out' : 'power1.inOut',
          }, step.playerId ? '<35%' : undefined)
        }
      })
    }, root)

    gsapContextRef.current = ctx

    return () => {
      ctx.revert()
      gsapContextRef.current = null
    }
  }, [variant])

  return (
    <div className="mini-pitch mini-pitch--animated fullback-skill-pitch" ref={rootRef}>
      <div className="mini-pitch__zone mini-pitch__zone--wide" aria-hidden="true" />
      <div className="mini-pitch__goal-area mini-pitch__goal-area--top" aria-hidden="true" />
      <div className="mini-pitch__goal-area mini-pitch__goal-area--bottom" aria-hidden="true" />
      <div className="mini-pitch__goal-box mini-pitch__goal-box--top" aria-hidden="true" />
      <div className="mini-pitch__goal-box mini-pitch__goal-box--bottom" aria-hidden="true" />
      <div className="mini-pitch__halfway-line" aria-hidden="true" />
      <div className="mini-pitch__centre-circle" aria-hidden="true" />
      <div className="mini-pitch__centre-mark" aria-hidden="true" />
      <div className="mini-pitch__zone-label mini-pitch__zone-label--one">Zone 1: Build Up</div>
      <div className="mini-pitch__zone-label mini-pitch__zone-label--two">Zone 2: Unbalance</div>
      <div className="mini-pitch__zone-label mini-pitch__zone-label--three">Zone 3: Supply</div>
      <div className="mini-pitch__zone-label mini-pitch__zone-label--four">Zone 4: Penetrate</div>
      <div className="mini-pitch__channel-label mini-pitch__channel-label--wide">Channel 1: Wide</div>
      <div className="mini-pitch__channel-label mini-pitch__channel-label--half">Channel 2: Half Space</div>
      <div className="mini-pitch__channel-label mini-pitch__channel-label--central">Channel 3: Central</div>

      {scenario.players.map((player) => (
        <div
          key={player.id}
          ref={(node) => {
            if (node) {
              playerRefs.current.set(player.id, node)
            } else {
              playerRefs.current.delete(player.id)
            }
          }}
          className={[
            'mini-pitch__token',
            'mini-pitch__token--animated',
            player.tone === 'keeper' ? 'mini-pitch__token--support' : '',
            player.tone === 'opponent' ? 'transition-pitch__token--opponent' : '',
          ].filter(Boolean).join(' ')}
          aria-label={`${player.label} ${player.role}`}
        >
          {player.label}
        </div>
      ))}

      <div className="mini-pitch__ball" ref={ballRef} aria-label="Ball" />
      <div className="mini-pitch__cue" aria-live="polite">{activeCue}</div>
      <div className="mini-pitch__caption">{scenario.caption}</div>
    </div>
  )
}
