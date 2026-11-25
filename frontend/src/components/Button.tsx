import { Loader2, type LucideIcon } from 'lucide-react'
import type { ComponentProps } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent text-on-accent shadow-subtle hover:bg-accent-hover hover:shadow-card',
  secondary: 'border border-border bg-surface text-text shadow-subtle hover:border-border-strong hover:bg-surface-muted',
  ghost: 'text-muted hover:bg-surface-hover hover:text-text',
  danger: 'border border-danger/40 bg-surface text-danger hover:bg-danger-soft',
}

const SIZES: Record<Size, string> = {
  sm: 'h-8 gap-1.5 px-3 text-small',
  md: 'h-9 gap-2 px-3.5 text-body',
  lg: 'h-11 gap-2 px-5 text-body',
}

type ButtonProps = ComponentProps<'button'> & {
  variant?: Variant
  size?: Size
  Icon?: LucideIcon
  /** Shows a spinner, keeps the width, and blocks clicks while an action runs. */
  loading?: boolean
}

// Button: one primary per view; secondary for alternatives; ghost for low emphasis; danger for destructive.
export function Button({
  variant = 'primary',
  size = 'md',
  Icon,
  loading = false,
  className = '',
  children,
  type = 'button',
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex shrink-0 items-center justify-center rounded-control font-medium whitespace-nowrap press select-none disabled:pointer-events-none disabled:opacity-50 ${SIZES[size]} ${VARIANTS[variant]} ${Icon || loading ? (size === 'sm' ? 'pl-2.5' : 'pl-3') : ''} ${className}`}
      {...rest}
    >
      {loading ? (
        <Loader2 size={16} strokeWidth={2} className="shrink-0 animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon size={16} strokeWidth={1.75} className="shrink-0" aria-hidden="true" />
      )}
      {children}
    </button>
  )
}
