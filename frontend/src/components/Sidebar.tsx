import { Folder, LayoutGrid, Plus, Settings } from 'lucide-react'
import { Link, useLocation, useMatch } from 'react-router-dom'
import { useWorkspaces } from '../lib/workspaces'
import { Logo } from './Logo'
import { SidebarItem } from './SidebarItem'
import { Skeleton } from './States'
import { ThemeSwitch } from './ThemeSwitch'
import { UserMenu } from './UserMenu'

type SidebarProps = {
  /** Called after a link is chosen (the phone drawer closes). */
  onNavigate?: () => void
  className?: string
}

// Sidebar: brand, overview and settings, the client list, then theme and the signed-in person.
export function Sidebar({ onNavigate, className = '' }: SidebarProps) {
  const { pathname } = useLocation()
  const match = useMatch('/w/:id/:tab')
  const { workspaces, loading } = useWorkspaces()
  const currentId = match?.params.id
  const tab = match?.params.tab

  return (
    <aside
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('a')) onNavigate?.()
      }}
      className={`flex h-full w-60 shrink-0 flex-col bg-bg ${className}`}
    >
      <div className="flex h-[72px] shrink-0 items-center px-6">
        <Link to="/workspaces" className="rounded-control" aria-label="PinPoint home">
          <Logo />
        </Link>
      </div>

      <nav className="flex flex-col gap-0.5 px-3" aria-label="Main">
        <SidebarItem to="/workspaces" label="Workspaces" Icon={LayoutGrid} active={pathname === '/workspaces'} />
        <SidebarItem to="/settings" label="Settings" Icon={Settings} active={pathname === '/settings'} />
      </nav>

      <nav className="mt-6 flex min-h-0 flex-1 flex-col" aria-labelledby="sidebar-clients">
        <div className="flex items-center justify-between pr-3 pb-1.5 pl-6">
          <h2 id="sidebar-clients" className="text-label text-subtle">
            Clients
          </h2>
          <Link
            to="/workspaces?new=1"
            aria-label="New workspace"
            title="New workspace"
            className="flex size-7 items-center justify-center rounded-control text-subtle transition-colors hover:bg-surface-hover hover:text-text"
          >
            <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </div>
        <div className="flex min-h-0 flex-col gap-0.5 overflow-y-auto overscroll-contain px-3 pb-3">
          {loading && !workspaces.length
            ? [0, 1, 2].map((i) => <Skeleton key={i} className="mx-2.5 my-2 h-5" />)
            : workspaces.map((ws) => (
                <SidebarItem
                  key={ws.id}
                  to={`/w/${ws.id}/${tab ?? 'ask'}`}
                  label={ws.name}
                  Icon={Folder}
                  active={ws.id === currentId}
                  count={ws.file_count}
                />
              ))}
          {!loading && !workspaces.length && (
            <p className="px-2.5 py-2 text-small text-subtle">No clients yet.</p>
          )}
        </div>
      </nav>

      <div className="flex shrink-0 flex-col gap-2 p-3">
        <div className="flex items-center justify-between px-3">
          <span className="text-small text-muted">Dark mode</span>
          <ThemeSwitch />
        </div>
        <UserMenu />
      </div>
    </aside>
  )
}
