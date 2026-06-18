export const MOMENT_LABELS = [
  'Attacking Organization',
  'Attacking Transition',
  'Defensive Transition',
  'Defensive Organization',
  'Set Pieces',
] as const

export const ATTACKING_PRINCIPLES = [
  'DISPERSAL',
  'SUPPORT',
  'MOBILITY',
  'PENETRATION',
  'IMPROVISATION',
] as const

export const DEFENDING_PRINCIPLES = [
  'DENY',
  'DELAY',
  'DIRECT',
  'BALANCE',
  'CONTROL & RESTRAINT',
] as const

export const PICKERING_GAME_MODEL = {
  possession: 'Calm in possession',
  buildUp: 'Build through wide channels',
  finishing: 'Find striker in central position for 1-2 touch finishes',
  attackShape: 'Attack in 1-4-4-2',
  defenseShape: 'Defend in 1-4-2-3-1',
  defensiveIntent: 'Stay compact and force opponent wide',
  turnoverResponse: 'Counter quickly on turnover',
} as const
