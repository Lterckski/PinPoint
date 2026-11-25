import { ArrowUp, Loader2, Search } from 'lucide-react'
import { forwardRef, type FormEvent } from 'react'
import { Button } from './Button'

type SearchInputProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  placeholder?: string
  busy?: boolean
}

// Figma "Search Input" (3:198): search icon, question text, Ask button.
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { value, onChange, onSubmit, placeholder = 'Ask a question about these files…', busy = false },
  ref,
) {
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (value.trim() && !busy) onSubmit(value.trim())
  }
  return (
    <form
      onSubmit={submit}
      role="search"
      className="flex w-full items-center gap-3 rounded-panel border border-input bg-surface py-2 pr-2 pl-4 shadow-card transition-[border-color,box-shadow] duration-150 focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/15"
    >
      <Search size={20} strokeWidth={1.75} className="shrink-0 text-subtle" aria-hidden="true" />
      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Question"
        enterKeyHint="search"
        maxLength={1000}
        className="h-10 min-w-0 flex-1 bg-transparent text-[15px] text-text placeholder:text-subtle focus:outline-none focus-visible:outline-none"
      />
      <Button type="submit" disabled={!value.trim() || busy} aria-label="Ask" className="size-10 !px-0 sm:w-auto sm:!px-4">
        {busy ? <Loader2 size={16} strokeWidth={2} className="animate-spin" aria-hidden="true" /> : <ArrowUp size={16} strokeWidth={2.25} className="sm:hidden" aria-hidden="true" />}
        <span className="hidden sm:inline">Ask</span>
      </Button>
    </form>
  )
})
