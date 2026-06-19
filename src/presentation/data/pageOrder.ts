export type PresentationPageId =
  | 'cover'
  | 'intro'
  | 'game-analysis'
  | 'diagrams'
  | 'live-board'
  | 'skills'
  | 'methodology'
  | 'closing'

export const PRESENTATION_PAGE_ORDER: PresentationPageId[] = [
  'cover',
  'intro',
  'game-analysis',
  'diagrams',
  'live-board',
  'skills',
  'methodology',
  'closing',
]

export const PRESENTATION_PAGE_LABELS: Record<PresentationPageId, string> = {
  cover: 'Cover',
  intro: 'Intro',
  'game-analysis': 'Game analysis',
  diagrams: 'Moment diagrams',
  'live-board': 'Live tactical board',
  skills: 'Skill development',
  methodology: 'Training methodology',
  closing: 'Closing',
}
