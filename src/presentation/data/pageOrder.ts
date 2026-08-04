export type PresentationPageId =
  | 'cover'
  | 'intro'
  | 'philosophy'
  | 'game-analysis'
  | 'attacking-transition'
  | 'defensive-transition'
  | 'defensive-organization'
  | 'set-pieces'
  | 'diagrams'
  | 'live-board'
  | 'players'
  | 'skills'
  | 'methodology'
  | 'closing'

export const PRESENTATION_PAGE_ORDER: PresentationPageId[] = [
  'cover',
  'intro',
  'philosophy',
  'game-analysis',
  'attacking-transition',
  'defensive-transition',
  'defensive-organization',
  'set-pieces',
  'diagrams',
  'live-board',
  'players',
  'skills',
  'methodology',
  'closing',
]

export const PRESENTATION_PAGE_LABELS: Record<PresentationPageId, string> = {
  cover: 'Cover',
  intro: 'Intro',
  philosophy: 'Our identity',
  'game-analysis': 'Game analysis',
  'attacking-transition': 'Attacking transition',
  'defensive-transition': 'Defensive transition',
  'defensive-organization': 'Defensive organization',
  'set-pieces': 'Set pieces',
  diagrams: 'Moment diagrams',
  'live-board': 'Live tactical board',
  players: 'Squad roles',
  skills: 'Skill development',
  methodology: 'Training methodology',
  closing: 'Closing',
}
