import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/contexts/ThemeProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { PublicLayout } from '@/components/PublicLayout'
import Layout from '@/components/Layout'

// Public Pages
import Index from './pages/Index'
import About from './pages/About'
import Pricing from './pages/Pricing'
import TermsOfUse from './pages/TermsOfUse'
import PrivacyPolicy from './pages/PrivacyPolicy'
import NotFound from './pages/NotFound'

// Auth Pages
import Login from './pages/Login'
import Register from './pages/Register'

// App Pages
import CreateFlashcards from './pages/app/CreateFlashcards'
import ViewFlashcards from './pages/app/ViewFlashcards'
import MyCollections from './pages/app/MyCollections'
import CollectionView from './pages/app/CollectionView'
import Settings from './pages/app/Settings'
import GenerationError from './pages/app/GenerationError'
import Oraculo from './pages/app/Oraculo'
import AgentContextSettings from './pages/app/AgentContextSettings'
import SystemDiagnostic from './pages/app/SystemDiagnostic'

const App = () => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/pricing" element={<Pricing />} />
            </Route>

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected App Routes */}
            <Route path="/app" element={<Layout />}>
              <Route element={<ProtectedRoute />}>
                <Route
                  path="create-flashcards"
                  element={<CreateFlashcards />}
                />
                <Route path="view-flashcards" element={<ViewFlashcards />} />
                <Route path="my-collections" element={<MyCollections />} />
                <Route
                  path="collections/:collectionId"
                  element={<CollectionView />}
                />
                <Route path="oraculo" element={<Oraculo />} />
                <Route path="settings" element={<Settings />} />
                <Route path="agent-context" element={<AgentContextSettings />} />
                <Route path="diagnostic" element={<SystemDiagnostic />} />
                <Route path="generation-error" element={<GenerationError />} />
              </Route>
            </Route>

            {/* Standalone Legal Routes */}
            <Route path="/terms-of-use" element={<TermsOfUse />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />

            {/* Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
)

export default App
