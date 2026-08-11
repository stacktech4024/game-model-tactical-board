export type PresentationPageId =
  | 'cover'
  | 'intro'
  | 'philosophy'
  | 'pitch-geography'
  | 'moments'
  | 'game-analysis'
  | 'attacking-transition'
  | 'defensive-transition'
  | 'defensive-organization'
  | 'set-pieces'
  | 'live-board'
  | 'players'
  | 'skills'
  | 'how-we-train'
  | 'microcycle'
  | 'methodology'
  | 'closing'

export const PRESENTATION_PAGE_ORDER: PresentationPageId[] = [
  'cover',
  'intro',
  'philosophy',
  'pitch-geography',
  'moments',
  'game-analysis',
  'attacking-transition',
  'defensive-transition',
  'defensive-organization',
  'set-pieces',
  'live-board',
  'players',
  'skills',
  'how-we-train',
  'microcycle',
  'methodology',
  'closing',
]

export const PRESENTATION_PAGE_LABELS: Record<PresentationPageId, string> = {
  cover: 'Cover',
  intro: 'Intro',
  philosophy: 'Our identity',
  'pitch-geography': 'Pitch Geography',
  moments: 'Moments of the Game',
  'game-analysis': 'Game analysis',
  'attacking-transition': 'Attacking transition',
  'defensive-transition': 'Defensive transition',
  'defensive-organization': 'Defensive organization',
  'set-pieces': 'Set pieces',
  'live-board': 'Live tactical board',
  players: 'Positional profiles',
  skills: 'Skill development',
  'how-we-train': 'How we train',
  microcycle: 'Microcycle',
  methodology: 'Training methodology',
  closing: 'Closing',
}
