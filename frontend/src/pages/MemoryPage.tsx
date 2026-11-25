import { Bookmark, History, StickyNote, Trash2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { IconButton } from '../components/IconButton'
import { EmptyState, ErrorState, Skeleton } from '../components/States'
import { StatusBadge } from '../components/StatusBadge'
import { api } from '../lib/api'
import { dayLabel, timeAgo } from '../lib/format'
import type { HistoryItem, Note } from '../lib/types'

const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)

// Memory tab: notes the client's answers can cite, saved answers, and question history.
export function MemoryPage() {
  const { id = '' } = useParams()
  return (
    <div className="flex max-w-[820px] flex-col gap-12">
      <NotesSection ws={id} />
      <HistorySections ws={id} />
    </div>
  )
}

function SectionHeader({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-h3 text-text">{title}</h2>
      <p className="text-small text-muted">{hint}</p>
    </div>
  )
}

function NotesSection({ ws }: { ws: string }) {
  const [notes, setNotes] = useState<Note[] | null>(null)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    api.listNotes(ws).then(
      (list) => alive && setNotes(list),
      (e: unknown) => alive && setError(e instanceof Error ? e.message : 'Could not load notes.'),
    )
    return () => {
      alive = false
    }
  }, [ws])

  const add = async (e?: FormEvent) => {
    e?.preventDefault()
    if (!text.trim() || saving) return
    setSaving(true)
    setError(null)
    try {
      const note = await api.addNote(ws, text.trim())
      setNotes((list) => [note, ...(list ?? [])])
      setText('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the note.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (note: Note) => {
    setNotes((list) => list?.filter((n) => n.id !== note.id) ?? null)
    try {
      await api.deleteNote(ws, note.id)
    } catch (err) {
      setNotes((list) => [note, ...(list ?? [])])
      setError(err instanceof Error ? err.message : 'Could not delete the note.')
    }
  }

  return (
    <section className="flex flex-col gap-4" aria-label="Notes">
      <SectionHeader title="Notes" hint="Facts you save here are searched and cited in answers, just like your documents." />

      <form onSubmit={add} className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-subtle">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void add()
          }}
          rows={3}
          maxLength={4000}
          placeholder="Remember something about this client…"
          aria-label="New note"
          className="w-full resize-y rounded-control border border-input bg-surface px-3 py-2.5 text-body text-text transition-[border-color,box-shadow] placeholder:text-subtle focus:border-accent focus:ring-3 focus:ring-accent/20 focus:outline-none focus-visible:outline-none"
        />
        <div className="flex items-center justify-between gap-3">
          <span className="hidden text-label text-subtle sm:inline">
            <kbd className="font-sans">{IS_MAC ? '⌘' : 'Ctrl'}</kbd> + <kbd className="font-sans">Enter</kbd> to save
          </span>
          <Button type="submit" disabled={!text.trim()} loading={saving} className="ml-auto">
            Add note
          </Button>
        </div>
      </form>

      {error && <ErrorState title="Notes" message={error} />}

      {notes === null && !error ? (
        <Skeleton className="h-[64px] rounded-card" />
      ) : notes && notes.length === 0 ? (
        <EmptyState Icon={StickyNote} title="No notes yet" compact>
          Add things like preferences, deadlines you were told by phone, or who to contact.
        </EmptyState>
      ) : (
        <ul className="stagger flex flex-col divide-y divide-border overflow-hidden rounded-card border border-border bg-surface shadow-subtle">
          {notes?.map((note) => (
            <li key={note.id} className="flex items-start gap-3 px-4 py-3.5">
              <StickyNote size={16} strokeWidth={1.75} className="mt-1 shrink-0 text-subtle" aria-hidden="true" />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="font-serif text-doc whitespace-pre-line text-text">{note.text}</p>
                <span className="text-label text-subtle">{dayLabel(note.created_at)}</span>
              </div>
              <IconButton Icon={Trash2} label="Delete note" tone="danger" size="sm" onClick={() => void remove(note)} className="text-subtle" />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function HistorySections({ ws }: { ws: string }) {
  const [items, setItems] = useState<HistoryItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    api.listHistory(ws).then(
      (list) => alive && setItems(list),
      (e: unknown) => alive && setError(e instanceof Error ? e.message : 'Could not load history.'),
    )
    return () => {
      alive = false
    }
  }, [ws])

  const saved = items?.filter((i) => i.saved) ?? []
  const byDay = new Map<string, HistoryItem[]>()
  for (const item of items ?? []) {
    const day = dayLabel(item.created_at)
    byDay.set(day, [...(byDay.get(day) ?? []), item])
  }

  return (
    <>
      <section className="flex flex-col gap-4" aria-label="Saved answers">
        <SectionHeader title="Saved answers" hint="Every answered question is saved here automatically. Open one to see it with its sources; use Save on the Ask tab to remove one." />
        {error ? (
          <ErrorState title="Couldn't load history" message={error} />
        ) : items === null ? (
          <Skeleton className="h-[64px] rounded-card" />
        ) : saved.length === 0 ? (
          <EmptyState Icon={Bookmark} title="No saved answers yet" compact>
            Answers to questions you ask on the Ask tab are saved here automatically.
          </EmptyState>
        ) : (
          <HistoryList ws={ws} items={saved} />
        )}
      </section>

      <section className="flex flex-col gap-4" aria-label="History">
        <SectionHeader title="History" hint="Every question asked in this workspace, newest first." />
        {error ? null : items === null ? (
          <Skeleton className="h-[64px] rounded-card" />
        ) : items.length === 0 ? (
          <EmptyState Icon={History} title="No questions yet" compact>
            Questions you ask on the Ask tab are kept here.
          </EmptyState>
        ) : (
          [...byDay.entries()].map(([day, list]) => (
            <div key={day} className="flex flex-col gap-2">
              <h3 className="text-label text-muted">{day}</h3>
              <HistoryList ws={ws} items={list} />
            </div>
          ))
        )}
      </section>
    </>
  )
}

function HistoryList({ ws, items }: { ws: string; items: HistoryItem[] }) {
  return (
    <ul className="stagger flex flex-col divide-y divide-border overflow-hidden rounded-card border border-border bg-surface shadow-subtle">
      {items.map((item) => (
        <li key={item.id}>
          <Link to={`/w/${ws}/ask?h=${item.id}`} className="flex flex-col gap-2 px-4 py-3.5 transition-colors hover:bg-surface-muted sm:flex-row sm:items-start sm:gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="truncate text-body font-medium text-text">{item.question}</p>
              <p className="line-clamp-2 text-small text-muted">{item.answer_preview}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2.5">
              <span className="text-label text-subtle">{timeAgo(item.created_at)}</span>
              {item.saved && <Bookmark size={15} strokeWidth={1.75} className="shrink-0 fill-current text-accent" aria-label="Saved" />}
              <StatusBadge
                status={item.status === 'answered' ? 'ready' : 'queued'}
                label={item.status === 'answered' ? 'Answered' : 'Not found'}
              />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
