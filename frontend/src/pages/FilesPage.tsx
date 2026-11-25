import { AlertTriangle, CheckCircle2, ChevronDown, FileUp, FolderInput, FolderUp, Upload } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type DragEvent } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { ConnectedFolders } from '../components/ConnectedFolders'
import { ConnectFolderDialog } from '../components/ConnectFolderDialog'
import { DocumentViewer, type ViewerFile } from '../components/DocumentViewer'
import { FileRow } from '../components/FileRow'
import { EmptyState, ErrorState, Skeleton } from '../components/States'
import { api } from '../lib/api'
import { ACCEPT, canPickDirectory, filterFolderInput, isSupported, pickDirectoryFiles } from '../lib/folders'
import type { FileItem, Folder, KnowledgeStats } from '../lib/types'
import { timeAgo } from '../lib/format'
import { useWorkspaceOutlet } from '../lib/workspaceOutlet'
import { useWorkspaces } from '../lib/workspaces'

const BATCH_SIZE = 10
const POLL_MS = 2000

// Figma 04 Files (6:435).
export function FilesPage() {
  const { id = '' } = useParams()
  const { setActions } = useWorkspaceOutlet()
  const { refresh: refreshWorkspaces } = useWorkspaces()
  const [files, setFiles] = useState<FileItem[] | null>(null)
  const [folders, setFolders] = useState<Folder[]>([])
  const [stats, setStats] = useState<KnowledgeStats | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [viewing, setViewing] = useState<ViewerFile | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [uploadMessage, setUploadMessage] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [lastDone, setLastDone] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const folderInput = useRef<HTMLInputElement>(null)
  const lastSignature = useRef('')

  const loadFolders = useCallback(
    () =>
      api.listFolders(id).then(
        (list) => setFolders(list),
        () => undefined, // The file list shows load errors; folders just stay as they were.
      ),
    [id],
  )

  const load = useCallback(
    () =>
      api.listFiles(id).then(
        (list) => {
          setFiles(list)
          setLoadError(null)
          // Keep the tab count and sidebar fresh when files appear or finish.
          const signature = list.map((f) => `${f.id}:${f.status}`).join(',')
          if (signature !== lastSignature.current) {
            if (lastSignature.current) void refreshWorkspaces()
            lastSignature.current = signature
            api.knowledge(id).then(setStats, () => undefined)
          }
        },
        (e: unknown) => setLoadError(e instanceof Error ? e.message : 'Could not load files.'),
      ),
    [id, refreshWorkspaces],
  )

  useEffect(() => {
    void load()
    void loadFolders()
  }, [load, loadFolders])

  const busy =
    (files?.some((f) => f.status === 'queued' || f.status === 'parsing') ?? false) ||
    folders.some((f) => f.status === 'scanning')
  useEffect(() => {
    if (!busy) return
    const timer = setInterval(() => {
      void loadFolders()
      void load()
    }, POLL_MS)
    return () => clearInterval(timer)
  }, [busy, load, loadFolders])

  const connectFolder = async (path: string) => {
    const folder = await api.connectFolder(id, path)
    setFolders((list) => [...list, folder])
  }

  const rescan = async (folder: Folder) => {
    try {
      const updated = await api.rescanFolder(id, folder.id)
      setFolders((list) => list.map((f) => (f.id === folder.id ? updated : f)))
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Rescan failed.')
    }
  }

  const disconnect = async (folder: Folder) => {
    try {
      await api.disconnectFolder(id, folder.id)
      setFolders((list) => list.filter((f) => f.id !== folder.id))
      await load()
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Disconnect failed.')
    }
  }

  const deleteFile = async (file: FileItem) => {
    try {
      await api.deleteFile(id, file.id)
      setUploadError(null)
      setLastDone(`Deleted ${file.name}.`)
      await load()
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Delete failed.')
    }
  }

  const cancelUpload = async (file: FileItem) => {
    try {
      await api.deleteFile(id, file.id)
      setUploadError(null)
      setLastDone(`Cancelled ${file.name}.`)
      await load()
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Could not cancel the upload.')
    }
  }

  const upload = useCallback(
    async (picked: File[]) => {
      const supported = picked.filter((f) => isSupported(f.name))
      const skipped = picked.length - supported.length
      setUploadError(null)
      if (supported.length === 0) {
        setUploadError(picked.length ? 'None of those files are a supported type.' : null)
        return
      }
      try {
        for (let i = 0; i < supported.length; i += BATCH_SIZE) {
          const batch = supported.slice(i, i + BATCH_SIZE)
          setUploadMessage(
            supported.length > BATCH_SIZE
              ? `Uploading ${i + batch.length} of ${supported.length} files…`
              : `Uploading ${supported.length} file${supported.length === 1 ? '' : 's'}…`,
          )
          await api.uploadFiles(id, batch)
        }
        if (skipped) setUploadError(`Skipped ${skipped} unsupported file${skipped === 1 ? '' : 's'}.`)
        setLastDone(`Added ${supported.length} file${supported.length === 1 ? '' : 's'}. PinPoint is reading ${supported.length === 1 ? 'it' : 'them'} now.`)
      } catch (e) {
        setUploadError(e instanceof Error ? e.message : 'Upload failed.')
      } finally {
        setUploadMessage(null)
        await load()
      }
    },
    [id, load],
  )

  const uploadFolder = useCallback(async () => {
    if (canPickDirectory()) {
      const picked = await pickDirectoryFiles()
      if (picked) await upload(picked)
    } else {
      folderInput.current?.click()
    }
  }, [upload])

  useEffect(() => {
    setActions(
      <AddFilesMenu
        onFiles={() => fileInput.current?.click()}
        onFolder={() => void uploadFolder()}
        onConnect={() => setConnecting(true)}
      />,
    )
    return () => setActions(null)
  }, [setActions, uploadFolder])

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    void upload(Array.from(e.dataTransfer.files))
  }

  return (
    <div className="flex flex-col gap-5">
      {stats && <KnowledgeStrip stats={stats} />}
      <input
        ref={fileInput}
        type="file"
        multiple
        accept={ACCEPT}
        hidden
        onChange={(e) => {
          if (e.target.files) void upload(Array.from(e.target.files))
          e.target.value = ''
        }}
      />
      <input
        ref={folderInput}
        type="file"
        hidden
        // webkitdirectory isn't in React's input props, so set it as an attribute.
        {...{ webkitdirectory: '' }}
        onChange={(e) => {
          if (e.target.files) void upload(filterFolderInput(e.target.files))
          e.target.value = ''
        }}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex flex-col items-center gap-3 rounded-card border-2 border-dashed px-4 py-7 text-center transition-colors duration-150 sm:flex-row sm:gap-4 sm:px-6 sm:py-5 sm:text-left ${
          dragging ? 'border-accent bg-accent-soft' : 'border-border-strong bg-surface'
        }`}
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-card bg-accent-soft text-accent">
          <Upload size={20} strokeWidth={1.75} aria-hidden="true" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          {uploadMessage ? (
            <p className="text-body font-medium text-text" aria-live="polite">
              {uploadMessage}
            </p>
          ) : (
            <p className="text-body font-medium text-text">
              {dragging ? 'Drop to add these files' : (
                <>
                  Drag files here, or{' '}
                  <button type="button" onClick={() => fileInput.current?.click()} className="rounded-[4px] text-accent underline decoration-accent-border underline-offset-2 hover:text-accent-hover">
                    browse
                  </button>
                </>
              )}
            </p>
          )}
          <p className="text-small text-subtle">Scans, photos, PDF, Word, Excel, PowerPoint, CSV and text, up to 50 MB each</p>
        </div>
      </div>

      {uploadError && (
        <p role="alert" className="flex items-start gap-2 rounded-control border border-danger/25 bg-danger-soft px-3 py-2 text-small text-danger">
          <AlertTriangle size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" aria-hidden="true" />
          {uploadError}
        </p>
      )}
      {!uploadError && !uploadMessage && lastDone && (
        <p role="status" className="flex items-center gap-2 text-small text-success">
          <CheckCircle2 size={16} strokeWidth={1.75} aria-hidden="true" />
          {lastDone}
        </p>
      )}

      {loadError && !files ? (
        <ErrorState title="Couldn't load files" message={loadError} onRetry={() => void load()} />
      ) : files === null ? (
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-card border border-border bg-surface" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3.5 px-4 py-3.5">
              <Skeleton className="size-9" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-2.5 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
        <ConnectedFolders folders={folders} onRescan={(f) => void rescan(f)} onDisconnect={(f) => void disconnect(f)} />
        <section className="flex flex-col gap-3" aria-labelledby="files-heading">
          <div className="flex items-center justify-between">
            <h2 id="files-heading" className="tabular text-h3 text-text">
              {files.length} file{files.length === 1 ? '' : 's'}
            </h2>
            {files.length > 1 && <span className="text-label text-subtle">Newest first</span>}
          </div>
          {files.length === 0 ? (
            <EmptyState
              Icon={FileUp}
              title="No files yet"
              actions={
                <Button Icon={FileUp} onClick={() => fileInput.current?.click()}>
                  Upload files
                </Button>
              }
            >
              Add this client's PDFs, scans, photos or spreadsheets. PinPoint reads them here, and then you can ask questions.
            </EmptyState>
          ) : (
            <div className="flex flex-col divide-y divide-border overflow-hidden rounded-card border border-border bg-surface shadow-subtle">
              {files.map((file) => (
                <FileRow
                  key={file.id}
                  file={file}
                  onOpen={(f) => setViewing({ id: f.id, name: f.name, type: f.type })}
                  onDelete={deleteFile}
                  onCancel={cancelUpload}
                />
              ))}
            </div>
          )}
        </section>
        </>
      )}

      {connecting && <ConnectFolderDialog onConnect={connectFolder} onClose={() => setConnecting(false)} />}
      {viewing && <DocumentViewer ws={id} file={viewing} onClose={() => setViewing(null)} />}
    </div>
  )
}

function AddFilesMenu({ onFiles, onFolder, onConnect }: { onFiles: () => void; onFolder: () => void; onConnect: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    ref.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  const choose = (action: () => void) => () => {
    setOpen(false)
    action()
  }

  return (
    <div ref={ref} className="relative">
      <Button Icon={FileUp} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        Add files
        <ChevronDown size={16} strokeWidth={1.75} className={`-mr-1 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </Button>
      {open && (
        <div
          role="menu"
          className="animate-rise-in absolute right-0 z-20 mt-1.5 flex w-60 flex-col rounded-card border border-border bg-surface p-1 shadow-panel"
        >
          <MenuItem Icon={FileUp} label="Upload files" onClick={choose(onFiles)} />
          <MenuItem Icon={FolderUp} label="Upload a folder" onClick={choose(onFolder)} />
          <MenuItem Icon={FolderInput} label="Connect a local folder" onClick={choose(onConnect)} />
        </div>
      )}
    </div>
  )
}

