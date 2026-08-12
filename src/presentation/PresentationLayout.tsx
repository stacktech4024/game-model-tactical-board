import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import { PRESENTATION_PAGE_ORDER, PRESENTATION_PAGE_LABELS } from './data/pageOrder'
import type { PresentationPageId } from './data/pageOrder'
import {
  EVALUATOR_PAGE_ORDER,
  EVALUATOR_TOTAL_SECONDS,
  formatPlannedTime,
  getEvaluatorStep,
} from './data/evaluatorPresentation'
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
  const isEvaluatorMode = new URLSearchParams(location.search).get('mode') === 'evaluator'
  const pageOrder = isEvaluatorMode ? EVALUATOR_PAGE_ORDER : PRESENTATION_PAGE_ORDER
  const currentIndex = pageOrder.indexOf(pageId)
  const prevPage = currentIndex > 0 ? pageOrder[currentIndex - 1] : null
  const nextPage =
    currentIndex < pageOrder.length - 1 ? pageOrder[currentIndex + 1] : null
  const evaluatorStep = isEvaluatorMode ? getEvaluatorStep(pageId) : undefined
  const [rehearsalElapsed, setRehearsalElapsed] = useState(0)
  const [rehearsalRunning, setRehearsalRunning] = useState(false)
  const getPagePath = useCallback((targetPage: PresentationPageId) => {
    const howWeTrainDetailPages: PresentationPageId[] = [
      'how-we-train-session',
      'how-we-train-pictures',
      'how-we-train-transfer',
    ]
    if (isEvaluatorMode) {
      const evaluatorParams = new URLSearchParams({ mode: 'evaluator' })
      if (howWeTrainDetailPages.includes(targetPage)) evaluatorParams.set('example', 'central-wide')
      return `/presentation/${targetPage}?${evaluatorParams.toString()}`
    }

    const preserveHowWeTrainExample = howWeTrainDetailPages.includes(pageId)
      && howWeTrainDetailPages.includes(targetPage)

    return `/presentation/${targetPage}${preserveHowWeTrainExample ? location.search : ''}`
  }, [isEvaluatorMode, location.search, pageId])

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

  useEffect(() => {
    if (!isEvaluatorMode) return

    const updateRehearsalClock = () => {
      const startedAt = Number(window.sessionStorage.getItem('evaluatorRehearsalStartedAt'))
      if (!Number.isFinite(startedAt) || startedAt <= 0) {
        setRehearsalRunning(false)
        setRehearsalElapsed(0)
        return
      }
      setRehearsalRunning(true)
      setRehearsalElapsed(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)))
    }

    updateRehearsalClock()
    const timer = window.setInterval(updateRehearsalClock, 1000)
    return () => window.clearInterval(timer)
  }, [isEvaluatorMode])

  const startRehearsalClock = () => {
    window.sessionStorage.setItem('evaluatorRehearsalStartedAt', String(Date.now()))
    setRehearsalElapsed(0)
    setRehearsalRunning(true)
  }

  // params is intentionally unused beyond confirming route match; kept for future deep-linking needs
  void params

  return (
    <div className={isEvaluatorMode ? 'presentation-shell presentation-shell--evaluator' : 'presentation-shell'}>
      {isEvaluatorMode && evaluatorStep && (
        <div className="evaluator-mode-bar" aria-label="Evaluator presentation status">
          <button type="button" onClick={() => navigate('/evaluator')}>20:00 RUN OF SHOW</button>
          <span>{evaluatorStep.section}</span>
          <strong>{formatPlannedTime(evaluatorStep.plannedSeconds)} planned</strong>
          <button type="button" onClick={startRehearsalClock}>{rehearsalRunning ? 'RESTART TIMER' : 'START TIMER'}</button>
          <small className={rehearsalElapsed > EVALUATOR_TOTAL_SECONDS ? 'is-over' : ''}>
            {formatPlannedTime(rehearsalElapsed)} / {formatPlannedTime(EVALUATOR_TOTAL_SECONDS)}
          </small>
        </div>
      )}

      <div className="presentation-progress" role="navigation" aria-label={isEvaluatorMode ? 'Evaluator presentation pages' : 'Presentation pages'}>
        {pageOrder.map((id, index) => (
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

      {isEvaluatorMode && evaluatorStep && (
        <details className="evaluator-speaker-notes">
          <summary>Speaker notes · {evaluatorStep.purpose}</summary>
          <div>
            {evaluatorStep.script.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {evaluatorStep.interaction && <p><b>Interaction:</b> {evaluatorStep.interaction}</p>}
            <p><b>Transition:</b> {evaluatorStep.transition}</p>
          </div>
        </details>
      )}

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
          {isEvaluatorMode ? 'Evaluator · ' : ''}{currentIndex + 1} / {pageOrder.length} — {PRESENTATION_PAGE_LABELS[pageId]}
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
