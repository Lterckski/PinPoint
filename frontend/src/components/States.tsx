import { AlertTriangle, RotateCw, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from './Button'

/** A shimmering placeholder block. Size it with className (height, width, radius). */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`skeleton rounded-box ${className}`} />
}

type EmptyStateProps = {
  Icon: LucideIcon
  title: string
  children?: ReactNode
  /** Buttons or links: the one next step. */
  actions?: ReactNode
  compact?: boolean
}

// Empty state: says what will appear here and offers the one action that fills it.
export function EmptyState({ Icon, title, children, actions, compact = false }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center rounded-card border border-dashed border-border-strong text-center ${
        compact ? 'gap-2 px-5 py-6' : 'gap-3 px-6 py-12'
      }`}
    >
      <div className={`flex items-center justify-center rounded-card bg-surface-muted text-muted ${compact ? 'size-9' : 'size-11'}`}>
        <Icon size={compact ? 18 : 20} strokeWidth={1.75} aria-hidden="true" />
      </div>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="text-h3 text-text">{title}</p>
        {children && <div className="text-small text-muted">{children}</div>}
      </div>
      {actions && <div className="flex flex-wrap justify-center gap-2 pt-1">{actions}</div>}
    </div>
  )
}

type ErrorStateProps = {
  title?: string
  message: string
  onRetry?: () => void
  retrying?: boolean
}

// Error state: what failed in plain words, and a retry when trying again can help.
export function ErrorState({ title = 'Something went wrong', message, onRetry, retrying = false }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col gap-3 rounded-card border border-danger/25 bg-danger-soft px-4 py-3.5 sm:flex-row sm:items-center sm:px-5">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <AlertTriangle size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-danger" aria-hidden="true" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-body font-medium text-text">{title}</p>
          <p className="text-small text-muted">{message}</p>
        </div>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" Icon={RotateCw} loading={retrying} onClick={onRetry} className="self-start sm:self-auto">
          Try again
        </Button>
      )}
    </div>
  )
}
