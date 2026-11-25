import { Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Avatar } from './Avatar'
import { IconButton } from './IconButton'
import { Logo } from './Logo'
import { Sidebar } from './Sidebar'
import { WorkspacesProvider } from './WorkspacesProvider'

// App shell. Desktop (lg, 1024px+): the sidebar sits on the canvas and the page floats beside it
// in one large rounded panel. Smaller screens: a top bar whose menu button opens the same sidebar
// as a drawer, and the page sits straight on the canvas.
export function AppShell() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  // The drawer belongs to the page it was opened on, so any navigation (back button included) closes it.
  const [drawerPath, setDrawerPath] = useState<string | null>(null)
  const drawerOpen = drawerPath === pathname
  const setDrawerOpen = (open: boolean) => setDrawerPath(open ? pathname : null)
  const menuButton = useRef<HTMLButtonElement>(null)
  const drawer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!drawerOpen) return
    const opener = menuButton.current
    drawer.current?.querySelector<HTMLElement>('a, button')?.focus()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerPath(null)
      if (e.key === 'Tab' && drawer.current) {
        const items = [...drawer.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')]
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      opener?.focus()
    }
  }, [drawerOpen])

  return (
    <WorkspacesProvider>
      <a
        href="#main"
        className="fixed top-2 left-2 z-50 -translate-y-20 rounded-control bg-accent px-3 py-2 text-body font-medium text-on-accent focus:translate-y-0"
      >
        Skip to content
      </a>
      <div className="flex min-h-dvh bg-bg">
        <div className="sticky top-0 hidden h-dvh lg:block">
          <Sidebar />
        </div>

        <div className="flex min-w-0 flex-1 flex-col lg:py-2 lg:pr-2">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-2 bg-bg/85 px-2 backdrop-blur-md lg:hidden">
            <IconButton
              ref={menuButton}
              Icon={Menu}
              label="Open menu"
              aria-expanded={drawerOpen}
              aria-controls="app-drawer"
              onClick={() => setDrawerOpen(true)}
            />
            <Link to="/workspaces" aria-label="PinPoint home" className="rounded-control">
              <Logo size={24} />
            </Link>
            <div className="flex-1" />
            {user && (
              <Link to="/settings" aria-label="Settings" className="rounded-pill p-1">
                <Avatar name={user.name} size={30} />
              </Link>
            )}
          </header>

          <main
            id="main"
            tabIndex={-1}
            className="min-w-0 flex-1 focus:outline-none lg:rounded-panel lg:border lg:border-border lg:bg-surface lg:shadow-subtle"
          >
            {/* Each page arrives with a short rise; a workspace's tabs animate inside it instead. */}
            <div key={pageKey(pathname)} className="animate-page mx-auto w-full max-w-[1120px] px-4 pt-4 pb-16 sm:px-6 lg:px-12 lg:pt-12">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" id="app-drawer">
          <div className="animate-fade-in absolute inset-0 bg-scrim" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
          <div ref={drawer} role="dialog" aria-modal="true" aria-label="Menu" className="animate-slide-in-left relative h-full w-[min(18rem,85vw)] rounded-r-panel bg-bg shadow-panel">
            <Sidebar onNavigate={() => setDrawerOpen(false)} className="w-full" />
            <IconButton Icon={X} label="Close menu" onClick={() => setDrawerOpen(false)} className="absolute top-3.5 right-3" />
          </div>
        </div>
      )}
    </WorkspacesProvider>
  )
}

/** One key per page: /w/:id/... counts as one page so switching tabs keeps the header still. */
function pageKey(pathname: string): string {
  const m = pathname.match(/^\/w\/[^/]+/)
  return m ? m[0] : pathname
}
