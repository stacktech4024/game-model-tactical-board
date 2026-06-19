import { PresentationLayout } from '../PresentationLayout'
import { POSITIONAL_PROFILES } from '../data/positionalProfiles'

export function SkillsPage() {
  return (
    <PresentationLayout pageId="skills" noPadding>
      <p className="presentation-eyebrow">Section 3 — the how</p>
      <h1 className="presentation-title">Skill development</h1>
      <p className="presentation-body">
        Every position has a clear identity within the game model. These are the skill sets we
        prioritize for each role, in both attacking and defensive organization.
      </p>
      <div className="presentation-grid">
        {POSITIONAL_PROFILES.map((profile) => (
          <div key={profile.position} className="presentation-card">
            <h3>
              {profile.fullName} ({profile.numbers})
            </h3>
            <p>
              <strong style={{ color: '#cdd8ea' }}>Style:</strong> {profile.style}
            </p>
            <p>
              <strong style={{ color: '#cdd8ea' }}>Attacking:</strong> {profile.attackingOrg}
            </p>
            <p>
              <strong style={{ color: '#cdd8ea' }}>Defending:</strong> {profile.defensiveOrg}
            </p>
          </div>
        ))}
      </div>
    </PresentationLayout>
  )
}
