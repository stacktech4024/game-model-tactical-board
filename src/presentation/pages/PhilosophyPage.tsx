import { useState } from 'react'
import { PresentationLayout } from '../PresentationLayout'

const PHILOSOPHY_CARDS = [
  {
    id: 'club-philosophy',
    title: 'Club Philosophy',
    note: "Pickering FC is committed to developing technically sound, intelligent players who understand the game and can adapt within it. We prioritize long-term player development over short-term results, building footballers - and people - who love the game and want to keep improving.",
  },
  {
    id: 'guiding-principles',
    title: 'Club Guiding Principles',
    note: "Our guiding principle is to maintain a positive, player-centered club culture built on structure and organization throughout the season. We continually assess player progress against each phase of the game, and coaches are expected to teach tactics and ideas consistently across training and classroom sessions so players keep growing their footballing IQ.",
  },
  {
    id: 'coaching-philosophy',
    title: 'Coaching Philosophy',
    note: "My coaching philosophy is rooted in honesty, accountability, empathy, and growth. I prioritize clear communication, encourage players to take ownership of their actions, and create an environment where mistakes are treated as part of learning. I'm committed to player-first development - building smart, adaptable players who understand their role and can switch between moments of the game - over a fixation on results.",
  },
]

export function PhilosophyPage() {
  const [activeCardId, setActiveCardId] = useState(PHILOSOPHY_CARDS[0].id)
  const activeCard = PHILOSOPHY_CARDS.find((card) => card.id === activeCardId) ?? PHILOSOPHY_CARDS[0]

  return (
    <PresentationLayout pageId="philosophy">
      <p className="presentation-eyebrow">Section 1 — the why</p>
      <h1 className="presentation-title">Our identity</h1>
      <p className="presentation-body">
        Club identity comes first, then the personal coaching philosophy that puts it into practice -
        everything in how we train and play traces back to these three commitments.
      </p>

      <div className="reveal-card-row" role="tablist" aria-label="Club and coaching philosophy">
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

      <p className="presentation-body">
        <strong>Alignment:</strong> the club's player-centered, long-term focus and my own values of
        growth and accountability reinforce each other - both prioritize developing the player in
        front of us over chasing short-term results.
      </p>
    </PresentationLayout>
  )
}
