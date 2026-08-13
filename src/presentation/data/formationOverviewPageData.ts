import { PICKERING_SQUAD } from '../../data/squad.ts'
import type { PresentationPageId } from './pageOrder.ts'

export type FormationOverviewVariant = 'attacking' | 'defensive'

export type FormationOverviewPlayer = {
  id: string
  number: number
  name: string
  position: string
  role: string
  left: number
  bottom: number
  isGoalkeeper: boolean
}

export type FormationOverview = {
  pageId: PresentationPageId
  title: string
  eyebrow: string
  momentLabel: string
  formation: string
  shapeLine: string
  description: string
  explanation: string
  principles: string[]
  directionLabel: string
  players: FormationOverviewPlayer[]
}

const ATTACKING_ROLES: Record<number, string> = {
  1: 'Goalkeeper',
  2: 'Right Back',
  3: 'Left Back',
  4: 'Centre Back',
  5: 'Centre Back',
  6: 'Central Midfielder',
  7: 'Right Midfielder',
  8: 'Central Midfielder',
  9: 'Striker',
  10: 'Left Midfielder',
  11: 'Second Striker',
}

const DEFENSIVE_ROLES: Record<number, string> = {
  1: 'Goalkeeper',
  2: 'Right Back',
  3: 'Left Back',
  4: 'Centre Back',
  5: 'Centre Back',
  6: 'Holding Midfielder',
  7: 'Right Midfielder',
  8: 'Holding Midfielder',
  9: 'Striker',
  10: 'Left Midfielder',
  11: 'Central Attacking Midfielder',
}

const PORTFOLIO_POSITIONS: Record<FormationOverviewVariant, Record<number, { left: number; bottom: number }>> = {
  attacking: {
    1: { left: 50, bottom: 11 },
    2: { left: 78, bottom: 30 },
    3: { left: 22, bottom: 30 },
    4: { left: 58, bottom: 24 },
    5: { left: 42, bottom: 24 },
    6: { left: 43, bottom: 48 },
    7: { left: 73, bottom: 51 },
    8: { left: 57, bottom: 48 },
    9: { left: 60, bottom: 68 },
    10: { left: 27, bottom: 51 },
    11: { left: 40, bottom: 68 },
  },
  defensive: {
    1: { left: 50, bottom: 11 },
    2: { left: 75, bottom: 30 },
    3: { left: 25, bottom: 30 },
    4: { left: 58, bottom: 24 },
    5: { left: 42, bottom: 24 },
    6: { left: 44, bottom: 39 },
    7: { left: 68, bottom: 51 },
    8: { left: 56, bottom: 39 },
    9: { left: 50, bottom: 64 },
    10: { left: 32, bottom: 51 },
    11: { left: 50, bottom: 48 },
  },
}

function buildPlayers(
  variant: FormationOverviewVariant,
  roles: Record<number, string>,
): FormationOverviewPlayer[] {
  const positions = PORTFOLIO_POSITIONS[variant]

  return PICKERING_SQUAD.map((player) => {
    const point = positions[player.number]

    if (!point) {
      throw new Error(`Missing ${variant} portfolio position for #${player.number}`)
    }

    return {
      id: player.id,
      number: player.number,
      name: player.name,
      position: player.position,
      role: roles[player.number],
      left: point.left,
      bottom: point.bottom,
      isGoalkeeper: player.isGoalkeeper,
    }
  })
}

export const FORMATION_OVERVIEWS: Record<FormationOverviewVariant, FormationOverview> = {
  attacking: {
    pageId: 'attacking-formation',
    title: 'Attacking Organization',
    eyebrow: 'Our team shape when we are attacking',
    momentLabel: 'In possession',
    formation: '1-4-4-2',
    shapeLine: '1 goalkeeper · 4 defenders · 4 midfielders · 2 forwards',
    description:
      'When we have the ball, we organize in a 1-4-4-2. The team expands to create width, supports the ball underneath, and connects #11 with #9 as we progress toward Zone 4.',
    explanation:
      'The Fullbacks can support and overlap, #10 and #7 provide the starting width, and #11 joins #9 to give us two central targets. This is the portfolio reference shape before the game picture changes.',
    principles: ['Create width', 'Support underneath', 'Connect two forwards', 'Progress into Zone 4'],
    directionLabel: 'ATTACKING DIRECTION',
    players: buildPlayers('attacking', ATTACKING_ROLES),
  },
  defensive: {
    pageId: 'defensive-formation',
    title: 'Defensive Organization',
    eyebrow: 'Our team shape when we are defending',
    momentLabel: 'Out of possession',
    formation: '1-4-2-3-1',
    shapeLine: '1 goalkeeper · 4 defenders · 2 holding midfielders · 3 midfielders · 1 forward',
    description:
      'When the opponent has the ball, we recover into a compact 1-4-2-3-1. The team protects the centre first, keeps the units connected, and directs play toward the wide channels.',
    explanation:
      '#6 and #8 screen in front of the back four, #10, #11 and #7 form the next compact line, and #9 remains the first defender and counter outlet. This is our portfolio reference shape when defending.',
    principles: ['Stay compact', 'Protect the centre', 'Force play wide', 'Remain ready to counter'],
    directionLabel: 'PROTECT OUR GOAL',
    players: buildPlayers('defensive', DEFENSIVE_ROLES),
  },
}

export function getFormationOverview(variant: FormationOverviewVariant) {
  return FORMATION_OVERVIEWS[variant]
}
