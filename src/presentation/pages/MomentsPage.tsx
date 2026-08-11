import { PresentationLayout } from '../PresentationLayout'
import {
  GAME_MODEL_MOMENTS_STATEMENT,
  MOMENTS_CYCLE,
  MOMENTS_OF_THE_GAME,
  SET_PIECES_RELATIONSHIP,
} from '../data/momentsPageData'

const connectorPositions = ['top', 'right', 'bottom', 'left'] as const

export function MomentsPage() {
  return (
    <PresentationLayout pageId="moments" noPadding>
      <header className="moments-header">
        <div>
          <p className="presentation-eyebrow">One game — four connected moments</p>
          <h1 className="presentation-title">Moments of the Game</h1>
        </div>
        <p className="moments-header__prompt">
          Recognize what changed. Apply the next principle. Act together.
        </p>
      </header>

      <figure
        className="moments-relationship"
        aria-labelledby="moments-relationship-title"
        aria-describedby="moments-relationship-description"
      >
        <figcaption id="moments-relationship-title" className="moments-visually-hidden">
          The four Moments of the Game form a continuous cycle, with Set Pieces connected to every Moment.
        </figcaption>
        <p id="moments-relationship-description" className="moments-visually-hidden">
          Attacking Organization leads to Defensive Transition, then Defensive Organization,
          then Attacking Transition, and back to Attacking Organization. Set Pieces can begin or
          change any Moment.
        </p>

        <div className="moments-cycle-grid">
          {MOMENTS_OF_THE_GAME.map((moment, index) => (
            <article
              key={moment.id}
              className={`moments-node moments-node--${moment.id}`}
              aria-label={`${index + 1}. ${moment.name}. ${moment.description}`}
            >
              <div className="moments-node__identity">
                <span className="moments-node__number">0{index + 1}</span>
                <span className="moments-node__abbreviation" aria-hidden="true">
                  {moment.abbreviation}
                </span>
              </div>
              <div>
                <h2>{moment.name}</h2>
                <p>{moment.description}</p>
              </div>
            </article>
          ))}

          {MOMENTS_CYCLE.map((connection, index) => (
            <div
              key={`${connection.from}-${connection.to}`}
              className={`moments-connector moments-connector--${connectorPositions[index]}`}
              aria-label={`${MOMENTS_OF_THE_GAME[index].name} leads to ${
                MOMENTS_OF_THE_GAME[(index + 1) % MOMENTS_OF_THE_GAME.length].name
              }`}
            >
              <span className="moments-connector__cue">{connection.cue}</span>
              <span className="moments-connector__desktop-arrow" aria-hidden="true">
                {index === 0 ? '→' : index === 1 ? '↓' : index === 2 ? '←' : '↑'}
              </span>
              <span className="moments-connector__mobile-arrow" aria-hidden="true">
                {index === MOMENTS_CYCLE.length - 1 ? '↺' : '↓'}
              </span>
            </div>
          ))}

          <aside className="moments-set-pieces" aria-label="Set Pieces connect to every Moment">
            <span>Spans every Moment</span>
            <h2>{SET_PIECES_RELATIONSHIP.name}</h2>
            <p>{SET_PIECES_RELATIONSHIP.description}</p>
          </aside>
        </div>
      </figure>

      <p className="moments-model-statement">{GAME_MODEL_MOMENTS_STATEMENT}</p>
    </PresentationLayout>
  )
}

