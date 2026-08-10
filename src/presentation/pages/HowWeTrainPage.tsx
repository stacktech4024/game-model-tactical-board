import { Link } from 'react-router-dom'
import { PresentationLayout } from '../PresentationLayout'
import { HOW_WE_TRAIN_EXAMPLES } from '../data/howWeTrainPageData'

const TRAINING_PROCESS = [
  {
    number: '01',
    title: 'Start with the game',
    detail: 'Select the Game Model problem, positional requirements, and match moment the players must solve.',
  },
  {
    number: '02',
    title: 'Design the environment',
    detail: 'Use space, player relationships, rewards, and constraints to make the intended decisions repeatable.',
  },
  {
    number: '03',
    title: 'Coach the transfer',
    detail: 'Connect who, what, when, where, why, and how to a visible match-transfer outcome.',
  },
]

export function HowWeTrainPage() {
  return (
    <PresentationLayout pageId="how-we-train" noPadding>
      <header className="how-we-train-header how-we-train-header--overview">
        <div>
          <p className="presentation-eyebrow">How do we coach?</p>
          <h1 className="presentation-title">HOW WE TRAIN OUR GAME MODEL</h1>
          <p className="presentation-body">
            We train the decisions and behaviours required by our Game Model in realistic,
            game-related environments.
          </p>
        </div>
        <div className="how-we-train-framework" aria-label="Canada Soccer development framework">
          <span>WHO ARE WE?</span><i>→</i>
          <span>HOW DO WE WANT TO PLAY?</span><i>→</i>
          <strong>HOW DO WE COACH?</strong><i>→</i>
          <span>FUTURE CANADIAN PLAYERS</span>
        </div>
      </header>

      <main className="how-we-train-overview">
        <section className="how-we-train-process" aria-labelledby="training-process-title">
          <div className="how-we-train-section-heading">
            <span>OUR TRAINING PROCESS</span>
            <h2 id="training-process-title">From Game Model problem to match behaviour</h2>
            <p>
              Each practice preserves opposition, direction, transition, and role clarity. Body
              orientation belongs to every player in the picture—not only the team being coached.
            </p>
          </div>
          <ol>
            {TRAINING_PROCESS.map((item) => (
              <li key={item.number}>
                <b>{item.number}</b>
                <div><h3>{item.title}</h3><p>{item.detail}</p></div>
              </li>
            ))}
          </ol>
        </section>

        <section className="how-we-train-example-index" aria-labelledby="training-examples-title">
          <div className="how-we-train-section-heading">
            <span>TRAINING EXAMPLES</span>
            <h2 id="training-examples-title">Choose one practice to explore</h2>
            <p>
              Detailed evidence, coaching information, and animations live on a separate page so
              each example has room to be read and presented clearly.
            </p>
          </div>
          <div className="how-we-train-example-grid">
            {HOW_WE_TRAIN_EXAMPLES.map((example, index) => (
              <article key={example.id}>
                <header><b>{String(index + 1).padStart(2, '0')}</b><span>{example.moments.join(' + ')}</span></header>
                <h3>{example.title}</h3>
                <p>{example.shortPurpose}</p>
                <dl>
                  <div><dt>System</dt><dd>{example.system}</dd></div>
                  <div><dt>Principles</dt><dd>{example.principles.join(' · ')}</dd></div>
                </dl>
                <Link to={`/presentation/how-we-train/examples?example=${example.id}`}>
                  Open training example <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <aside className="how-we-train-realism-note" aria-label="Diagram realism standard">
          <div><i className="how-we-train-team-dot is-red" />Red — coached team</div>
          <div><i className="how-we-train-team-dot is-grey" />Grey — opposition team</div>
          <div><i className="how-we-train-team-dot is-yellow" />Yellow #1 — coached GK</div>
          <div><i className="how-we-train-team-dot is-cyan" />Cyan #1 — opposition GK</div>
          <p>Red attacks toward Zone 4 and defends toward Zone 1. Goalkeepers anchor both ends; token direction shows each player’s body orientation as the action changes.</p>
          <Link to={`/presentation/how-we-train/examples?example=${HOW_WE_TRAIN_EXAMPLES[0].id}`}>View the animated examples</Link>
        </aside>
      </main>
    </PresentationLayout>
  )
}
