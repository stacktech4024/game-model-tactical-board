import { PICKERING_SQUAD } from '../../data/squad.ts'
import type { PlayerPosition, SquadPlayer } from '../../domain/players/playerTypes.ts'

export type PositionalProfileId =
  | 'goalkeeper'
  | 'centre-backs'
  | 'fullbacks'
  | 'central-midfield'
  | 'attacking-midfielder'
  | 'wide-players'
  | 'striker'

export type ProfileMomentId =
  | 'attackingOrganization'
  | 'defensiveOrganization'
  | 'attackingTransition'
  | 'defensiveTransition'

export type ProfileOccupant = Pick<SquadPlayer, 'id' | 'name' | 'number' | 'position'>

export type ProfileRoleEmphasis = {
  number: number
  label: string
  priorities: string[]
}

export type ProfileEvidence = {
  session: string
  focus: string
}

export type PositionalProfile = {
  id: PositionalProfileId
  shortLabel: string
  positionName: string
  numbers: string
  occupants: ProfileOccupant[]
  style: string
  physical: string[]
  social: string[]
  mental: string[]
  skillSet: string[]
  moments: Record<ProfileMomentId, string[]>
  evidence: ProfileEvidence[]
  roleEmphases?: ProfileRoleEmphasis[]
}

export const PROFILE_MOMENT_LABELS: Record<ProfileMomentId, { short: string; full: string }> = {
  attackingOrganization: { short: 'AO', full: 'Attacking Organization' },
  defensiveOrganization: { short: 'DO', full: 'Defensive Organization' },
  attackingTransition: { short: 'AT', full: 'Attacking Transition' },
  defensiveTransition: { short: 'DT', full: 'Defensive Transition' },
}

export const PLAYER_POSITION_TO_PROFILE_ID: Record<PlayerPosition, PositionalProfileId> = {
  GK: 'goalkeeper',
  RB: 'fullbacks',
  LB: 'fullbacks',
  CB: 'centre-backs',
  CDM: 'central-midfield',
  CM: 'central-midfield',
  CAM: 'attacking-midfielder',
  RW: 'wide-players',
  LW: 'wide-players',
  ST: 'striker',
}

function getOccupants(numbers: number[]): ProfileOccupant[] {
  return numbers.map((number) => {
    const player = PICKERING_SQUAD.find((item) => item.number === number)

    if (!player) {
      throw new Error(`Missing Pickering squad occupant #${number}`)
    }

    return {
      id: player.id,
      name: player.name,
      number: player.number,
      position: player.position,
    }
  })
}

