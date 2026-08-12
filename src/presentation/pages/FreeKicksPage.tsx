import { SET_PIECES_PAGE_CASES } from '../data/setPiecesPageData'
import { SetPieceRegimePage } from './SetPiecesPage'

const FREE_KICK_CASES = SET_PIECES_PAGE_CASES.filter((item) => (
  item.id === 'direct-free-kick' || item.id === 'indirect-free-kick'
))

export function FreeKicksPage() {
  return (
    <SetPieceRegimePage
      pageId="free-kicks"
      eyebrow="Dedicated page - free-kick regimes"
      title="Direct & Indirect Free Kicks"
      intro="Two rehearsed professional-game references adapted to Pickering roles, Law 13, and our movement, body-orientation, timing, speed, rebound, and rest-defence principles."
      cases={FREE_KICK_CASES}
      panelLabel="Free Kicks"
      tabListLabel="Direct and indirect free-kick regime"
      labClassName="free-kicks-lab"
    />
  )
}
