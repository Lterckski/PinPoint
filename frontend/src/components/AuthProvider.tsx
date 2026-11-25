import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, ApiError, UNAUTHORIZED_EVENT } from '../lib/api'
import { AuthContext, type AuthStatus } from '../lib/auth'
import type { AuthSession, AuthUser } from '../lib/types'

/** Loads who is signed in once, and keeps it current: any 401 from the API signs the app out. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUserState] = useState<AuthUser | null>(null)
  const [authEnabled, setAuthEnabled] = useState(true)
  const [attempt, setAttempt] = useState(0)

  const apply = useCallback((session: AuthSession) => {
    setAuthEnabled(session.auth_enabled)
    setUserState(session.user)
    setStatus(session.user ? 'signed-in' : session.setup_required ? 'setup' : 'signed-out')
  }, [])

  useEffect(() => {
    let alive = true
    api.session().then(
      (s) => alive && apply(s),
      (e: unknown) => alive && setStatus(e instanceof ApiError && e.status === 0 ? 'unreachable' : 'signed-out'),
    )
    return () => {
      alive = false
    }
  }, [apply, attempt])

  useEffect(() => {
    const onUnauthorized = () => {
      setUserState(null)
      setStatus((s) => (s === 'signed-in' ? 'signed-out' : s))
    }
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
  }, [])

  const signIn = useCallback(async (email: string, password: string) => apply(await api.signIn(email, password)), [apply])
  const setup = useCallback(
    async (name: string, email: string, password: string) => apply(await api.setup(name, email, password)),
    [apply],
  )
  const signOut = useCallback(async () => {
    try {
      await api.signOut()
    } finally {
      setUserState(null)
      setStatus('signed-out')
    }
  }, [])
  const setUser = useCallback((u: AuthUser) => setUserState(u), [])
  const retry = useCallback(() => {
    setStatus('loading')
    setAttempt((n) => n + 1)
  }, [])

  const value = useMemo(
    () => ({ status, user, authEnabled, signIn, setup, signOut, apply, setUser, retry }),
    [status, user, authEnabled, signIn, setup, signOut, apply, setUser, retry],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