export const POSITIONAL_PROFILES: PositionalProfile[] = [
  {
    id: 'goalkeeper',
    shortLabel: 'GK',
    positionName: 'Goalkeeper',
    numbers: '#1',
    occupants: getOccupants([1]),
    style: 'Calm first attacker and connected last defender who organizes the team behind the ball.',
    physical: ['Explosive footwork', 'Agility', 'Aerial range', 'Recovery speed'],
    social: ['Command the box and back line', 'Provide early information', 'Remain calm', 'Show accountability'],
    mental: ['Scan continuously', 'Sustain concentration', 'Stay composed', 'Anticipate danger', 'Choose short or long distribution'],
    skillSet: ['Shot stopping', 'Handling crosses', 'Receiving back passes', 'Two-foot distribution', 'Line-breaking passes', 'Counter release'],
    moments: {
      attackingOrganization: ['Create the first overload', 'Circulate calmly', 'Identify the free centre back or pivot', 'Switch wide when the centre closes'],
      defensiveOrganization: ['Remain connected to the back line', 'Organize compactness', 'Protect Zone 1', 'Manage space behind'],
      attackingTransition: ['Scan immediately after the regain', 'Release #9 or a wide outlet when advantage exists', 'Secure possession when the counter is unavailable'],
      defensiveTransition: ['Protect goal first', 'Adjust depth and angle', 'Communicate danger early', 'Reset the back line'],
    },
    evidence: [{ session: 'MD+1', focus: 'Keeper-started possession and central-to-wide recognition' }],
  },
  {
    id: 'centre-backs',
    shortLabel: 'CB',
    positionName: 'Centre Backs',
    numbers: '#4 / #5',
    occupants: getOccupants([4, 5]),
    style: 'Composed line leaders who protect the centre and begin controlled progression.',
    physical: ['Strength', 'Aerial ability', 'Acceleration', 'Mobility', 'Recovery speed'],
    social: ['Organize with the goalkeeper', 'Organize the centre-back partnership', 'Communicate with fullbacks', 'Call step, cover and balance'],
    mental: ['Stay composed', 'Scan before receiving', 'Anticipate the next action', 'Defend with restraint', 'Recognize step or drop'],
    skillSet: ['Receive with an open body', 'Carry forward', 'Pass into midfield', 'Switch wide', 'Defend aerially', 'Intercept on the front foot'],
    moments: {
      attackingOrganization: ['Split to support the goalkeeper', 'Circulate calmly', 'Connect #6 or #8', 'Find the fullbacks', 'Maintain rest-defence balance'],
      defensiveOrganization: ['Remain compact as a pair', 'Protect central areas', 'Cover behind the fullback', 'Defend the box'],
      attackingTransition: ['Play forward when the regain is clean', 'Stabilize possession when it is not', 'Reopen the field to both sides'],
      defensiveTransition: ['Protect central depth', 'Manage forward runners', 'Reconnect with goalkeeper and midfield'],
    },
    evidence: [{ session: 'MD+1', focus: 'Scanning, line-breaking and switching from the first line' }],
  },
  {
    id: 'fullbacks',
    shortLabel: 'FB',
    positionName: 'Fullbacks',
    numbers: '#2 / #3',
    occupants: getOccupants([2, 3]),
    style: 'Two-way wide connectors who support progression, arrive on time and recover inside first.',
    physical: ['Acceleration', 'Repeated sprint ability', 'Agility', '1v1 strength', 'Recovery speed'],
    social: ['Communicate with the winger', 'Communicate with the centre back', 'Communicate with the pivot', 'Own overlap and recovery timing'],
    mental: ['Shoulder scan', 'Recognize transition', 'Stay composed', 'Choose overlap, underlap or reset'],
    skillSet: ['First touch forward', 'Receive on the appropriate foot', 'Pass into winger or midfield', 'Overlap with timing', 'Cross or cut back', 'Defend 1v1', 'Apply controlled pressure'],
    moments: {
      attackingOrganization: ['Support width', 'Connect central-to-wide progression', 'Overlap when cover exists', 'Deliver in Zone 4'],
      defensiveOrganization: ['Protect the inside first', 'Deny Channels 2-3', 'Press wide from an inside-out angle', 'Direct play toward Channel 1 and the touchline', 'Narrow on the weak side'],
      attackingTransition: ['Advance as the wide outlet when space exists', 'Support underneath when the regain must be secured'],
      defensiveTransition: ['Delay when nearest', 'Otherwise recover inside first', 'Reconnect with the centre back', 'Restore wide protection'],
    },
    evidence: [{ session: 'Practice Session 8', focus: 'Wide pressure, force one direction and secondary cover' }],
  },
  {
    id: 'central-midfield',
    shortLabel: 'CM',
    positionName: 'Central Midfield Unit',
    numbers: '#6 / #8',
    occupants: getOccupants([6, 8]),
    style: 'A connected pair: #6 protects and balances while #8 progresses and supports forward.',
    physical: ['Repeated accelerations', 'Agility', 'Duelling capacity', 'Mobility', 'Recovery running'],
    social: ['Organize central distances', 'Communicate with centre backs', 'Communicate with fullbacks', 'Connect #10 and wide players'],
    mental: ['Scan constantly', 'Stay composed', 'Anticipate pressure', 'Manage risk', 'Recognize forward pass or switch'],
    skillSet: ['Receive on the half-turn', 'Use an open body shape', 'Play in one or two touches', 'Break lines', 'Switch play', 'Use third-player combinations', 'Tackle and intercept'],
    moments: {
      attackingOrganization: ['#6 supports circulation and balance', '#8 connects lines, carries or combines', 'Move the attack from central to wide together'],
      defensiveOrganization: ['Screen Channels 2-3', 'Shift together', 'Cover wide pressure', 'Decide who steps and who protects'],
      attackingTransition: ['Make the first forward connection to #9, #10 or a wide outlet', 'Retain through simple passes when the counter is unavailable'],
      defensiveTransition: ['Protect central space immediately', 'Stagger pressure and cover', 'Restore the double-pivot relationship'],
    },
    roleEmphases: [
      { number: 6, label: '#6 - Protect & balance', priorities: ['Protection', 'Circulation', 'Balance', 'Screening'] },
      { number: 8, label: '#8 - Connect & progress', priorities: ['Progression', 'Connection', 'Carrying and combining', 'Forward support'] },
    ],
    evidence: [{ session: 'MD+1 + Practice Session 5', focus: 'Scanning, line-breaking, switching and third-player support' }],
  },
  {
    id: 'attacking-midfielder',
    shortLabel: 'AM',
    positionName: 'Attacking Midfielder',
    numbers: '#10',
    occupants: getOccupants([10]),
    style: 'Creative connector who finds pockets, links the front line and helps direct the press.',
    physical: ['Agility', 'Acceleration', 'Balance', 'Repeated pressing effort'],
    social: ['Connect midfield and front line', 'Coordinate #9', 'Coordinate wide players', 'Communicate pressing cues'],
    mental: ['Scan between lines', 'Create with confidence', 'Stay composed', 'Anticipate the next action', 'Make fast transition decisions'],
    skillSet: ['Receive on the half-turn', 'Play wall passes', 'Switch play', 'Deliver final passes', 'Finish around the box', 'Use effective pressing angles'],
    moments: {
      attackingOrganization: ['Occupy pockets', 'Connect #6 and #8 to wide areas and #9', 'Support fullback and wide combinations', 'Arrive near the top of the box'],
      defensiveOrganization: ['Screen central access', 'Support #9 in the press', 'Prevent easy passes into the pivot'],
      attackingTransition: ['Receive and turn', 'Release #9 or wide runners', 'Support underneath when the direct counter is unavailable'],
      defensiveTransition: ['Pressure the first outlet when close', 'Otherwise recover centrally into a separate covering lane'],
    },
    evidence: [{ session: 'Practice Session 5', focus: 'Off-ball movement, line-breaking and transition decisions' }],
  },
  {
    id: 'wide-players',
    shortLabel: 'WIDE',
    positionName: 'Wide Players',
    numbers: '#7 / #11',
    occupants: getOccupants([7, 11]),
    style: 'Direct wide threats who stretch the field, combine, lead pressure and become transition outlets.',
    physical: ['Acceleration', 'Sprint endurance', 'Agility', '1v1 explosiveness', 'Recovery capacity'],
    social: ['Coordinate with the fullback', 'Coordinate with #9', 'Coordinate with #10', 'Communicate pressure and recovery'],
    mental: ['Play with confidence', 'Scan before receiving', 'Move unpredictably', 'Recognize regain and loss'],
    skillSet: ['Receive wide', 'Dribble 1v1', 'Combine with teammates', 'Cross or cut back', 'Finish at the far post', 'Apply curved pressure', 'Recover and defend'],
    moments: {
      attackingOrganization: ['Hold width', 'Penetrate when the lane opens', 'Combine with the fullback', 'Coordinate box runs with #9 and #10'],
      defensiveOrganization: ['Initiate wide pressure', 'Force play toward Channel 1', 'Block inside access', 'Narrow from the weak side'],
      attackingTransition: ['Become the immediate outlet', 'Attack open space', 'Find #9 or the opposite runner'],
      defensiveTransition: ['Counter-press or delay when nearest', 'Otherwise recover inside', 'Support the fullback'],
    },
    evidence: [{ session: 'Practice Session 8', focus: 'Press, regain, support outlet and counter or retain' }],
  },
  {
    id: 'striker',
    shortLabel: 'ST',
    positionName: 'Striker',
    numbers: '#9',
    occupants: getOccupants([9]),
    style: 'Reference forward who provides depth, connects attacks, finishes and leads the first pressure.',
    physical: ['Acceleration', 'Strength', 'Balance', 'Aerial ability', 'Repeat high-intensity actions'],
    social: ['Lead pressing cues', 'Connect #10', 'Connect wide players', 'Demand and communicate forward options'],
    mental: ['Stay composed', 'Show persistence', 'Anticipate service', 'Time movement between centre backs'],
    skillSet: ['Hold and set play', 'Combine in one or two touches', 'Finish', 'Head the ball', 'Run in behind', 'Apply curved pressure'],
    moments: {
      attackingOrganization: ['Occupy and separate centre backs', 'Provide depth', 'Connect combinations', 'Attack the primary finishing area'],
      defensiveOrganization: ['Lead the press', 'Curve the run to direct play', 'Screen the central outlet'],
      attackingTransition: ['Become the first forward target or depth runner', 'Secure the ball when the direct counter is unavailable'],
      defensiveTransition: ['Attack the first escape during the counter-press', 'Screen the next pass', 'Remain the counter outlet when the team drops'],
    },
    evidence: [{ session: 'Practice Session 8', focus: 'Lead pressure, regain and counter or retain' }],
  },
]

export function getPositionalProfile(id: PositionalProfileId): PositionalProfile {
  const profile = POSITIONAL_PROFILES.find((item) => item.id === id)

  if (!profile) {
    throw new Error(`Missing positional profile ${id}`)
  }

  return profile
}

export function getProfileForPosition(position: PlayerPosition): PositionalProfile {
  return getPositionalProfile(PLAYER_POSITION_TO_PROFILE_ID[position])
}
