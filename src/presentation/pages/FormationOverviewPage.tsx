import { PresentationLayout } from '../PresentationLayout.tsx'
import {
  getFormationOverview,
  type FormationOverviewVariant,
} from '../data/formationOverviewPageData.ts'

type FormationOverviewPageProps = {
  variant: FormationOverviewVariant
}

const PITCH_Y_SCALE = 0.62

const ATTACKING_ARROW_PATHS = [
  'M22 68 C20 54 23 34 31 15',
  'M42 74 L42 49',
  'M58 74 L58 49',
  'M78 68 C80 53 77 33 69 14',
  'M27 48 C27 35 31 23 36 12',
  'M43 49 C43 38 46 25 48 12',
  'M57 49 C57 38 54 25 52 12',
  'M73 48 C73 35 69 23 64 12',
  'M40 29 C42 25 44 21 46 17',
  'M60 29 C58 25 56 21 54 17',
]

const DEFENSIVE_ARROW_PATHS = [
  'M49 33 C47 31 45 29 43 27',
  'M51 33 C53 31 55 29 57 27',
  'M30 46 C28 43 26 41 24 39',
  'M34 46 C37 44 39 42 41 40',
  'M48 49 C46 46 44 44 42 42',
  'M52 49 C54 46 56 44 58 42',
  'M66 46 C63 44 61 42 59 40',
  'M70 46 C72 43 74 41 76 39',
  'M42 58 C39 56 37 53 35 51',
  'M46 58 C48 56 50 54 51 51',
  'M54 58 C52 56 50 54 49 51',
  'M58 58 C61 56 63 53 65 51',
  'M23 67 C20 64 18 61 16 58',
  'M27 67 C31 65 34 63 37 61',
  'M40 73 C37 70 35 68 32 66',
  'M44 73 C47 71 49 68 50 65',
  'M56 73 C53 71 51 68 50 65',
  'M60 73 C63 70 65 68 68 66',
  'M73 67 C69 65 66 63 63 61',
  'M77 67 C80 64 82 61 84 58',
]

const DEFENSIVE_COVERAGE_ZONES = [
  '50,36 42,26 58,26',
  '32,49 23,38 42,40',
  '50,52 41,41 59,41',
  '68,49 58,40 77,38',
  '44,61 34,50 52,50',
  '56,61 48,50 66,50',
  '25,70 15,57 38,60',
  '42,76 31,65 51,64',
  '58,76 49,64 69,65',
  '75,70 62,60 85,57',
]

