import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ErrorBoundary } from './components/ErrorBoundary'
import { FullPageStatus } from './components/FullPageStatus'
import { RequireAuth } from './components/RequireAuth'
import { useAuth } from './lib/auth'
import { AskPage } from './pages/AskPage'
import { FilesPage } from './pages/FilesPage'
import { LandingPage } from './pages/LandingPage'
import { MemoryPage } from './pages/MemoryPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SelectClientPage } from './pages/SelectClientPage'
import { SettingsPage } from './pages/SettingsPage'
import { SignInPage } from './pages/SignInPage'
import { WorkspaceLayout } from './pages/WorkspaceLayout'
import { WorkspacesPage } from './pages/WorkspacesPage'

/** "/": the landing page when signed out; straight to the workspaces when signed in. */
function Home() {
  const { status } = useAuth()
  if (status === 'loading') return <FullPageStatus kind="loading" />
  return status === 'signed-in' ? <Navigate to="/workspaces" replace /> : <LandingPage />
}

function Screen() {
  const { pathname } = useLocation()
  return (
    <ErrorBoundary resetKey={pathname}>
      <Outlet />
    </ErrorBoundary>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/welcome" element={<LandingPage />} />
      <Route path="/landing" element={<Navigate to="/welcome" replace />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route element={<Screen />}>
            <Route path="/workspaces" element={<WorkspacesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/files" element={<SelectClientPage tab="files" />} />
            <Route path="/ask" element={<SelectClientPage tab="ask" />} />
            <Route path="/memory" element={<SelectClientPage tab="memory" />} />
            <Route path="/w/:id" element={<WorkspaceLayout />}>
              <Route index element={<Navigate to="ask" replace />} />
              <Route path="files" element={<FilesPage />} />
              <Route path="ask" element={<AskPage />} />
              <Route path="memory" element={<MemoryPage />} />
            </Route>
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
