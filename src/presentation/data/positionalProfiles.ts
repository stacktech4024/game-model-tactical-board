export type PositionalProfileTrait = {
  icon: string
  label: string
}

export type PositionalProfile = {
  position: string
  fullName: string
  numbers: string
  style: string
  attackingOrg: string
  defensiveOrg: string
  traits: PositionalProfileTrait[]
}

export const POSITIONAL_PROFILES: PositionalProfile[] = [
  {
    position: 'GK',
    fullName: 'Goalkeeper',
    numbers: '#1',
    style: 'Aggressive sweeper-keeper, commands the area',
    attackingOrg: 'Versatile distributor — short or long depending on match demands',
    defensiveOrg: 'Vocal organizer of the back four, comes off the line to win early balls',
    traits: [
      { icon: '🧤', label: 'Shot-stopping' },
      { icon: '📢', label: 'Commands the box' },
      { icon: '🦶', label: 'Distribution' },
    ],
  },
  {
    position: 'CB',
    fullName: 'Centre back',
    numbers: '#4, #5',
    style: 'Vocal, brave, controls the back line',
    attackingOrg: 'Calm on the ball, starts the build-up, combines with full-backs and midfield',
    defensiveOrg: 'Strong in the air, communicates constantly with the partnering centre-back',
    traits: [
      { icon: '📢', label: 'Vocal leader' },
      { icon: '🧠', label: 'Calm on the ball' },
      { icon: '💪', label: 'Strong in the air' },
    ],
  },
  {
    position: 'FB',
    fullName: 'Full back',
    numbers: '#2, #3',
    style: 'Overlap specialist, joins attack and recovers to defend',
    attackingOrg: 'Overlapping runs into wide channels, combines to switch the point of attack',
    defensiveOrg: 'Quick 1v1 defender, specializes against pacey wingers',
    traits: [
      { icon: '⚡', label: 'Pace' },
      { icon: '🔁', label: 'Overlapping runs' },
      { icon: '🛡️', label: '1v1 defending' },
    ],
  },
  {
    position: 'CDM',
    fullName: 'Defensive midfielder',
    numbers: '#6',
    style: 'Aggressive ball-winner, protects the back four',
    attackingOrg: 'Drops to offer a passing option, helps transition play side to side',
    defensiveOrg: 'Wins aerial duels, tracks markers, covers the central gap when partner shifts',
    traits: [
      { icon: '💪', label: 'Ball-winner' },
      { icon: '🧩', label: 'Link play' },
      { icon: '🥇', label: 'Aerial duels' },
    ],
  },
  {
    position: 'CAM',
    fullName: 'Attacking midfielder',
    numbers: '#10',
    style: 'Primary link between midfield and the front line',
    attackingOrg: 'Dictates tempo, switches the point of attack, attacks the top of the box',
    defensiveOrg: 'Screens the central channel, denies the easy pass into midfield',
    traits: [
      { icon: '🎯', label: 'Vision' },
      { icon: '🔄', label: 'Switches play' },
      { icon: '🧱', label: 'Screens midfield' },
    ],
  },
  {
    position: 'WF',
    fullName: 'Wide forward',
    numbers: '#7, #11',
    style: 'Elite speed threat, thrives in 1v1 isolation',
    attackingOrg: 'Holds width, drives low balls into the box, primary trigger runner in transition',
    defensiveOrg: 'Tracks back in 2v1s, denies the switch pass into opposition full-backs',
    traits: [
      { icon: '⚡', label: 'Elite speed' },
      { icon: '🎯', label: '1v1 threat' },
      { icon: '🔁', label: 'Tracks back' },
    ],
  },
  {
    position: 'ST',
    fullName: 'Centre forward',
    numbers: '#9',
    style: 'Physically strong, holds up play, technical finisher',
    attackingOrg: 'Attacks the central channel, 1–2 touch finishes inside the box',
    defensiveOrg: 'Leads the press, curved run denies the pass across the opposition backline',
    traits: [
      { icon: '💪', label: 'Physical' },
      { icon: '⚽', label: 'Clinical finisher' },
      { icon: '🔥', label: 'Leads the press' },
    ],
  },
]
