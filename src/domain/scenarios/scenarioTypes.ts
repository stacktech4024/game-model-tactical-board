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
}
