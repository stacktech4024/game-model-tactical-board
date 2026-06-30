export type PresentationPageId =
  | 'cover'
  | 'intro'
  | 'philosophy'
  | 'game-analysis'
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
  diagrams: 'Moment diagrams',
  'live-board': 'Live tactical board',
  players: 'Squad roles',
  skills: 'Skill development',
  methodology: 'Training methodology',
  closing: 'Closing',
}
