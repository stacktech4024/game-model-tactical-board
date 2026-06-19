export type MicrocycleRow = {
  day: string
  focus: string
}

export const MICROCYCLE: MicrocycleRow[] = [
  { day: 'MD+1', focus: 'Recovery — light activity, reflection, video review' },
  { day: 'MD+2', focus: 'Tactical — address what broke down in the match; unit work, shape correction' },
  { day: 'MD+3', focus: 'Technical/Tactical — game moment focus; high-intensity SSG' },
  { day: 'MD-1', focus: 'Activation — short, sharp, set pieces, team shape walkthrough; low volume' },
]

export const COACHING_TOOLS = [
  {
    title: 'Freeze & recreate',
    detail: 'Pause the action, reset positions, and replay the moment, asking players to problem-solve the next decision.',
  },
  {
    title: 'Natural stoppages',
    detail: 'Use breaks in play to ask questions rather than lecture, keeping players thinking.',
  },
  {
    title: 'Individual coaching (live)',
    detail: 'Quiet, targeted feedback to a single player while play continues, preserving session flow.',
  },
  {
    title: 'Mini group discussions',
    detail: 'Split the team into units to discuss and arrive at their own tactical solution.',
  },
]

export const METHODOLOGY_WHY =
  'I train this way because the game itself is the best teacher. My role is to design the environment so the problems we face on match day appear regularly in training, then guide players toward solving them intelligently. A player who has repeatedly solved a build-up scenario in training doesn\u2019t need to be told what to do when it appears on Saturday \u2014 they\u2019ve already solved it.'
