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

// Sidebar Item (Default, Active). Active = a raised white pill on the canvas, with aria-current.
export function SidebarItem({ to, label, Icon, active = false, count }: SidebarItemProps) {
  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      className={`group flex h-10 w-full items-center gap-3 press rounded-control px-3.5 text-body font-medium transition-[background-color,color,box-shadow] duration-150 ${
        active ? 'bg-surface text-text shadow-card dark:bg-surface-hover' : 'text-muted hover:bg-surface-hover hover:text-text'
      }`}
    >
      <Icon size={18} strokeWidth={active ? 2 : 1.75} className="shrink-0" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count !== undefined && (
        <span className={`tabular shrink-0 text-label ${active ? 'text-muted' : 'text-subtle'}`}>{count}</span>
      )}
    </Link>
  )
}
