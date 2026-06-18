export type PlayerPosition =
  | 'GK'
  | 'RB'
  | 'LB'
  | 'CB'
  | 'CDM'
  | 'CM'
  | 'CAM'
  | 'RW'
  | 'LW'
  | 'ST'

export type PlayerRole =
  | 'GOALKEEPER'
  | 'DEFENDER'
  | 'DEFENSIVE_MID'
  | 'CENTRAL_MID'
  | 'ATTACKING_MID'
  | 'WIDE'
  | 'STRIKER'

export type PlayerSide = 'home' | 'away'

export type SquadPlayer = {
  id: string
  number: number
  name: string
  position: PlayerPosition
  isGoalkeeper: boolean
  side: PlayerSide
}