function MenuItem({ Icon, label, onClick }: { Icon: typeof FileUp; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex h-9 items-center gap-2.5 rounded-[6px] px-2.5 text-left text-body text-text hover:bg-surface-hover focus-visible:bg-surface-hover"
    >
      <Icon size={16} strokeWidth={1.75} className="text-muted" />
      {label}
    </button>
  )
}

/** The workspace's index at a glance, as a row of figures (GET /knowledge). */
function KnowledgeStrip({ stats }: { stats: KnowledgeStats }) {
  const figures: [number, string][] = [
    [stats.files, stats.files === 1 ? 'File' : 'Files'],
    [stats.pages, stats.pages === 1 ? 'Page' : 'Pages'],
    [stats.passages, 'Passages indexed'],
    [stats.notes, stats.notes === 1 ? 'Note' : 'Notes'],
  ]
  if (stats.folders > 0) figures.push([stats.folders, stats.folders === 1 ? 'Connected folder' : 'Connected folders'])
  return (
    <div className="flex flex-col gap-2">
      <dl className="grid grid-cols-2 overflow-hidden rounded-card border border-border bg-surface sm:flex" aria-label="Knowledge stats">
        {figures.map(([n, label]) => (
          <div key={label} className="flex flex-1 flex-col gap-0.5 border-border px-4 py-3 sm:not-last:border-r max-sm:odd:border-r max-sm:[&:nth-child(n+3)]:border-t">
            <dt className="order-2 text-label text-subtle">{label}</dt>
            <dd className="tabular order-1 text-h2 text-text">{n.toLocaleString()}</dd>
          </div>
        ))}
      </dl>
      {stats.last_indexed_at && <p className="text-small text-subtle">Index updated {timeAgo(stats.last_indexed_at)}</p>}
    </div>
  )
}
