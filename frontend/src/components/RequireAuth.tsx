import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { FullPageStatus } from './FullPageStatus'

// Routes inside need a signed-in user. Others go to /signin and come back here afterwards.
export function RequireAuth() {
  const { status, retry } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <FullPageStatus kind="loading" />
  if (status === 'unreachable') return <FullPageStatus kind="unreachable" onRetry={retry} />
  if (status !== 'signed-in') {
    const next = location.pathname + location.search
    return <Navigate to={`/signin?next=${encodeURIComponent(next)}`} replace />
  }
  return <Outlet />
}
