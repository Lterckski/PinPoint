import { Loader2, RotateCw, ServerOff } from 'lucide-react'
import { Button } from './Button'
import { LogoMark } from './Logo'

type FullPageStatusProps = { kind: 'loading' | 'unreachable'; onRetry?: () => void }

// Whole-screen states before the app can show anything: checking the session, or no server.
export function FullPageStatus({ kind, onRetry }: FullPageStatusProps) {
  if (kind === 'loading') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg" role="status">
        <div className="animate-fade-in flex flex-col items-center gap-4">
          <LogoMark size={48} />
          <Loader2 size={18} strokeWidth={2} className="animate-spin text-subtle" aria-hidden="true" />
          <span className="sr-only">Loading PinPoint…</span>
        </div>
      </div>
    )
  }
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg px-6">
      <div role="alert" className="animate-rise-in flex max-w-sm flex-col items-center gap-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-card bg-surface-muted text-muted">
          <ServerOff size={22} strokeWidth={1.75} aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h1 className="text-h2 text-text">Can't reach PinPoint</h1>
          <p className="text-body text-muted">
            The PinPoint server isn't responding. Check that it's running on this computer, then try again.
          </p>
        </div>
        <Button Icon={RotateCw} onClick={onRetry}>
          Try again
        </Button>
      </div>
    </div>
  )
}
