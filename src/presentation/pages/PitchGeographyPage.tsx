import { useState } from 'react'
import { PITCH } from '../../domain/pitch/pitchConstants.ts'
import { PresentationLayout } from '../PresentationLayout'
import {
  PITCH_GEOGRAPHY_CALLOUTS,
  PITCH_GEOGRAPHY_CHANNELS,
  PITCH_GEOGRAPHY_DEFAULT_MODE,
  PITCH_GEOGRAPHY_MODES,
  PITCH_GEOGRAPHY_ZONES,
  type PitchGeographyMode,
} from '../data/pitchGeographyPageData.ts'

export function PitchGeographyPage() {
  const [mode, setMode] = useState<PitchGeographyMode>(PITCH_GEOGRAPHY_DEFAULT_MODE)
  const showZones = mode !== 'channels'
  const showChannels = mode !== 'zones'

  return (
    <PresentationLayout pageId="pitch-geography" noPadding>
      <header className="pitch-geography-header">
        <div>
          <p className="presentation-eyebrow">Shared game-model language</p>
          <h1 className="presentation-title">Pitch Geography</h1>
          <p className="presentation-subtitle">
            Horizontal zones explain where the game happens; vertical channels explain how we use
            and protect the width of the pitch.
          </p>
        </div>

        <div className="pitch-geography-mode-control" role="group" aria-label="Pitch geography view">
          {PITCH_GEOGRAPHY_MODES.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={mode === option.id}
              className={mode === option.id ? 'is-active' : undefined}
              onClick={() => setMode(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      <section className="pitch-geography-layout" aria-label="Pitch geography teaching diagram">
        <div className="pitch-geography-visual-card">
          <div
            className={`pitch-geography-pitch pitch-geography-pitch--${mode}`}
            aria-label={`${PITCH_GEOGRAPHY_MODES.find((option) => option.id === mode)?.label} pitch geography view`}
          >
            <div className="pitch-geography-markings" aria-hidden="true">
              <span className="pitch-geography-penalty-area pitch-geography-penalty-area--top" />
              <span className="pitch-geography-penalty-area pitch-geography-penalty-area--bottom" />
              <span className="pitch-geography-goal-area pitch-geography-goal-area--top" />
              <span className="pitch-geography-goal-area pitch-geography-goal-area--bottom" />
              <span className="pitch-geography-centre-circle" />
            </div>

            {showZones ? (
              <div className="pitch-geography-zones" data-testid="pitch-geography-zones">
                {PITCH_GEOGRAPHY_ZONES.map((zone, index) => (
                  <div
                    key={zone.label}
                    className={`pitch-geography-zone pitch-geography-zone--${index + 1}`}
                    style={{
                      bottom: `${(zone.startY / PITCH.LENGTH) * 100}%`,
                      height: `${((zone.endY - zone.startY) / PITCH.LENGTH) * 100}%`,
                    }}
                  >
                    <div className="pitch-geography-zone__label">
                      <strong>{mode === 'both' ? `Z${index + 1}` : zone.label}</strong>
                      <span>
                        {zone.primary}
                        {mode === 'zones' ? ` / ${zone.secondary}` : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {showChannels ? (
              <div className="pitch-geography-channels" data-testid="pitch-geography-channels">
                {PITCH_GEOGRAPHY_CHANNELS.map((channel) => (
                  <div
                    key={channel.id}
                    className={`pitch-geography-channel pitch-geography-channel--${channel.channelNumber}`}
                    style={{
                      left: `${(channel.startX / PITCH.WIDTH) * 100}%`,
                      width: `${((channel.endX - channel.startX) / PITCH.WIDTH) * 100}%`,
                    }}
                  >
                    <div className="pitch-geography-channel__label">
                      <strong>{mode === 'both' ? `CH${channel.channelNumber}` : `Channel ${channel.channelNumber}`}</strong>
                      <span>{channel.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="pitch-geography-direction-notes" aria-label="Pitch orientation">
            <div className="pitch-geography-direction pitch-geography-direction--attack">
              <span aria-hidden="true">↑</span>
              <p><strong>Canada attacks</strong>Zone 1 → Zone 4</p>
            </div>
            <div className="pitch-geography-direction pitch-geography-direction--recovery">
              <span aria-hidden="true">↓</span>
              <p><strong>Defensive recovery</strong>Protect Zone 1</p>
            </div>
          </div>
        </div>

        <aside className="pitch-geography-explainer">
          {mode === 'both' ? (
            <div className="pitch-geography-grid-key" aria-label="Combined view key">
              <span><i className="pitch-geography-grid-key__horizontal" />Horizontal = Zones</span>
              <span><i className="pitch-geography-grid-key__vertical" />Vertical = Channels</span>
            </div>
          ) : null}

          {PITCH_GEOGRAPHY_CALLOUTS.map((callout, index) => (
            <section key={callout.title} className="pitch-geography-callout">
              <span>0{index + 1}</span>
              <div>
                <h2>{callout.title}</h2>
                <p>{callout.text}</p>
              </div>
            </section>
          ))}

          <p className="pitch-geography-narration-note">
            One shared map connects our language in possession, out of possession, and in transition.
          </p>
        </aside>
      </section>
    </PresentationLayout>
  )
}
