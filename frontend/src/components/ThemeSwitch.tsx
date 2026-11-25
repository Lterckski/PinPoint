import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../lib/theme'

// Theme switch: a pill with a round knob that slides between light (left) and dark (right).
// The icon of the other theme sits in the empty half, so the switch says where a click takes you.
// Settings keeps the three-way control (Light, Dark, System).
export function ThemeSwitch() {
  const { resolved, setChoice } = useTheme()
  const dark = resolved === 'dark'
  const Icon = dark ? Sun : Moon
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setChoice(dark ? 'light' : 'dark')}
      className="press relative inline-flex h-8 w-[60px] shrink-0 items-center rounded-pill bg-accent p-1 text-on-accent transition-colors duration-200 hover:bg-accent-hover"
    >
      <Icon
        size={15}
        strokeWidth={2}
        aria-hidden="true"
        className={`absolute top-1/2 -translate-y-1/2 transition-[left,opacity] duration-300 ease-[var(--ease-out)] ${dark ? 'left-2' : 'left-[38px]'}`}
      />
      <span
        aria-hidden="true"
        className={`size-6 rounded-pill bg-on-accent shadow-card transition-transform duration-300 ease-[var(--ease-out)] ${dark ? 'translate-x-7' : 'translate-x-0'}`}
      />
    </button>
  )
}
