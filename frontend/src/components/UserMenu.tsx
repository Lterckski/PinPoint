import { ChevronsUpDown, LogOut, Settings } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Avatar } from './Avatar'

// The signed-in person, with Settings and Sign out. Opens upward from the sidebar's foot.
export function UserMenu() {
  const { user, authEnabled, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    ref.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
    const onPointer = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const items = [...(ref.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])]
        const i = items.indexOf(document.activeElement as HTMLElement)
        items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!user) return null

  const item = 'flex h-10 w-full items-center gap-2.5 rounded-box px-3 text-left text-body text-text hover:bg-surface-hover focus-visible:bg-surface-hover'

  return (
    <div ref={ref} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 rounded-box p-1.5 text-left transition-colors hover:bg-surface-hover"
      >
        <Avatar name={user.name} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-body font-medium text-text">{user.name}</span>
          {user.email && <span className="truncate text-label text-subtle">{user.email}</span>}
        </span>
        <ChevronsUpDown size={16} strokeWidth={1.75} className="shrink-0 text-subtle" aria-hidden="true" />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Account"
          className="animate-dialog origin-bottom absolute right-0 bottom-full left-0 z-30 mb-1.5 flex flex-col rounded-card border border-border bg-surface p-1 shadow-panel"
        >
          <button
            type="button"
            role="menuitem"
            className={item}
            onClick={() => {
              setOpen(false)
              navigate('/settings')
            }}
          >
            <Settings size={16} strokeWidth={1.75} className="text-muted" aria-hidden="true" />
            Settings
          </button>
          {authEnabled && (
            <button
              type="button"
              role="menuitem"
              className={item}
              onClick={() => {
                setOpen(false)
                void signOut().then(() => navigate('/signin', { replace: true }))
              }}
            >
              <LogOut size={16} strokeWidth={1.75} className="text-muted" aria-hidden="true" />
              Sign out
            </button>
          )}
        </div>
      )}
    </div>
  )
}
