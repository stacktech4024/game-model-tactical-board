export const SET_PIECES_PAGE_CASE = {
  id: 'attacking-corner-short-decoy-wide-delivery',
  setPieceType: 'Attacking corner',
  system: {
    shape: 'Short corner into the delivery corridor',
    description: 'The short option creates disguise in Channel 1 before the delivery targets the Zone 4 corridor between the goalkeeper and back line.',
  },
  strategy: 'Use the short option to change the angle, deliver into the corridor, attack it with #9, and keep #8/#10 and the rest-defence ready for the next action.',
  tactics: [
    'Short option creates hesitation before the delivery',
    '#7 changes the angle from Channel 1',
    '#9 attacks the central delivery corridor in Zone 4',
    '#8 and #10 arrive for the second ball',
    '#2, #4, #5, and #6 protect rest-defence behind the routine',
  ],
  skillSet: ['Delivery quality', 'Disguise', 'Timing of run', 'Header finishing', 'Second-ball reaction'],
  principles: ['SUPPORT', 'MOBILITY', 'PENETRATION'],
  caption: 'Short option, changed angle, Zone 4 delivery corridor, central #9 target, and second-ball support behind a protected rest-defence.',
  futureSetPieces: ['Defending corner — future', 'Direct free kick — future', 'Indirect free kick — future'],
  liveBoardScenarioId: 'corner-short-decoy-wide-delivery',
  tokenScale: 0.74,
  repeatDelay: 1.2,
} as const
