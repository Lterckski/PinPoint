import { Clock, FolderPlus, MessageSquareText, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { DeleteWorkspaceDialog } from '../components/DeleteWorkspaceDialog'
import { NewWorkspaceDialog } from '../components/NewWorkspaceDialog'
import { EmptyState, ErrorState, Skeleton } from '../components/States'
import { WorkspaceTable } from '../components/WorkspaceTable'
import { api } from '../lib/api'
import { timeAgo } from '../lib/format'
import type { CreateWorkspaceRequest, HistoryItem, Workspace } from '../lib/types'
import { useAuth } from '../lib/auth'
import { useWorkspaces } from '../lib/workspaces'

type RecentRow = HistoryItem & { workspaceId: string; workspaceName: string }

// Workspaces: the client register (one row per workspace), then recent questions across all of them.
export function WorkspacesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const { workspaces, loading, error, refresh } = useWorkspaces()
  const [creatingState, setCreatingState] = useState(false)
  const [retrying, setRetrying] = useState(false)
  // ?new=1 (the sidebar's + button) opens the New workspace dialog.
  const creating = creatingState || params.get('new') === '1'
  const setCreating = (open: boolean) => {
    setCreatingState(open)
    if (!open && params.has('new')) setParams({}, { replace: true })
  }
  const [deleting, setDeleting] = useState<Workspace | null>(null)
  const [recent, setRecent] = useState<RecentRow[] | null>(null)
  const totalFiles = workspaces.reduce((n, w) => n + w.file_count, 0)

  useEffect(() => {
    if (!workspaces.length) return
    let alive = true
    Promise.all(
      workspaces.map((w) =>
        api.listHistory(w.id).then(
          (items) => items.map((i) => ({ ...i, workspaceId: w.id, workspaceName: w.name })),
          () => [] as RecentRow[],
        ),
      ),
    ).then((lists) => {
      if (!alive) return
      const seen = new Set<string>()
      const rows = lists
        .flat()
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .filter((r) => {
          const key = `${r.workspaceId}:${r.question.toLowerCase()}`
          return !seen.has(key) && seen.add(key)
        })
      setRecent(rows.slice(0, 5))
    })
    return () => {
      alive = false
    }
  }, [workspaces])

  const create = async (body: CreateWorkspaceRequest) => {
    const ws = await api.createWorkspace(body)
    await refresh()
    navigate(`/w/${ws.id}/files`)
  }

  const remove = async (ws: Workspace) => {
    await api.deleteWorkspace(ws.id)
    await refresh()
    setDeleting(null)
  }

  const firstName = user?.name.split(' ')[0]
  const retry = async () => {
    setRetrying(true)
    await refresh()
    setRetrying(false)
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-h1 text-text">
            {greeting()}
            {firstName ? `, ${firstName}` : ''}
          </h1>
          <p className="tabular text-body text-muted">
            {workspaces.length} client workspace{workspaces.length === 1 ? '' : 's'}, {totalFiles} file{totalFiles === 1 ? '' : 's'} in all
          </p>
        </div>
        <Button Icon={Plus} onClick={() => setCreating(true)} className="self-start sm:self-auto">
          New workspace
        </Button>
      </header>

      {error && !workspaces.length ? (
        <ErrorState title="Couldn't load your workspaces" message={error} onRetry={() => void retry()} retrying={retrying} />
      ) : !loading && workspaces.length === 0 ? (
        <EmptyState
          Icon={FolderPlus}
          title="Create your first workspace"
          actions={
            <Button Icon={Plus} onClick={() => setCreating(true)}>
              New workspace
            </Button>
          }
        >
          Make one workspace per client, add their files, then ask questions across all of them.
        </EmptyState>
      ) : (
        <WorkspaceTable workspaces={workspaces} loading={loading} onDelete={setDeleting} />
      )}

      {workspaces.length > 0 && (
        <section className="flex flex-col gap-3" aria-labelledby="recent-heading">
          <h2 id="recent-heading" className="text-h3 text-text">
            Recent questions
          </h2>
          {recent === null ? (
            <Skeleton className="h-[104px] rounded-card" />
          ) : recent.length === 0 ? (
            <EmptyState Icon={MessageSquareText} title="No questions yet" compact>
              Questions you ask in any workspace show up here, so you can reopen an answer in one click.
            </EmptyState>
          ) : (
            <ul className="stagger flex flex-col divide-y divide-border overflow-hidden rounded-card border border-border bg-surface shadow-subtle">
              {recent.map((r) => (
                <li key={r.id}>
                  <Link
                    to={`/w/${r.workspaceId}/ask?h=${r.id}`}
                    className="flex flex-col gap-1 px-5 py-3.5 transition-colors hover:bg-surface-muted sm:flex-row sm:items-center sm:gap-3"
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-3">
                      <Clock size={16} strokeWidth={1.75} className="shrink-0 text-subtle" aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate text-body text-text">{r.question}</span>
                    </span>
                    <span className="flex shrink-0 gap-3 pl-7 text-label text-subtle sm:pl-0">
                      <span className="max-w-[160px] truncate">{r.workspaceName}</span>
                      <span>{timeAgo(r.created_at)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {creating && <NewWorkspaceDialog onCreate={create} onClose={() => setCreating(false)} />}
      {deleting && <DeleteWorkspaceDialog workspace={deleting} onDelete={remove} onClose={() => setDeleting(null)} />}
    </div>
  )
}

function greeting(): string {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}