function PortfolioPitch({ variant }: { variant: FormationOverviewVariant }) {
  const overview = getFormationOverview(variant)
  const arrowPaths = variant === 'attacking' ? ATTACKING_ARROW_PATHS : DEFENSIVE_ARROW_PATHS
  const markerId = variant === 'attacking' ? 'formation-attacking-arrowhead' : 'formation-defensive-coverage-cap'
  const clipId = `formation-pitch-clip-${variant}`
  const pitchGradientId = `formation-pitch-gradient-${variant}`
  const surroundGradientId = `formation-surround-gradient-${variant}`
  const fieldShadowId = `formation-field-shadow-${variant}`

  return (
    <svg
      className="formation-overview-svg"
      viewBox={`0 0 100 ${100 * PITCH_Y_SCALE}`}
      role="img"
      aria-label={`${overview.title}, ${overview.formation}, with Pickering players and ${variant === 'attacking' ? 'tactical movement arrows' : 'forward coverage lines'}`}
    >
      <defs>
        <clipPath id={clipId}>
          <polygon points="8,94 92,94 70,6 30,6" />
        </clipPath>
        <linearGradient id={pitchGradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4d8f3d" />
          <stop offset="0.52" stopColor="#63a74d" />
          <stop offset="1" stopColor="#4d923d" />
        </linearGradient>
        <radialGradient id={surroundGradientId} cx="50%" cy="52%" r="70%">
          <stop offset="0" stopColor="#738760" />
          <stop offset="1" stopColor="#536449" />
        </radialGradient>
        <filter id={fieldShadowId} x="-20%" y="-20%" width="140%" height="145%">
          <feDropShadow dx="0" dy="1.4" stdDeviation="1.25" floodColor="#17251b" floodOpacity="0.55" />
        </filter>
        {variant === 'attacking' ? (
          <marker
            id={markerId}
            viewBox="0 0 5 5"
            refX="4.2"
            refY="2.5"
            markerWidth="4"
            markerHeight="4"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L5,2.5 L0,5 Z" fill="#ff1f1f" />
          </marker>
        ) : (
          <marker
            id={markerId}
            viewBox="0 0 5 5"
            refX="4"
            refY="2.5"
            markerWidth="4.8"
            markerHeight="4.8"
            orient="auto"
          >
            <path d="M4,0.35 L4,4.65" fill="none" stroke="#ff1f1f" strokeWidth="0.8" />
          </marker>
        )}
      </defs>

      <g transform={`scale(1 ${PITCH_Y_SCALE})`}>
        <rect width="100" height="100" fill={`url(#${surroundGradientId})`} />
        <polygon
          points="8,94 92,94 70,6 30,6"
          fill={`url(#${pitchGradientId})`}
          filter={`url(#${fieldShadowId})`}
        />
        <g clipPath={`url(#${clipId})`}>
          {[6, 16, 26, 36, 46, 56, 66, 76, 86].map((y, index) => (
            <rect
              key={y}
              x="0"
              y={y}
              width="100"
              height="10"
              fill={index % 2 === 0 ? 'rgba(255, 255, 255, 0.07)' : 'rgba(14, 71, 31, 0.045)'}
            />
          ))}
          <polygon className="formation-overview-channel" points="8,94 29,94 44,6 30,6" />
          <polygon className="formation-overview-channel" points="71,94 92,94 70,6 56,6" />
        </g>

        {variant === 'defensive' ? (
          <g className="formation-overview-coverage-zones" aria-hidden="true">
            {DEFENSIVE_COVERAGE_ZONES.map((points) => <polygon key={points} points={points} />)}
          </g>
        ) : null}

        <g className="formation-overview-field-lines" aria-hidden="true">
          <polygon points="8,94 92,94 70,6 30,6" />
          <line x1="19" y1="50" x2="81" y2="50" />
          <ellipse cx="50" cy="50" rx="9" ry="4.8" />
          <circle cx="50" cy="50" r="0.45" />
          <polygon points="23,94 77,94 70,76 30,76" />
          <polygon points="39,94 61,94 58,86 42,86" />
          <polygon points="30,6 70,6 67,18 33,18" />
          <polygon points="43,6 57,6 56,11 44,11" />
          <polyline points="43,94 43,98 57,98 57,94" />
          <polyline points="45,6 45,3 55,3 55,6" />
          <line className="formation-overview-goal-net" x1="46" y1="94" x2="46" y2="98" />
          <line className="formation-overview-goal-net" x1="50" y1="94" x2="50" y2="98" />
          <line className="formation-overview-goal-net" x1="54" y1="94" x2="54" y2="98" />
          <line className="formation-overview-goal-net" x1="47.5" y1="3" x2="47.5" y2="6" />
          <line className="formation-overview-goal-net" x1="52.5" y1="3" x2="52.5" y2="6" />
        </g>

        <g className="formation-overview-arrows" aria-hidden="true">
          {arrowPaths.map((path, index) => (
            <path key={path} d={path} markerEnd={`url(#${markerId})`} data-arrow-index={index} />
          ))}
        </g>
      </g>

      <g className="formation-overview-svg-players">
        {overview.players.map((player) => {
          const x = player.left
          const y = (100 - player.bottom) * PITCH_Y_SCALE

          return (
            <g key={player.id} transform={`translate(${x} ${y})`}>
              <title>{`#${player.number} ${player.name} — ${player.role}`}</title>
              <circle r="2.35" />
              <text y="0.9" textAnchor="middle">{player.number}</text>
            </g>
          )
        })}
      </g>
    </svg>
  )
}

export function FormationOverviewPage({ variant }: FormationOverviewPageProps) {
  const overview = getFormationOverview(variant)
  const isAttacking = variant === 'attacking'

  return (
    <PresentationLayout pageId={overview.pageId} noPadding>
      <header className="formation-overview-header">
        <div>
          <p className="presentation-eyebrow">{overview.eyebrow}</p>
          <h1 className="presentation-title">{overview.title}</h1>
          <p className="presentation-subtitle">{overview.description}</p>
        </div>

        <div className={`formation-overview-system formation-overview-system--${variant}`}>
          <span>{overview.momentLabel}</span>
          <strong>{overview.formation}</strong>
          <small>{overview.shapeLine}</small>
        </div>
      </header>

      <section className="formation-overview-layout" aria-label={`${overview.title} team formation`}>
        <figure className={`formation-overview-pitch-card formation-overview-pitch-card--${variant}`}>
          <div className="formation-overview-pitch">
            <PortfolioPitch variant={variant} />
          </div>
          <figcaption>
            <span className="formation-overview-caption-key">
              <i />{isAttacking ? 'Red arrows' : 'Red coverage lines'}
            </span>
            {isAttacking
              ? 'show forward support and wide-channel movement.'
              : 'show the space each player manages in front. Shaded areas show connected cover.'}
          </figcaption>
        </figure>

        <aside className="formation-overview-explainer">
          <span className="formation-overview-explainer__moment">{overview.momentLabel}</span>
          <h2>{isAttacking ? 'When we are attacking' : 'When we are defending'}</h2>
          <p>{overview.explanation}</p>

          <div className={`formation-overview-arrow-key formation-overview-arrow-key--${variant}`}>
            <span aria-hidden="true"><i /><b>›</b></span>
            <p>
              <strong>{isAttacking ? 'Read the arrows forward' : 'Low-block coverage in front'}</strong>
              {isAttacking
                ? 'They show how our lines advance and create width.'
                : 'Each T-capped line projects away from our goal and marks the space that player is responsible for protecting.'}
            </p>
          </div>

          <div className="formation-overview-principles">
            {overview.principles.map((principle, index) => (
              <div key={principle}>
                <span>0{index + 1}</span>
                <strong>{principle}</strong>
              </div>
            ))}
          </div>

          <div className="formation-overview-bridge">
            <span>Shape changes with the moment</span>
            <p>
              {isAttacking
                ? 'When possession is lost, we recover and reconnect into our 1-4-2-3-1 defensive shape.'
                : 'When possession is regained, we expand and reconnect into our 1-4-4-2 attacking shape.'}
            </p>
          </div>
        </aside>
      </section>
    </PresentationLayout>
  )
}

export function AttackingFormationPage() {
  return <FormationOverviewPage variant="attacking" />
}

export function DefensiveFormationPage() {
  return <FormationOverviewPage variant="defensive" />
}
