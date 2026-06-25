import type {
  HighlightZone,
  PitchPoint,
  ScenarioArrowType,
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
  startProgress: number
  endProgress: number
}

export type IntentPlaybackState = 'pending' | 'active' | 'completed'

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
