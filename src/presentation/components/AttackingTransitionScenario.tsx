import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import {
  ATTACKING_TRANSITION_BALL_START,
  ATTACKING_TRANSITION_CAPTION,
  ATTACKING_TRANSITION_MOVEMENTS,
  ATTACKING_TRANSITION_PLAYERS,
  type AttackingTransitionPoint,
} from '../data/attackingTransitionScenario'

function toPositionVars(point: AttackingTransitionPoint) {
  return { left: `${point.x}%`, top: `${point.y}%` }
}

export function AttackingTransitionScenario() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const ballRef = useRef<HTMLDivElement | null>(null)
  const playerRefs = useRef(new Map<string, HTMLDivElement>())
  const routeRefs = useRef(new Map<string, SVGLineElement>())
  const [activeCue, setActiveCue] = useState('Regain')

  useEffect(() => {
    const root = rootRef.current
    const ball = ballRef.current
    if (!root || !ball) return undefined

    const ctx = gsap.context(() => {
      const resetVisuals = () => {
        ATTACKING_TRANSITION_PLAYERS.forEach((player) => {
          const token = playerRefs.current.get(player.id)
          if (token) gsap.set(token, { ...toPositionVars(player.start), scale: 1, opacity: player.tone === 'opponent' ? 0.42 : 1 })
        })
        routeRefs.current.forEach((route) => gsap.set(route, { opacity: 0 }))
        gsap.set(ball, { ...toPositionVars(ATTACKING_TRANSITION_BALL_START), opacity: 1 })
      }

      resetVisuals()
      const timeline = gsap.timeline({
        repeat: -1,
        repeatDelay: 1.15,
        defaults: { ease: 'power2.inOut' },
      })

      timeline.call(resetVisuals)
      timeline.call(() => setActiveCue('Regain'))
      timeline.to(playerRefs.current.get('regainer') ?? {}, {
        scale: 1.22,
        duration: 0.14,
        repeat: 1,
        yoyo: true,
        ease: 'power1.inOut',
      })

      const firstPass = ATTACKING_TRANSITION_MOVEMENTS.find((movement) => movement.id === 'first-pass')
      const runnerMovements = ATTACKING_TRANSITION_MOVEMENTS.filter((movement) =>
        ['nine-stretch', 'left-run', 'right-run'].includes(movement.id),
      )

      timeline.call(() => setActiveCue('Forward first — runners go'))
      timeline.addLabel('release')
      if (firstPass) {
        const route = routeRefs.current.get(firstPass.id)
        if (route) timeline.to(route, { opacity: 0.94, duration: 0.08 }, 'release')
        timeline.to(ball, { ...toPositionVars(firstPass.to), duration: 0.46, ease: 'power3.out' }, 'release')
      }
      runnerMovements.forEach((movement) => {
        const route = routeRefs.current.get(movement.id)
        const token = movement.playerId ? playerRefs.current.get(movement.playerId) : undefined
        if (route) timeline.to(route, { opacity: 0.9, duration: 0.1 }, 'release')
        if (token) timeline.to(token, { ...toPositionVars(movement.to), duration: 0.68, ease: 'power3.out' }, 'release')
      })

      const support = ATTACKING_TRANSITION_MOVEMENTS.find((movement) => movement.id === 'eight-support')
      timeline.call(() => setActiveCue('Support underneath'))
      if (support) {
        const route = routeRefs.current.get(support.id)
        const token = support.playerId ? playerRefs.current.get(support.playerId) : undefined
        if (route) timeline.to(route, { opacity: 0.9, duration: 0.08 })
        if (token) timeline.to(token, { ...toPositionVars(support.to), duration: 0.42, ease: 'power2.out' }, '<')
      }
      timeline.call(() => setActiveCue('Counter shape formed'))
      timeline.to({}, { duration: 0.4 })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div className="mini-pitch mini-pitch--animated transition-modal-pitch" ref={rootRef}>
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
        {ATTACKING_TRANSITION_MOVEMENTS.map((movement) => (
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

      {ATTACKING_TRANSITION_PLAYERS.map((player) => (
        <div
          key={player.id}
          ref={(node) => {
            if (node) playerRefs.current.set(player.id, node)
            else playerRefs.current.delete(player.id)
          }}
          className={[
            'mini-pitch__token',
            'mini-pitch__token--animated',
            player.tone === 'support' ? 'mini-pitch__token--support' : '',
            player.tone === 'opponent' ? 'transition-pitch__token--opponent' : '',
          ].filter(Boolean).join(' ')}
          aria-label={`${player.label || 'Opponent'} ${player.role}`}
        >
          {player.label}
        </div>
      ))}

      <div className="mini-pitch__ball transition-pitch__ball" ref={ballRef} aria-label="Ball" />
      <div className="mini-pitch__cue" aria-live="polite">{activeCue}</div>
      <div className="mini-pitch__caption">{ATTACKING_TRANSITION_CAPTION}</div>
      <div className="mini-pitch__legend" aria-label="Diagram key">
        <span><i className="mini-pitch__legend-mark mini-pitch__legend-mark--pass" />Pass</span>
        <span><i className="mini-pitch__legend-mark mini-pitch__legend-mark--run" />Player run</span>
      </div>
    </div>
  )
}
