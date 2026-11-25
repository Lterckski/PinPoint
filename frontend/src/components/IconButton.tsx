import type { LucideIcon } from 'lucide-react'
import type { ComponentProps } from 'react'

type IconButtonProps = Omit<ComponentProps<'button'>, 'children'> & {
  Icon: LucideIcon
  /** Required: an icon-only button needs an accessible name. */
  label: string
  tone?: 'default' | 'danger'
  size?: 'sm' | 'md'
}

// Square icon-only button with a visible hit area of 32px (sm) or 36px (md).
export function IconButton({ Icon, label, tone = 'default', size = 'md', className = '', type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`inline-flex shrink-0 items-center justify-center rounded-control text-muted transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 ${
        size === 'sm' ? 'size-8' : 'size-9'
      } ${tone === 'danger' ? 'hover:bg-danger-soft hover:text-danger' : 'hover:bg-surface-hover hover:text-text'} ${className}`}
      {...rest}
    >
      <Icon size={size === 'sm' ? 16 : 18} strokeWidth={1.75} aria-hidden="true" />
    </button>
  )
}
