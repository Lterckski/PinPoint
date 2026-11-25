import { Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Avatar } from './Avatar'
import { IconButton } from './IconButton'
import { Logo } from './Logo'
import { Sidebar } from './Sidebar'
import { WorkspacesProvider } from './WorkspacesProvider'

// App shell. Desktop (lg, 1024px+): a 256px sidebar beside the page. Smaller screens: a top bar
// whose menu button opens the same sidebar as a drawer.
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

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-surface/90 px-2 backdrop-blur-md lg:hidden">
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

          <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1280px] min-w-0 flex-1 px-4 pt-5 pb-16 focus:outline-none sm:px-6 lg:px-10 lg:pt-8 xl:px-12">
            <Outlet />
          </main>
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" id="app-drawer">
          <div className="animate-fade-in absolute inset-0 bg-scrim" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
          <div ref={drawer} role="dialog" aria-modal="true" aria-label="Menu" className="animate-slide-in-left relative h-full w-[min(18rem,85vw)] shadow-panel">
            <Sidebar onNavigate={() => setDrawerOpen(false)} className="w-full" />
            <IconButton Icon={X} label="Close menu" onClick={() => setDrawerOpen(false)} className="absolute top-3.5 right-3" />
          </div>
        </div>
      )}
    </WorkspacesProvider>
  )
}
