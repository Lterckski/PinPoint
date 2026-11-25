import { createContext, useContext } from 'react'
import type { AuthSession, AuthUser } from './types'

export type AuthStatus = 'loading' | 'signed-in' | 'signed-out' | 'setup' | 'unreachable'

export type AuthContextValue = {
  status: AuthStatus
  user: AuthUser | null
  /** False when the server runs without sign-in (PINPOINT_AUTH=off). */
  authEnabled: boolean
  signIn: (email: string, password: string) => Promise<void>
  setup: (name: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  /** Apply a session the server returned (after a profile or password change). */
  apply: (session: AuthSession) => void
  setUser: (user: AuthUser) => void
  retry: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}

/**
 * Where to go after signing in. Only same-app paths are allowed ("/w/x/ask"), never another
 * site ("//evil.example", "https://…", "/\\evil"), so a crafted link can't bounce a user away.
 */
export function safeNext(next: string | null | undefined, fallback = '/workspaces'): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback
  if ([...next].some((ch) => ch.charCodeAt(0) < 0x20 || ch.charCodeAt(0) === 0x7f)) return fallback
  if (next === '/signin' || next.startsWith('/signin?')) return fallback
  return next
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}
