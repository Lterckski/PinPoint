import type { FileStatus } from '../lib/types'

const STYLES: Record<FileStatus, { label: string; tag: string }> = {
  ready: { label: 'Ready', tag: 'bg-success-soft text-success' },
  parsing: { label: 'Reading', tag: 'bg-accent-soft text-accent' },
  queued: { label: 'Queued', tag: 'border border-border-strong text-muted' },
  failed: { label: 'Failed', tag: 'bg-danger-soft text-danger' },
}

// Status tag: Ready, Reading, Queued, Failed. The words carry the state; color only confirms it.
export function StatusBadge({ status, label }: { status: FileStatus; label?: string }) {
  const s = STYLES[status]
  return <span className={`inline-flex h-6 shrink-0 items-center rounded-pill px-2.5 text-label ${s.tag}`}>{label ?? s.label}</span>
}
