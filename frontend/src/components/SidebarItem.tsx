import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

type SidebarItemProps = {
  to: string
  label: string
  Icon: LucideIcon
  active?: boolean
  /** A small count on the right, e.g. files in a workspace. */
  count?: number
}

// Sidebar Item (Default, Active). Active = accent-tinted row with aria-current.
export function SidebarItem({ to, label, Icon, active = false, count }: SidebarItemProps) {
  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      className={`group flex h-9 w-full items-center gap-2.5 press rounded-control px-2.5 text-body font-medium ${
        active ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-surface-hover hover:text-text'
      }`}
    >
      <Icon size={18} strokeWidth={active ? 2 : 1.75} className="shrink-0" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count !== undefined && (
        <span className={`tabular shrink-0 text-label ${active ? 'text-accent' : 'text-subtle'}`}>{count}</span>
      )}
    </Link>
  )
}
