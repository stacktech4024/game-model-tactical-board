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
  clock: WorldClock
  players: PlayerState[]
  ball?: BallState
  activePhaseStepId?: string
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

export type ScenarioPlan = {
  scenarioId: string
  title: string
  moment: ScenarioMoment
  initialPlayers: PlayerState[]
  initialBall?: BallState
  animationIntents: AnimationIntent[]
  phaseSteps: PlannedPhaseStep[]
}
