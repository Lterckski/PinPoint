import { Briefcase, Calculator, Home, Scale, Trash2, Umbrella, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { timeAgo } from '../lib/format'
import type { Workspace } from '../lib/types'
import { Skeleton } from './States'

const INDUSTRY_ICONS: [string[], LucideIcon][] = [
  [['law', 'legal'], Scale],
  [['real'], Home],
  [['account'], Calculator],
  [['insur'], Umbrella],
]

function IndustryIcon({ industry }: { industry: string }) {
  const i = industry.toLowerCase()
  const Icon = INDUSTRY_ICONS.find(([keys]) => keys.some((k) => i.includes(k)))?.[1] ?? Briefcase
  return <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
}

type WorkspaceTableProps = {
  workspaces: Workspace[]
  loading?: boolean
  /** Where a row opens. Defaults to the workspace's Ask tab. */
  linkTo?: (workspace: Workspace) => string
  onDelete?: (workspace: Workspace) => void
}

const COLS_WITH_DELETE = 'grid-cols-[minmax(0,1fr)_auto_32px] md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)_72px_112px_32px]'
const COLS = 'grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)_72px_112px]'

// The client register: one ruled row per workspace. The name is a link stretched over the whole
// row; delete sits above it, so it is never a button inside a link.
export function WorkspaceTable({ workspaces, loading = false, linkTo, onDelete }: WorkspaceTableProps) {
  const cols = onDelete ? COLS_WITH_DELETE : COLS
  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface shadow-subtle">
      <div role="table" aria-label="Client workspaces" aria-busy={loading || undefined}>
        <div role="rowgroup" className="hidden border-b border-border md:block">
          <div role="row" className={`grid ${cols} items-center gap-4 px-5 py-2.5 text-label text-subtle`}>
            <span role="columnheader">Client</span>
            <span role="columnheader">Industry</span>
            <span role="columnheader" className="text-right">
              Files
            </span>
            <span role="columnheader">Last updated</span>
            {onDelete && (
              <span role="columnheader">
                <span className="sr-only">Actions</span>
              </span>
            )}
          </div>
        </div>
        <div role="rowgroup" className="stagger divide-y divide-border">
          {loading && !workspaces.length
            ? [0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                  <Skeleton className="size-8" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ))
            : workspaces.map((w) => (
                <div
                  key={w.id}
                  role="row"
                  className={`group relative grid ${cols} items-center gap-x-4 px-5 py-3.5 transition-colors duration-150 hover:bg-surface-muted`}
                >
                  <span role="cell" className="flex min-w-0 items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-control bg-surface-muted text-muted transition-colors duration-150 group-hover:bg-surface group-hover:text-text">
                      <IndustryIcon industry={w.industry} />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <Link
                        to={linkTo ? linkTo(w) : `/w/${w.id}/ask`}
                        className="truncate rounded-sm text-body font-medium text-text after:absolute after:inset-0 after:content-['']"
                      >
                        {w.name}
                      </Link>
                      <span className="tabular truncate text-small text-subtle md:hidden">
                        {w.industry}, {w.file_count} file{w.file_count === 1 ? '' : 's'}
                      </span>
                    </span>
                  </span>
                  <span role="cell" className="hidden truncate text-body text-muted md:block">
                    {w.industry}
                  </span>
                  <span role="cell" className="tabular hidden text-right text-body text-text md:block">
                    {w.file_count}
                  </span>
                  <span role="cell" className="tabular text-small whitespace-nowrap text-subtle md:text-body md:text-muted">
                    {timeAgo(w.updated_at)}
                  </span>
                  {onDelete && (
                    <span role="cell">
                      <button
                        type="button"
                        onClick={() => onDelete(w)}
                        title="Delete workspace"
                        aria-label={`Delete workspace ${w.name}`}
                        className="relative z-10 flex size-8 items-center justify-center rounded-control text-subtle transition-[opacity,background-color,color] hover:bg-danger-soft hover:text-danger focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100"
                      >
                        <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
                      </button>
                    </span>
                  )}
                </div>
              ))}
        </div>
      </div>
    </div>
  )
}
