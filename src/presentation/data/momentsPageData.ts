export type MomentId =
  | 'attacking-organization'
  | 'defensive-transition'
  | 'defensive-organization'
  | 'attacking-transition'

export type MomentRelationship = {
  id: MomentId
  abbreviation: 'AO' | 'DT' | 'DO' | 'AT'
  name: string
  description: string
}

export const MOMENTS_OF_THE_GAME: MomentRelationship[] = [
  {
    id: 'attacking-organization',
    abbreviation: 'AO',
    name: 'Attacking Organization',
    description: 'We have possession and organize to progress/create.',
  },
  {
    id: 'defensive-transition',
    abbreviation: 'DT',
    name: 'Defensive Transition',
    description: 'We lose possession and react immediately.',
  },
  {
    id: 'defensive-organization',
    abbreviation: 'DO',
    name: 'Defensive Organization',
    description: 'We organize without the ball to protect space and direct play.',
  },
  {
    id: 'attacking-transition',
    abbreviation: 'AT',
    name: 'Attacking Transition',
    description: 'We regain possession and decide whether to counter or secure.',
  },
]

export const MOMENTS_CYCLE: Array<{ from: MomentId; to: MomentId; cue: string }> = [
  {
    from: 'attacking-organization',
    to: 'defensive-transition',
    cue: 'Possession lost',
  },
  {
    from: 'defensive-transition',
    to: 'defensive-organization',
    cue: 'Opponent secures',
  },
  {
    from: 'defensive-organization',
    to: 'attacking-transition',
    cue: 'Possession won',
  },
  {
    from: 'attacking-transition',
    to: 'attacking-organization',
    cue: 'We secure',
  },
]

export const SET_PIECES_RELATIONSHIP = {
  name: 'Set Pieces',
  description: 'Restarts can begin or change any Moment.',
} as const

export const GAME_MODEL_MOMENTS_STATEMENT =
  'Our Game Model gives players principles for each Moment so they can recognize what has changed and act together.'

