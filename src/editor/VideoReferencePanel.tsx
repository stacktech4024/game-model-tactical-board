import { VIDEO_REFERENCES } from '../data/videoReferences'

export function VideoReferencePanel() {
  return (
    <section className="video-reference-panel" aria-label="Video references">
      <h2>Video references</h2>
      <div className="video-reference-list">
        {VIDEO_REFERENCES.map((reference) => (
          <article key={reference.id} className="video-reference-card">
            <div className="video-reference-card__header">
              <h3>{reference.title}</h3>
              <span>{reference.type}</span>
            </div>
            <p className="video-reference-card__focus">{reference.focus}</p>
            <p className="video-reference-card__notes">{reference.notes}</p>
            <div className="video-reference-card__tags" aria-label={`${reference.title} tags`}>
              {reference.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <a href={reference.url} target="_blank" rel="noreferrer">
              Open YouTube
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}
