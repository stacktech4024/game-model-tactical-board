import { useState } from 'react'
import { PresentationLayout } from '../PresentationLayout'
import { PICKERING_GAME_MODEL } from '../../data/gameModel'

const PHILOSOPHY_CARDS = [
  {
    id: 'possession',
    title: 'Possession',
    note: `${PICKERING_GAME_MODEL.possession}. The ball is our tool to control rhythm and move the opponent.`,
  },
  {
    id: 'width',
    title: 'Width',
    note: `${PICKERING_GAME_MODEL.buildUp}. We use wide channels to stretch pressure and create clean forward options.`,
  },
  {
    id: 'purpose',
    title: 'Purpose',
    note: `${PICKERING_GAME_MODEL.finishing}. Every pass and run should move us closer to a clear chance.`,
  },
]

export function IntroPage() {
  const [activeCardId, setActiveCardId] = useState(PHILOSOPHY_CARDS[0].id)
  const activeCard = PHILOSOPHY_CARDS.find((card) => card.id === activeCardId) ?? PHILOSOPHY_CARDS[0]

  return (
    <PresentationLayout pageId="intro">
      <p className="presentation-eyebrow">Section 1 — the why</p>
      <h1 className="presentation-title">Who we are</h1>
      <p className="presentation-body">Our identity is simple: control the ball, stretch the field, attack with intent.</p>

      <div className="reveal-card-row" role="tablist" aria-label="Coaching philosophy">
        {PHILOSOPHY_CARDS.map((card) => (
          <button
            key={card.id}
            type="button"
            role="tab"
            aria-selected={card.id === activeCardId}
            className={card.id === activeCardId ? 'reveal-card is-active' : 'reveal-card'}
            onClick={() => setActiveCardId(card.id)}
          >
            {card.title}
          </button>
        ))}
      </div>

      <section className="presentation-reveal-panel" aria-live="polite">
        <span>{activeCard.title}</span>
        <p>{activeCard.note}</p>
      </section>
    </PresentationLayout>
  )
}
