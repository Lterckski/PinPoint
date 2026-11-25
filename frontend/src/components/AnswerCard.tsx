import { Bookmark, BookmarkCheck, Check, Copy, CornerDownRight } from 'lucide-react'
import { Fragment, useState } from 'react'
import type { AnswerKind, AnswerSentence, AskResponse, Citation } from '../lib/types'
import { Button } from './Button'
import { CitationCard } from './CitationCard'

type AnswerCardProps = {
  response: AskResponse
  activeCitationId?: string | null
  onOpenCitation: (citation: Citation) => void
  onFollowUp?: () => void
  saved?: boolean
  onToggleSave?: () => void
}

export const EXTRACTIVE_LABEL = 'Showing matching passages.'

// Figma "Answer Card" (4:156): answer text with inline numbered markers, sources, actions.
export function AnswerCard({ response, activeCitationId, onOpenCitation, onFollowUp, saved = false, onToggleSave }: AnswerCardProps) {
  const [copied, setCopied] = useState(false)
  const byId = new Map(response.citations.map((c) => [c.id, c]))
  const fileCount = new Set(response.citations.filter((c) => c.kind === 'file').map((c) => c.file_id)).size
  const extractive = response.reason === EXTRACTIVE_LABEL

  const copy = async () => {
    let n = 0
    const text = response.answer
      .map((s) => {
        n = s.kind === 'numbered' ? n + 1 : 0
        return s.kind === 'bullet' ? `• ${s.text}` : s.kind === 'numbered' ? `${n}. ${s.text}` : s.text
      })
      .join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard blocked; nothing else to do.
    }
  }

  return (
    <article className="animate-rise-in flex w-full flex-col gap-5 rounded-panel border border-border bg-surface px-5 py-5 shadow-card sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-subtle">
          <span className="flex size-5 items-center justify-center rounded-pill bg-success-soft">
            <Check size={12} strokeWidth={2.5} className="text-success" aria-hidden="true" />
          </span>
          <span className="text-label text-muted">{extractive ? 'Matching passages' : 'Answer'}</span>
        </div>
        <span className="tabular text-label text-subtle">
          {fileCount === 0
            ? 'From your notes'
            : `From ${fileCount} of ${response.searched_files} file${response.searched_files === 1 ? '' : 's'}`}
        </span>
      </header>

      {extractive && (
        <p className="-mt-2 text-small text-muted">{EXTRACTIVE_LABEL} The assistant is unavailable, so these are the closest passages.</p>
      )}

      <div className={`flex flex-col gap-3 ${extractive ? 'font-serif text-doc text-text' : 'text-answer text-text'}`}>
        {groupItems(response.answer).map((group, g) => {
          const items = group.items.map(({ sentence, index }) => (
            <Fragment key={index}>
              {sentence.text}
              {sentence.sources.map((id) => {
                const c = byId.get(id)
                return c ? (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onOpenCitation(c)}
                    aria-label={`Source ${c.number}: ${c.kind === 'note' ? 'note' : `${c.file_name}, page ${c.page}`}`}
                    aria-pressed={c.id === activeCitationId}
                    className={`relative ml-1 inline-flex h-[18px] min-w-[18px] -translate-y-px items-center justify-center rounded-[5px] px-1 align-middle font-sans text-[11px] leading-none font-semibold tabular-nums transition-colors before:absolute before:-inset-[5px] before:content-[''] ${
                      c.id === activeCitationId ? 'bg-accent text-on-accent' : 'bg-accent-soft text-accent hover:bg-accent hover:text-on-accent'
                    }`}
                  >
                    {c.number}
                  </button>
                ) : null
              })}
            </Fragment>
          ))
          if (group.kind === 'heading') {
            return (
              <h3 key={g} className="pt-1 font-sans text-h3 text-text">
                {items}
              </h3>
            )
          }
          if (group.kind === 'bullet' || group.kind === 'numbered') {
            const List = group.kind === 'bullet' ? 'ul' : 'ol'
            return (
              <List key={g} className={`flex flex-col gap-1.5 pl-6 marker:text-muted ${group.kind === 'bullet' ? 'list-disc' : 'list-decimal'}`}>
                {items.map((item, i) => (
                  <li key={i} className="pl-1">
                    {item}
                  </li>
                ))}
              </List>
            )
          }
          return (
            <p key={g}>
              {items.map((item, i) => (
                <Fragment key={i}>
                  {i > 0 && ' '}
                  {item}
                </Fragment>
              ))}
            </p>
          )
        })}
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-4">
      <h3 className="text-label text-muted">Sources</h3>
      <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap">
        {response.citations.map((c) => (
          <CitationCard
            key={c.id}
            citation={c}
            onOpen={onOpenCitation}
            active={c.id === activeCitationId}
            wide={response.citations.length <= 2}
          />
        ))}
      </div>
      </div>

      <div className="-mx-2 -mb-1 flex flex-wrap gap-1">
        <Button variant="ghost" size="sm" Icon={copied ? Check : Copy} onClick={copy}>
          {copied ? 'Copied' : 'Copy answer'}
        </Button>
        {onToggleSave && (
          <Button variant="ghost" size="sm" Icon={saved ? BookmarkCheck : Bookmark} onClick={onToggleSave} aria-pressed={saved}>
            {saved ? 'Saved' : 'Save'}
          </Button>
        )}
        {onFollowUp && (
          <Button variant="ghost" size="sm" Icon={CornerDownRight} onClick={onFollowUp}>
            Ask a follow-up
          </Button>
        )}
      </div>
    </article>
  )
}

type ItemGroup = { kind: AnswerKind; items: { sentence: AnswerSentence; index: number }[] }

/** Consecutive items of the same kind form one group (a <ul>, an <ol>, or a paragraph);
 *  each heading stands alone. A numbered list restarts after any other kind of item. */
function groupItems(answer: AnswerSentence[]): ItemGroup[] {
  const groups: ItemGroup[] = []
  answer.forEach((sentence, index) => {
    const kind = sentence.kind ?? 'paragraph'
    const last = groups[groups.length - 1]
    if (last && last.kind === kind && kind !== 'heading') last.items.push({ sentence, index })
    else groups.push({ kind, items: [{ sentence, index }] })
  })
  return groups
}
