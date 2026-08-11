import { useCallback, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import { PRESENTATION_PAGE_ORDER, PRESENTATION_PAGE_LABELS } from './data/pageOrder'
import type { PresentationPageId } from './data/pageOrder'
import './PresentationLayout.css'

type PresentationLayoutProps = {
  pageId: PresentationPageId
  children: ReactNode
  noPadding?: boolean
}

export function PresentationLayout({ pageId, children, noPadding = false }: PresentationLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const currentIndex = PRESENTATION_PAGE_ORDER.indexOf(pageId)
  const prevPage = currentIndex > 0 ? PRESENTATION_PAGE_ORDER[currentIndex - 1] : null
  const nextPage =
    currentIndex < PRESENTATION_PAGE_ORDER.length - 1 ? PRESENTATION_PAGE_ORDER[currentIndex + 1] : null
  const getPagePath = useCallback((targetPage: PresentationPageId) => {
    const preserveHowWeTrainExample =
      (pageId === 'how-we-train-session' && targetPage === 'how-we-train-transfer')
      || (pageId === 'how-we-train-transfer' && targetPage === 'how-we-train-session')

    return `/presentation/${targetPage}${preserveHowWeTrainExample ? location.search : ''}`
  }, [location.search, pageId])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      const isInteractiveTarget = target instanceof Element && Boolean(target.closest(
        'input, textarea, select, button, [role="slider"], [role="group"], [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]',
      ))

      if (isInteractiveTarget) {
        return
      }

      if (event.key === 'ArrowRight' && nextPage) {
        navigate(getPagePath(nextPage))
      }
      if (event.key === 'ArrowLeft' && prevPage) {
        navigate(getPagePath(prevPage))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [getPagePath, navigate, nextPage, prevPage])

  // params is intentionally unused beyond confirming route match; kept for future deep-linking needs
  void params

  return (
    <div className="presentation-shell">
      <div className="presentation-progress" role="navigation" aria-label="Presentation pages">
        {PRESENTATION_PAGE_ORDER.map((id, index) => (
          <button
            key={id}
            type="button"
            className={index === currentIndex ? 'presentation-dot is-active' : 'presentation-dot'}
            onClick={() => navigate(getPagePath(id))}
            aria-label={PRESENTATION_PAGE_LABELS[id]}
            aria-current={index === currentIndex ? 'page' : undefined}
          />
        ))}
      </div>

      <main className={noPadding ? 'presentation-page presentation-page--no-padding' : 'presentation-page'}>
        {children}
      </main>

      <div className="presentation-nav">
        <button
          type="button"
          className="presentation-nav__button"
          disabled={!prevPage}
          onClick={() => prevPage && navigate(getPagePath(prevPage))}
        >
          ← Back
        </button>
        <span className="presentation-nav__label">
          {currentIndex + 1} / {PRESENTATION_PAGE_ORDER.length} — {PRESENTATION_PAGE_LABELS[pageId]}
        </span>
        <button
          type="button"
          className="presentation-nav__button"
          disabled={!nextPage}
          onClick={() => nextPage && navigate(getPagePath(nextPage))}
        >
          Next →
        </button>
      </div>
    </div>
  )
}
