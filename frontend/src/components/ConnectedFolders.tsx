import { Folder as FolderIcon, RefreshCw, Unplug } from 'lucide-react'
import { timeAgo } from '../lib/format'
import type { Folder } from '../lib/types'
import { IconButton } from './IconButton'
import { StatusBadge } from './StatusBadge'

type ConnectedFoldersProps = {
  folders: Folder[]
  onRescan: (folder: Folder) => void
  onDisconnect: (folder: Folder) => void
}

const STATUS = { scanning: 'parsing', ready: 'ready', failed: 'failed' } as const

// Folders read in place from this computer, styled like file rows. Hidden when there are none.
export function ConnectedFolders({ folders, onRescan, onDisconnect }: ConnectedFoldersProps) {
  if (folders.length === 0) return null
  return (
    <section className="flex flex-col gap-3" aria-labelledby="folders-heading">
      <h2 id="folders-heading" className="text-h3 text-text">
        Connected folders
      </h2>
      <div className="stagger flex flex-col divide-y divide-border overflow-hidden rounded-card border border-border bg-surface shadow-subtle">
        {folders.map((folder) => (
          <div key={folder.id} className="flex flex-wrap items-center gap-x-3.5 gap-y-2 px-3 py-3 sm:flex-nowrap sm:px-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-control bg-accent-soft text-accent">
              <FolderIcon size={18} strokeWidth={1.75} aria-hidden="true" />
            </div>
            <div className="flex min-w-0 flex-1 basis-[calc(100%-6rem)] flex-col gap-0.5 sm:basis-auto">
              <p className="truncate font-mono text-small text-text" title={folder.path}>
                {folder.path}
              </p>
              {folder.status === 'failed' ? (
                <p className="text-small text-danger">{folder.error ?? "Couldn't read this folder."}</p>
              ) : (
                <p className="tabular truncate text-small text-subtle">
                  {folder.file_count} file{folder.file_count === 1 ? '' : 's'}
                  {folder.last_scanned_at ? `, scanned ${timeAgo(folder.last_scanned_at)}` : ', scanning for the first time'}
                </p>
              )}
            </div>
            <StatusBadge status={STATUS[folder.status]} label={folder.status === 'scanning' ? 'Scanning' : undefined} />
            <div className="flex shrink-0 items-center gap-1">
              <IconButton Icon={RefreshCw} label={`Rescan ${folder.path}`} size="sm" disabled={folder.status === 'scanning'} onClick={() => onRescan(folder)} />
              <IconButton Icon={Unplug} label={`Disconnect ${folder.path}`} size="sm" tone="danger" onClick={() => onDisconnect(folder)} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
