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

export type ScenarioArrow = {
  id: string
  type: ScenarioArrowType
  from: PitchPoint
  to: PitchPoint
  label?: string
  playerNumber?: number
}

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

export type ScenarioDefinition = {
  id: string
  title: string
  moment: ScenarioMoment
  formationMode: ScenarioFormationMode
  zoneFocus: string
  description: string
  coachingPoints: string[]
  ballStart?: {
    x: number
    y: number
  }
  annotations?: ScenarioAnnotations
  arrows?: ScenarioArrow[]
  markers?: ScenarioMarker[]
}
