import { useEffect, useRef, useState } from 'react'
import { PixiPitchPreview, type PixiPitchPreviewProps } from '../../renderers/pixi/PixiPitchPreview'

// Standard pitch aspect ratio (width:length), matches PITCH.WIDTH / PITCH.LENGTH (68 / 105).
const PITCH_ASPECT_RATIO = 68 / 105

// Debounce window resize handling so the canvas isn't torn down and rebuilt on every pixel.
const RESIZE_DEBOUNCE_MS = 200

type ResponsivePixiPitchPreviewProps = Omit<PixiPitchPreviewProps, 'width' | 'height'> & {
  maxWidth?: number
}

export function ResponsivePixiPitchPreview({ maxWidth, ...props }: ResponsivePixiPitchPreviewProps) {
  const measureRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState<{ width: number; height: number } | null>(null)

  useEffect(() => {
    const measureEl = measureRef.current

    if (!measureEl) {
      return undefined
    }

    const computeSize = () => {
      const containerWidth = measureEl.clientWidth
      const width = Math.max(1, Math.round(maxWidth ? Math.min(containerWidth, maxWidth) : containerWidth))
      const height = Math.round(width / PITCH_ASPECT_RATIO)
      setSize({ width, height })
    }

    // Measure once after initial layout. Deliberately NOT using a ResizeObserver here:
    // observing an element that contains the very canvas being sized creates a feedback
    // loop (canvas mounts -> nudges page layout/scrollbar -> element width changes ->
    // canvas torn down and remounted -> repeat), which presents as a constant flicker.
    // Window resize is independent of that internal layout churn, so it's safe to react to.
    computeSize()

    let resizeTimeout: ReturnType<typeof setTimeout> | undefined

    const handleWindowResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }

      resizeTimeout = setTimeout(computeSize, RESIZE_DEBOUNCE_MS)
    }

    window.addEventListener('resize', handleWindowResize)

    return () => {
      window.removeEventListener('resize', handleWindowResize)

      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
    }
  }, [maxWidth])

  return (
    <div ref={measureRef} style={{ width: '100%' }}>
      <div style={{ display: 'grid', placeItems: 'center' }}>
        {size && <PixiPitchPreview width={size.width} height={size.height} {...props} />}
      </div>
    </div>
  )
}


