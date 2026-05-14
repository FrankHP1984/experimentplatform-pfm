import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

// Public pages
import Landing           from '../pages/public/Landing'
import ParticipantInvite from '../pages/public/ParticipantInvite'
import AuthCallback      from '../pages/auth/AuthCallback'
import LegalNotice       from '../pages/public/LegalNotice'
import CookiesPolicy     from '../pages/public/CookiesPolicy'

// Researcher pages
import Onboarding          from '../pages/researcher/Onboarding'
import Dashboard           from '../pages/researcher/Dashboard'
import ExperimentDetail    from '../pages/researcher/ExperimentDetail'
import ExperimentWizard    from '../pages/researcher/ExperimentWizard'
import ResponsesAnalytics  from '../pages/researcher/ResponsesAnalytics'
import ProfileResearcher   from '../pages/researcher/ProfileResearcher'

// Participant pages
import DashboardParticipant from '../pages/participant/DashboardParticipant'
import Questionnaire        from '../pages/participant/Questionnaire'
import ProfileParticipant   from '../pages/participant/ProfileParticipant'

// Error pages
import NotFound from '../pages/errors/NotFound'

function PrivateRoute({ children, role }) {
  const { user, isAuthenticated, isLoading } = useAuthContext()

  if (isLoading) return null

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />
  }

  if (role && user.role !== role) {
    return <Navigate to="/404" replace />
  }

  return children
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/invite/:token" element={<ParticipantInvite />} />
      <Route path="/aviso-legal" element={<LegalNotice />} />
      <Route path="/politica-cookies" element={<CookiesPolicy />} />

      {/* Researcher */}
      <Route path="/onboarding" element={
        <PrivateRoute role="RESEARCHER"><Onboarding /></PrivateRoute>
      } />
      <Route path="/dashboard" element={
        <PrivateRoute role="RESEARCHER"><Dashboard /></PrivateRoute>
      } />
      <Route path="/experiments" element={
        <PrivateRoute role="RESEARCHER"><Dashboard /></PrivateRoute>
      } />
      <Route path="/experiments/:id" element={
        <PrivateRoute role="RESEARCHER"><ExperimentDetail /></PrivateRoute>
      } />
      <Route path="/experiments/:id/wizard" element={
        <PrivateRoute role="RESEARCHER"><ExperimentWizard /></PrivateRoute>
      } />
      <Route path="/experiments/:id/analytics" element={
        <PrivateRoute role="RESEARCHER"><ResponsesAnalytics /></PrivateRoute>
      } />
      <Route path="/profile" element={
        <PrivateRoute role="RESEARCHER"><ProfileResearcher /></PrivateRoute>
      } />

      {/* Participant */}
      <Route path="/participant/dashboard" element={
        <PrivateRoute role="PARTICIPANT"><DashboardParticipant /></PrivateRoute>
      } />
      <Route path="/participant/study/:enrollmentId/questionnaire" element={
        <PrivateRoute role="PARTICIPANT"><Questionnaire /></PrivateRoute>
      } />
      <Route path="/participant/profile" element={
        <PrivateRoute role="PARTICIPANT"><ProfileParticipant /></PrivateRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
