import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import {
  DEFENSIVE_TRANSITION_BALL,
  DEFENSIVE_TRANSITION_CAPTION,
  DEFENSIVE_TRANSITION_MOVEMENTS,
  DEFENSIVE_TRANSITION_PLAYERS,
  type DefensiveTransitionPoint,
} from '../data/defensiveTransitionScenario'

function toPositionVars(point: DefensiveTransitionPoint) {
  return { left: `${point.x}%`, top: `${point.y}%` }
}

const DEFENSIVE_TRANSITION_IDLE_PLAYER_IDS = ['opponent-carrier', 'opponent-outlet']

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

export function DefensiveTransitionScenario() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const ballRef = useRef<HTMLDivElement | null>(null)
  const playerRefs = useRef(new Map<string, HTMLDivElement>())
  const routeRefs = useRef(new Map<string, SVGLineElement>())
  const [activeCue, setActiveCue] = useState('Ball lost')

  useEffect(() => {
    const root = rootRef.current
    const ball = ballRef.current

    if (!root || !ball) return undefined

    const ctx = gsap.context(() => {
      const resetVisuals = () => {
        DEFENSIVE_TRANSITION_PLAYERS.forEach((player) => {
          const token = playerRefs.current.get(player.id)
          if (token) gsap.set(token, { ...toPositionVars(player.start), scale: 1, opacity: 1 })
        })
        routeRefs.current.forEach((route) => gsap.set(route, { opacity: 0 }))
        gsap.set(ball, { ...toPositionVars(DEFENSIVE_TRANSITION_BALL), opacity: 1, scale: 1 })
      }

      resetVisuals()
      DEFENSIVE_TRANSITION_IDLE_PLAYER_IDS.forEach((playerId, index) => {
        const token = playerRefs.current.get(playerId)

        if (token) {
          startIdleWander(token, index)
        }
      })
      const timeline = gsap.timeline({
        repeat: -1,
        repeatDelay: 1,
        defaults: { ease: 'power2.inOut' },
      })

      timeline.call(resetVisuals)
      timeline.call(() => setActiveCue('Ball lost'))
      timeline.to(playerRefs.current.get('loss-player') ?? {}, {
        scale: 1.24,
        duration: 0.12,
        repeat: 3,
        yoyo: true,
        ease: 'power1.inOut',
      })

      const addMovement = (movementId: string, cue: string, duration: number) => {
        const movement = DEFENSIVE_TRANSITION_MOVEMENTS.find((item) => item.id === movementId)
        if (!movement) return
        const token = playerRefs.current.get(movement.playerId)
        const route = routeRefs.current.get(movement.id)

        timeline.call(() => setActiveCue(cue))
        if (route) timeline.to(route, { opacity: 0.94, duration: 0.1 })
        if (token) timeline.to(token, { ...toPositionVars(movement.to), duration, ease: 'power3.out' }, '<')
      }

      addMovement('nearest-press', 'Nearest player presses', 0.42)
      addMovement('block-escape', 'Block forward escape', 0.38)
      addMovement('six-cover', '#6 protects Channel 3', 0.4)

      timeline.call(() => setActiveCue('Back line holds'))
      timeline.to(
        ['left-back', 'left-centre-back', 'right-centre-back', 'right-back']
          .map((id) => playerRefs.current.get(id))
          .filter(Boolean),
        { scale: 1.08, duration: 0.16, repeat: 1, yoyo: true, stagger: 0.03 },
      )
      timeline.call(() => setActiveCue('Compact shape secured'))
      timeline.to(ball, { opacity: 0.48, duration: 0.2 })
      timeline.to({}, { duration: 0.35 })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div className="mini-pitch mini-pitch--animated transition-modal-pitch" ref={rootRef}>
      <div className="transition-pitch__dim transition-pitch__dim--top" aria-hidden="true" />
      <div className="transition-pitch__dim transition-pitch__dim--bottom" aria-hidden="true" />
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

      <svg className="transition-pitch__routes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {DEFENSIVE_TRANSITION_MOVEMENTS.map((movement) => (
          <line
            key={movement.id}
            ref={(node) => {
              if (node) routeRefs.current.set(movement.id, node)
              else routeRefs.current.delete(movement.id)
            }}
            className={`transition-pitch__route transition-pitch__route--${movement.kind}`}
            x1={movement.from.x}
            y1={movement.from.y}
            x2={movement.to.x}
            y2={movement.to.y}
          />
        ))}
      </svg>

      {DEFENSIVE_TRANSITION_PLAYERS.map((player) => (
        <div
          key={player.id}
          ref={(node) => {
            if (node) playerRefs.current.set(player.id, node)
            else playerRefs.current.delete(player.id)
          }}
          className={player.tone === 'support'
            ? 'mini-pitch__token mini-pitch__token--animated mini-pitch__token--support'
            : 'mini-pitch__token mini-pitch__token--animated'}
          aria-label={`${player.label} ${player.role}`}
        >
          {player.label}
        </div>
      ))}

      <div className="mini-pitch__ball transition-pitch__ball" ref={ballRef} aria-label="Ball" />
      <div className="mini-pitch__cue" aria-live="polite">{activeCue}</div>
      <div className="mini-pitch__caption">{DEFENSIVE_TRANSITION_CAPTION}</div>
      <div className="mini-pitch__legend" aria-label="Diagram key">
        <span><i className="mini-pitch__legend-mark mini-pitch__legend-mark--run" />Pressure</span>
        <span><i className="mini-pitch__legend-mark mini-pitch__legend-mark--pass" />Recovery</span>
      </div>
    </div>
  )
}
