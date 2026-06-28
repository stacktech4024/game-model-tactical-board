import type {
  HighlightZone,
  PitchPoint,
  ScenarioArrowType,
  ScenarioReleasePlayer,
  ScenarioMoment,
} from '../scenarios/scenarioTypes'

export type TeamSide = 'home' | 'away'

export type EntityId = string

export type WorldClock = {
  elapsedSeconds: number
  progress: number
}

export type PlayerReference = {
  side: TeamSide
  number: number
}

export type PlayerState = PlayerReference & {
  id: EntityId
  position: PitchPoint
}

export type BallState = {
  id: EntityId
  position: PitchPoint
}

export type WorldSnapshot = {
  scenarioId: string
  title: string
  moment: ScenarioMoment
  clock: WorldClock
  players: PlayerState[]
  ball?: BallState
  activePhaseStep?: PlannedPhaseStep
  focus: {
    keyPlayers: PlayerReference[]
    zoneFocus: HighlightZone[]
    channelFocus: number[]
    relatedArrows: string[]
  }
  animationIntents: SnapshotAnimationIntent[]
}

export type PlannedPhaseStep = {
  id: string
  label: string
  coachingCue: string
  keyPlayers: PlayerReference[]
  zoneFocus: HighlightZone[]
  channelFocus: number[]
  relatedArrows: string[]
}

export type AnimationIntentType = 'ball-movement' | 'player-movement'

export type PlannedIntentTiming = {
  startTime: number
  endTime: number
  duration: number
  startProgress: number
  endProgress: number
}

export type IntentPlaybackState = 'pending' | 'active' | 'completed'

// Descriptive metadata only: documents the GSAP easing curve the runtime
// playback layer (scenarioAnimator) uses for this intent's arrow type.
// WorldSnapshot interpolation stays linear regardless of this hint - it
// exists so tooling (e.g. snapshotComparisonLogger) can explain expected
// eased-vs-linear divergence without the domain layer importing GSAP.
export type IntentEaseHint = 'linear' | 'power1.inOut' | 'power2.inOut' | 'power3.out'

export type AnimationIntent = {
  id: EntityId
  arrowId: string
  type: AnimationIntentType
  arrowType: ScenarioArrowType
  side: TeamSide
  playerNumber?: number
  from: PitchPoint
  via?: PitchPoint
  to: PitchPoint
  order: number
  delay: number
  sequenceIndex: number
  easeHint?: IntentEaseHint
  releasedBy?: ScenarioReleasePlayer
  label?: string
}

export type ScheduledAnimationIntent = AnimationIntent & {
  timing: PlannedIntentTiming
}

export type SnapshotAnimationIntent = ScheduledAnimationIntent & {
  playbackState: IntentPlaybackState
}

export type ScenarioPlan = {
  scenarioId: string
  title: string
  moment: ScenarioMoment
  initialPlayers: PlayerState[]
  initialBall?: BallState
  animationIntents: ScheduledAnimationIntent[]
  phaseSteps: PlannedPhaseStep[]
}
