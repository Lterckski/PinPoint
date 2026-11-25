import { MapPinOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'

// 404 for any unknown address.
export function NotFoundPage() {
  const { status } = useAuth()
  return (
    <main id="main" className="flex min-h-dvh items-center justify-center bg-bg px-6">
      <div className="animate-rise-in flex max-w-sm flex-col items-center gap-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-card bg-surface-muted text-muted">
          <MapPinOff size={22} strokeWidth={1.75} aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h1 className="text-h1 text-text">Page not found</h1>
          <p className="text-body text-muted">This page doesn't exist, or the link is out of date.</p>
        </div>
        <Link
          to={status === 'signed-in' ? '/workspaces' : '/'}
          className="inline-flex h-9 items-center rounded-control bg-accent px-3.5 text-body font-medium text-on-accent hover:bg-accent-hover press"
        >
          {status === 'signed-in' ? 'Back to workspaces' : 'Go to the home page'}
        </Link>
      </div>
    </main>
  )
}
