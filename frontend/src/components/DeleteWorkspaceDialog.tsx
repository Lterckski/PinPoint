import { Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Workspace } from '../lib/types'
import { Button } from './Button'

type DeleteWorkspaceDialogProps = {
  workspace: Workspace
  onDelete: (workspace: Workspace) => Promise<void>
  onClose: () => void
}

// Not in Figma: a confirm modal in the style of NewWorkspaceDialog, on the scrim token.
export function DeleteWorkspaceDialog({ workspace, onDelete, onClose }: DeleteWorkspaceDialogProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !busy && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, busy])

  const confirm = async () => {
    setBusy(true)
    setError(null)
    try {
      await onDelete(workspace)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete the workspace.')
      setBusy(false)
    }
  }

  const files = `${workspace.file_count} file${workspace.file_count === 1 ? '' : 's'}`

  return (
    <div className="animate-fade-in fixed inset-0 z-40 flex items-end justify-center bg-scrim p-0 sm:items-center sm:p-4" onMouseDown={() => !busy && onClose()}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-workspace-title"
        aria-describedby="delete-workspace-body"
        onMouseDown={(e) => e.stopPropagation()}
        className="flex w-full max-w-[440px] flex-col gap-5 overflow-y-auto overscroll-contain rounded-t-panel border border-border bg-surface p-5 shadow-panel max-h-[92dvh] animate-rise-in sm:rounded-panel sm:p-6"
      >
        <header className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-control bg-danger-soft text-danger">
              <Trash2 size={20} strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <h2 id="delete-workspace-title" className="text-h2 text-text">
                Delete workspace?
              </h2>
              <p className="truncate text-small text-muted">{workspace.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="flex size-8 items-center justify-center rounded-control text-muted hover:bg-surface-muted hover:text-text"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </header>

        <p id="delete-workspace-body" className="text-body text-text">
          This removes its {files}, notes, and question history from PinPoint. Files in connected folders stay on your
          computer. This can't be undone.
        </p>

        {error && (
          <p role="alert" className="text-small text-danger">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button ref={cancelRef} variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            Icon={Trash2}
            onClick={() => void confirm()}
            disabled={busy}
            className="border-danger text-danger hover:bg-danger-soft"
          >
            {busy ? 'Deleting…' : 'Delete workspace'}
          </Button>
        </div>
      </div>
    </div>
  )
}
