import type { LucideIcon } from 'lucide-react'
import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

export type SegmentedTab = { to: string; label: string; Icon: LucideIcon; badge?: ReactNode }

// Segmented control for a page's sections. A white thumb slides under the active tab; it moves
// with transform only (translateX + scaleX from a 100px base), so it never triggers layout.
export function SegmentedTabs({ tabs, label }: { tabs: readonly SegmentedTab[]; label: string }) {
  const { pathname } = useLocation()
  const nav = useRef<HTMLElement>(null)
  const thumb = useRef<HTMLSpanElement>(null)
  const placed = useRef(false)

  useLayoutEffect(() => {
    const place = () => {
      const active = nav.current?.querySelector<HTMLElement>('a[aria-current="page"]')
      const el = thumb.current
      if (!el) return
      if (!active) {
        el.style.opacity = '0'
        return
      }
      el.style.opacity = '1'
      el.style.transform = `translateX(${active.offsetLeft}px) scaleX(${active.offsetWidth / 100})`
      if (!placed.current) {
        placed.current = true
        // Turn transitions on only after the first placement, so the thumb doesn't fly in on load.
        requestAnimationFrame(() => el.classList.add('transition-transform', 'duration-300'))
      }
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [pathname])

  return (
    <nav
      ref={nav}
      aria-label={label}
      className="no-scrollbar relative flex w-fit max-w-full gap-0.5 overflow-x-auto rounded-[10px] bg-surface-muted p-1"
    >
      <span
        ref={thumb}
        aria-hidden="true"
        className="pointer-events-none absolute top-1 bottom-1 left-0 w-[100px] origin-left rounded-[7px] bg-surface opacity-0 shadow-subtle ease-out dark:bg-surface-hover"
      />
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `press relative flex h-8 shrink-0 items-center gap-2 rounded-[7px] px-3 text-body font-medium ${
              isActive ? 'text-text' : 'text-muted hover:text-text'
            }`
          }
        >
          <tab.Icon size={15} strokeWidth={1.75} aria-hidden="true" />
          {tab.label}
          {tab.badge}
        </NavLink>
      ))}
    </nav>
  )
}
