import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, Outlet, useLocation, useParams } from 'react-router-dom'
import { SegmentedTabs } from '../components/SegmentedTabs'
import { BookMarked, ChevronRight, FileStack, FolderX, MessageSquareText } from 'lucide-react'
import { EmptyState, Skeleton } from '../components/States'
import type { WorkspaceOutlet } from '../lib/workspaceOutlet'
import { setLastWorkspaceId, useWorkspaces } from '../lib/workspaces'

const TABS = [
  { to: 'ask', label: 'Ask', Icon: MessageSquareText },
  { to: 'files', label: 'Files', Icon: FileStack },
  { to: 'memory', label: 'Memory', Icon: BookMarked },
] as const

// Workspace header from Figma 04 Files (6:528): breadcrumb, title, industry pill, tabs.
export function WorkspaceLayout() {
  const { id = '' } = useParams()
  const { pathname } = useLocation()
  const { workspaces, loading } = useWorkspaces()
  const ws = workspaces.find((w) => w.id === id)
  const [actions, setActions] = useState<ReactNode>(null)
  const outlet = useMemo<WorkspaceOutlet>(() => ({ workspace: ws, setActions }), [ws])
  useEffect(() => {
    if (ws) setLastWorkspaceId(ws.id)
  }, [ws])

  if (!loading && !ws) {
    return (
      <EmptyState
        Icon={FolderX}
        title="Workspace not found"
        actions={
          <Link
            to="/workspaces"
            className="press inline-flex h-9 items-center rounded-control bg-accent px-3.5 text-body font-medium text-on-accent hover:bg-accent-hover"
          >
            Back to workspaces
          </Link>
        }
      >
        It may have been deleted, or the link is out of date.
      </EmptyState>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-5">
        <nav aria-label="Breadcrumb" className="hidden items-center gap-1.5 text-label sm:flex">
          <Link to="/workspaces" className="text-subtle transition-colors hover:text-text">
            Workspaces
          </Link>
          <ChevronRight size={12} strokeWidth={2} className="text-faint" aria-hidden="true" />
          <span className="truncate text-muted" aria-current="page">
            {ws?.name ?? '…'}
          </span>
        </nav>

        <div className="flex min-h-10 flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {ws ? (
              <>
                <h1 className="truncate text-h1 text-text">{ws.name}</h1>
                <span className="hidden shrink-0 rounded-pill border border-border px-2 py-[2px] text-label text-muted xs:inline">
                  {ws.industry}
                </span>
              </>
            ) : (
              <Skeleton className="h-8 w-56" />
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        </div>

        <SegmentedTabs
          label="Workspace sections"
          tabs={TABS.map((tab) => ({
            ...tab,
            badge:
              tab.to === 'files' && ws ? <span className="tabular text-label text-subtle">{ws.file_count}</span> : undefined,
          }))}
        />
      </header>

      {/* Keyed by tab, so each tab rises in when you switch to it (and starts fresh per client). */}
      <div key={pathname} className="animate-page">
        <Outlet context={outlet} />
      </div>
    </div>
  )
}
