export type ScenarioMoment =
  | 'Attacking Organization'
  | 'Attacking Transition'
  | 'Defensive Transition'
  | 'Defensive Organization'
  | 'Set Pieces'

export type ScenarioFormationMode =
  | 'attacking-442'
  | 'defensive-4231'
  | 'attacking-433'
  | 'defensive-532'
  | 'attacking-352'

export type HighlightZone = 1 | 2 | 3 | 4

export type HighlightChannel =
  | 'wide-left'
  | 'half-space-left'
  | 'central-left'
  | 'central-right'
  | 'half-space-right'
  | 'wide-right'

export type ScenarioAnnotations = {
  highlightZones?: HighlightZone[]
  highlightChannels?: HighlightChannel[]
}

export type PitchPoint = {
  x: number
  y: number
}

export type ScenarioArrowType =
  | 'pass'
  | 'run'
  | 'dribble'
  | 'press'
  | 'recovery'
  | 'shot'
  | 'cross'
  | 'header'

export type ScenarioBallArrowType = 'pass' | 'dribble' | 'shot' | 'cross' | 'header'
export type ScenarioPlayerArrowType = 'run' | 'press' | 'recovery'

export type ScenarioReleasePlayer = {
  side: 'home' | 'away'
  playerNumber: number
}

export type ScenarioReleaseKind = 'player' | 'loose-ball'

type BaseScenarioArrow = {
  id: string
  type: ScenarioArrowType
  from: PitchPoint
  via?: PitchPoint
  to: PitchPoint
  label?: string
  playerNumber?: number
  order?: number
  delay?: number
  // Which team's token this arrow moves. Omitted means 'home', preserving
  // behavior for every existing arrow in scenarios.ts.
  side?: 'home' | 'away'
}

export type PlayerReleaseMetadata = {
  releaseKind: 'player'
  releasedBy: ScenarioReleasePlayer
}

export type LooseBallReleaseMetadata = {
  releaseKind: 'loose-ball'
  releasedBy?: never
}

export type BallReleaseMetadata = PlayerReleaseMetadata | LooseBallReleaseMetadata

export type ScenarioArrow = BaseScenarioArrow & {
  releaseKind?: ScenarioReleaseKind
  releasedBy?: ScenarioReleasePlayer
}

export type ScenarioBallArrow = Omit<BaseScenarioArrow, 'type'> & {
  type: ScenarioBallArrowType
} & BallReleaseMetadata

export type ScenarioPlayerArrow = Omit<BaseScenarioArrow, 'type'> & {
  type: ScenarioPlayerArrowType
  releaseKind?: never
  releasedBy?: never
}

export type AuthoredScenarioArrow = ScenarioBallArrow | ScenarioPlayerArrow

export type ScenarioMarkerTone =
  | 'primary'
  | 'warning'
  | 'success'

export type ScenarioMarker = {
  id: string
  point: PitchPoint
  label: string
  tone?: ScenarioMarkerTone
}

export type ScenarioFieldGeography = {
  zones: HighlightZone[]
  channels: number[]
  description: string
}

export type ScenarioPhaseStep = {
  id: string
  label: string
  coachingCue: string
  keyPlayers: number[]
  zoneFocus: HighlightZone[]
  channelFocus: number[]
  relatedArrows?: string[]
}

export type ScenarioSystem = {
  shape: string
  description: string
}

export type ScenarioDefinition = {
  id: string
  title: string
  moment: ScenarioMoment
  momentOfGame: ScenarioMoment
  formationMode: ScenarioFormationMode
  zoneFocus: string
  fieldGeography: ScenarioFieldGeography
  system: ScenarioSystem
  strategy: string
  tactics: string[]
  skillSet: string[]
  phaseSteps: ScenarioPhaseStep[]
  setPieceType?: string
  description: string
  coachingPoints: string[]
  ballStart?: {
    x: number
    y: number
  }
  annotations?: ScenarioAnnotations
  arrows?: AuthoredScenarioArrow[]
  markers?: ScenarioMarker[]
}

export type ScenarioDetail = ScenarioDefinition
