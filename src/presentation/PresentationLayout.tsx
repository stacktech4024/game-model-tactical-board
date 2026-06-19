import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
  const params = useParams()
  const currentIndex = PRESENTATION_PAGE_ORDER.indexOf(pageId)
  const prevPage = currentIndex > 0 ? PRESENTATION_PAGE_ORDER[currentIndex - 1] : null
  const nextPage =
    currentIndex < PRESENTATION_PAGE_ORDER.length - 1 ? PRESENTATION_PAGE_ORDER[currentIndex + 1] : null

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' && nextPage) {
        navigate(`/presentation/${nextPage}`)
      }
      if (event.key === 'ArrowLeft' && prevPage) {
        navigate(`/presentation/${prevPage}`)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate, nextPage, prevPage])

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
            onClick={() => navigate(`/presentation/${id}`)}
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
          onClick={() => prevPage && navigate(`/presentation/${prevPage}`)}
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
          onClick={() => nextPage && navigate(`/presentation/${nextPage}`)}
        >
          Next →
        </button>
      </div>
    </div>
  )
}
