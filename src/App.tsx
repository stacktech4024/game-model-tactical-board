import { Navigate, Route, Routes } from 'react-router-dom'
import TacticalBoardPage from './pages/TacticalBoardPage'
import { CoverPage } from './presentation/pages/CoverPage'
import { IntroPage } from './presentation/pages/IntroPage'
import { PhilosophyPage } from './presentation/pages/PhilosophyPage'
import { PitchGeographyPage } from './presentation/pages/PitchGeographyPage'
import { AttackingFormationPage, DefensiveFormationPage } from './presentation/pages/FormationOverviewPage'
import { MomentsPage } from './presentation/pages/MomentsPage'
import { GameAnalysisPage } from './presentation/pages/GameAnalysisPage'
import { AttackingTransitionPage } from './presentation/pages/AttackingTransitionPage'
import { DefensiveTransitionPage } from './presentation/pages/DefensiveTransitionPage'
import { DefensiveOrganizationPage } from './presentation/pages/DefensiveOrganizationPage'
import { SetPiecesPage } from './presentation/pages/SetPiecesPage'
import { FreeKicksPage } from './presentation/pages/FreeKicksPage'
import { LiveBoardPage } from './presentation/pages/LiveBoardPage'
import { PlayersPage } from './presentation/pages/PlayersPage'
import { SkillsPage } from './presentation/pages/SkillsPage'
import { HowWeTrainPage } from './presentation/pages/HowWeTrainPage'
import { HowWeTrainExamplesPage } from './presentation/pages/HowWeTrainExamplesPage'
import { HowWeTrainPicturesPage } from './presentation/pages/HowWeTrainPicturesPage'
import { HowWeTrainTransferPage } from './presentation/pages/HowWeTrainTransferPage'
import { MicrocyclePage } from './presentation/pages/MicrocyclePage'
import { MicrocycleDetailPage } from './presentation/pages/MicrocycleDetailPage'
import { MethodologyPage } from './presentation/pages/MethodologyPage'
import { ClosingPage } from './presentation/pages/ClosingPage'
import { EvaluatorGuidePage } from './presentation/pages/EvaluatorGuidePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/presentation/cover" replace />} />
      <Route path="/board" element={<TacticalBoardPage />} />
      <Route path="/evaluator" element={<EvaluatorGuidePage />} />
      <Route path="/presentation/cover" element={<CoverPage />} />
      <Route path="/presentation/intro" element={<IntroPage />} />
      <Route path="/presentation/philosophy" element={<PhilosophyPage />} />
      <Route path="/presentation/pitch-geography" element={<PitchGeographyPage />} />
      <Route path="/presentation/attacking-formation" element={<AttackingFormationPage />} />
      <Route path="/presentation/defensive-formation" element={<DefensiveFormationPage />} />
      <Route path="/presentation/moments" element={<MomentsPage />} />
      <Route path="/presentation/game-analysis" element={<GameAnalysisPage />} />
      <Route path="/presentation/attacking-transition" element={<AttackingTransitionPage />} />
      <Route path="/presentation/defensive-transition" element={<DefensiveTransitionPage />} />
      <Route path="/presentation/defensive-organization" element={<DefensiveOrganizationPage />} />
      <Route path="/presentation/set-pieces" element={<SetPiecesPage />} />
      <Route path="/presentation/free-kicks" element={<FreeKicksPage />} />
      <Route path="/presentation/live-board" element={<LiveBoardPage />} />
      <Route path="/presentation/players" element={<PlayersPage />} />
      <Route path="/presentation/skills" element={<SkillsPage />} />
      <Route path="/presentation/how-we-train" element={<HowWeTrainPage />} />
      <Route path="/presentation/how-we-train-session" element={<HowWeTrainExamplesPage />} />
      <Route path="/presentation/how-we-train-pictures" element={<HowWeTrainPicturesPage />} />
      <Route path="/presentation/how-we-train-transfer" element={<HowWeTrainTransferPage />} />
      <Route path="/presentation/how-we-train/examples" element={<HowWeTrainExamplesPage />} />
      <Route path="/presentation/microcycle" element={<MicrocyclePage />} />
      <Route path="/presentation/microcycle-detail" element={<MicrocycleDetailPage />} />
      <Route path="/presentation/methodology" element={<MethodologyPage />} />
      <Route path="/presentation/closing" element={<ClosingPage />} />
      <Route path="*" element={<Navigate to="/presentation/cover" replace />} />
    </Routes>
  )
}

export default App
