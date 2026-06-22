import type {
  PixiPitchPreviewProps,
  PixiPitchPreviewStep,
} from '../../renderers/pixi/PixiPitchPreview'
import {
  FULLBACK_SKILL_SCENARIOS,
  type FullbackSkillVariant,
} from './fullbackSkillScenario'

export type FullbackSkillPixiScenario = Pick<
  PixiPitchPreviewProps,
  'players' | 'ballPosition' | 'steps'
> & {
  caption: string
}

export function getFullbackSkillPixiScenario(
  variant: FullbackSkillVariant,
): FullbackSkillPixiScenario {
  const scenario = FULLBACK_SKILL_SCENARIOS[variant]
  const steps: PixiPitchPreviewStep[] = scenario.steps.map((step) => ({
    id: step.id,
    playerId: step.playerId,
    playerTo: step.playerTo,
    ballFrom: step.ballFrom,
    ballTo: step.ballTo,
    duration: step.duration,
    emphasizePlayerId: step.emphasizePlayerId,
    cue: step.cue,
    emphasisCue: step.emphasisCue,
  }))

  return {
    players: scenario.players.map((player) => ({
      id: player.id,
      label: player.label,
      x: player.start.x,
      y: player.start.y,
      tone: player.tone,
    })),
    ballPosition: scenario.ballStart,
    steps,
    caption: scenario.caption,
  }
}
