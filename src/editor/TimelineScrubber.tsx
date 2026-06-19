import { useEffect, useState } from 'react'
import type { AnimatorState, ScenarioAnimator } from '../renderers/pixi/animation/scenarioAnimator'

type TimelineScrubberProps = {
  animatorRef: React.RefObject<ScenarioAnimator | null>
  playState: AnimatorState
  onPause?: () => void
  onProgressChange?: (progress: number) => void
}

export function TimelineScrubber({ animatorRef, playState, onPause, onProgressChange }: TimelineScrubberProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frameId: number | undefined

    const tick = () => {
      const nextProgress = animatorRef.current?.getProgress() ?? 0

      setProgress(nextProgress)
      onProgressChange?.(nextProgress)

      if (playState === 'playing') {
        frameId = requestAnimationFrame(tick)
      }
    }

    tick()

    return () => {
      if (frameId !== undefined) {
        cancelAnimationFrame(frameId)
      }
    }
  }, [animatorRef, onProgressChange, playState])

  const handleProgressChange = (value: number) => {
    setProgress(value)
    onProgressChange?.(value)
    animatorRef.current?.setProgress(value)
    animatorRef.current?.pause()
    onPause?.()
  }

  return (
    <div className="timeline-scrubber">
      <input
        type="range"
        min={0}
        max={1}
        step={0.001}
        value={progress}
        onChange={(event) => handleProgressChange(Number(event.target.value))}
        aria-label="Timeline progress"
      />
      <span>{Math.round(progress * 100)}%</span>
    </div>
  )
}
