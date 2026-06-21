import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import {
  FULLBACK_SKILL_SCENARIOS,
  type FullbackScenarioPoint,
  type FullbackSkillVariant,
} from '../data/fullbackSkillScenario'

function toPositionVars(point: FullbackScenarioPoint) {
  return {
    left: `${point.x}%`,
    top: `${point.y}%`,
  }
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
    <div className="mini-pitch mini-pitch--animated" ref={rootRef}>
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
          className={
            player.tone === 'keeper'
              ? 'mini-pitch__token mini-pitch__token--animated mini-pitch__token--support'
              : 'mini-pitch__token mini-pitch__token--animated'
          }
          aria-label={`${player.label} ${player.role}`}
        >
          {player.label}
        </div>
      ))}

      <div className="mini-pitch__ball" ref={ballRef} aria-label="Ball" />
      <div className="mini-pitch__cue" aria-live="polite">{activeCue}</div>
      <div className="mini-pitch__caption">{scenario.caption}</div>
      <div className="mini-pitch__legend" aria-label="Diagram key">
        {scenario.legend.map((item) => (
          <span key={item.label}>
            <i className={`mini-pitch__legend-mark mini-pitch__legend-mark--${item.markClass}`} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}
