import { initials } from '../lib/auth'

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      className="flex shrink-0 items-center justify-center rounded-pill bg-accent-soft font-semibold text-accent ring-1 ring-accent-border ring-inset"
    >
      {initials(name)}
    </span>
  )
}
