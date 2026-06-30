import { Navigate, Route, Routes } from 'react-router-dom'
import TacticalBoardPage from './pages/TacticalBoardPage'
import { CoverPage } from './presentation/pages/CoverPage'
import { IntroPage } from './presentation/pages/IntroPage'
import { PhilosophyPage } from './presentation/pages/PhilosophyPage'
import { GameAnalysisPage } from './presentation/pages/GameAnalysisPage'
import { DiagramsPage } from './presentation/pages/DiagramsPage'
import { LiveBoardPage } from './presentation/pages/LiveBoardPage'
import { PlayersPage } from './presentation/pages/PlayersPage'
import { SkillsPage } from './presentation/pages/SkillsPage'
import { MethodologyPage } from './presentation/pages/MethodologyPage'
import { ClosingPage } from './presentation/pages/ClosingPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/presentation/cover" replace />} />
      <Route path="/board" element={<TacticalBoardPage />} />
      <Route path="/presentation/cover" element={<CoverPage />} />
      <Route path="/presentation/intro" element={<IntroPage />} />
      <Route path="/presentation/philosophy" element={<PhilosophyPage />} />
      <Route path="/presentation/game-analysis" element={<GameAnalysisPage />} />
      <Route path="/presentation/diagrams" element={<DiagramsPage />} />
      <Route path="/presentation/live-board" element={<LiveBoardPage />} />
      <Route path="/presentation/players" element={<PlayersPage />} />
      <Route path="/presentation/skills" element={<SkillsPage />} />
      <Route path="/presentation/methodology" element={<MethodologyPage />} />
      <Route path="/presentation/closing" element={<ClosingPage />} />
      <Route path="*" element={<Navigate to="/presentation/cover" replace />} />
    </Routes>
  )
}

export default App
