import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import appDark from '../assets/landing/app-dark.webp'
import appLight from '../assets/landing/app-light.webp'
import notFoundDark from '../assets/landing/notfound-dark.webp'
import notFoundLight from '../assets/landing/notfound-light.webp'
import sourceDark from '../assets/landing/source-dark.webp'
import sourceLight from '../assets/landing/source-light.webp'
import { PublicFooter, PublicHeader } from '../components/PublicChrome'
import { useAuth } from '../lib/auth'
import { useReveal } from '../lib/reveal'

// Landing page. It shows the real product (screenshots of the app, light and dark) and states
// only facts the code backs. Static; no tracking, no CDN.
export function LandingPage() {
  const { status } = useAuth()
  useReveal()
  const signedIn = status === 'signed-in'
  const appHref = signedIn ? '/workspaces' : '/signin'
  const appLabel = signedIn ? 'Open workspaces' : 'Sign in'

  return (
    <div className="min-h-dvh bg-bg text-text">
      <PublicHeader />
      <main id="main" className="flex flex-col gap-3 px-3 pb-3 sm:gap-4 sm:px-6 sm:pb-6">
        {/* Hero: the claim, centered, with the product answering a question below it. */}
        <section className="overflow-x-clip">
          <div className="mx-auto flex max-w-[1120px] flex-col items-center gap-12 pt-16 pb-6 text-center sm:pt-24 lg:pt-28">
            <div className="stagger flex max-w-[760px] flex-col items-center gap-6">
              <h1 className="text-[40px] leading-[1.05] font-medium tracking-[-0.035em] text-balance text-text sm:text-display">
                Every answer, cited to&nbsp;the&nbsp;page.
              </h1>
              <p className="max-w-[40ch] text-lead text-muted">
                Ask about a client's files in plain words. Each answer shows the passage it came from.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link to={appHref} className={`${BUTTON} bg-accent text-on-accent hover:bg-accent-hover`}>
                  {appLabel}
                </Link>
                <a href="#sources" className={`${BUTTON} border border-border bg-surface text-text hover:border-border-strong`}>
                  How sources work
                </a>
              </div>
              <p className="text-small text-subtle">For law offices, accounting firms and other practices that live in documents.</p>
            </div>
            <Shot
              light={appLight}
              dark={appDark}
              width={1680}
              height={1080}
              alt="PinPoint answering “When is the Santos response due?” with two numbered sources: a motion and a court order."
              className="animate-page w-full [animation-delay:240ms]"
              priority
            />
          </div>
        </section>

        {/* Sources */}
        <section id="sources" className="scroll-mt-24">
          <div className={`reveal ${TILE} grid items-center gap-10 p-6 sm:p-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16 lg:p-16`}>
            <div className="flex min-w-0 flex-col gap-8">
              <div className="flex flex-col gap-4">
                <h2 className={H2}>Each sentence points to its source.</h2>
                <p className="max-w-[52ch] text-lead text-muted">
                  Click a number in an answer to see where it came from. Nothing is hidden behind a hover.
                </p>
              </div>
              <dl className="flex flex-col gap-2">
                <Fact term="The page itself">A crop of the original page, scans and phone photos included.</Fact>
                <Fact term="The passage">Highlighted, ready to copy into a memo or a reply.</Fact>
                <Fact term="The file and page">One click opens the document at that page.</Fact>
              </dl>
            </div>
            <Shot
              light={sourceLight}
              dark={sourceDark}
              width={1120}
              height={870}
              alt="A source opened from an answer: the crop from page 2 of Santos_Motion_Extension.pdf with the cited words highlighted."
              className="mx-auto w-full max-w-[480px]"
            />
          </div>
        </section>

        {/* Formats */}
        <section id="formats" className="scroll-mt-24">
          <div className={`reveal ${TILE} flex flex-col gap-8 p-6 sm:p-10 lg:p-16`}>
            <div className="flex flex-col gap-3">
              <h2 className={`max-w-[22ch] ${H2}`}>Reads the files a practice actually keeps.</h2>
              <p className="text-lead text-muted">Upload files of up to 50 MB each, or connect a folder on this computer.</p>
            </div>
            <ul className="stagger grid gap-2 sm:grid-cols-2 sm:gap-3">
              {FORMATS.map(([format, examples, how]) => (
                <li key={format} className="flex flex-col gap-1 rounded-card bg-surface-muted px-5 py-4">
                  <span className="text-body font-medium text-text">{format}</span>
                  <span className="text-small text-muted">{examples}</span>
                  <span className="text-small text-subtle">Read as: {how.charAt(0).toLowerCase() + how.slice(1)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Not found */}
        <section id="not-found" className="scroll-mt-24">
          <div className={`reveal ${TILE} grid items-center gap-10 p-6 sm:p-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:p-16`}>
            <div className="flex min-w-0 flex-col gap-3">
              <h2 className={H2}>When the files don't say, PinPoint says so.</h2>
              <p className="text-lead text-muted">
                An answer appears only if every sentence is backed by a passage. Otherwise you see “Not found” and the closest
                passages, never a confident guess.
              </p>
            </div>
            <Shot
              light={notFoundLight}
              dark={notFoundDark}
              width={1520}
              height={376}
              alt="PinPoint replying “Not found in these files” instead of guessing, with options to upload more files or rephrase."
              className="w-full"
            />
          </div>
        </section>

        {/* Privacy: the one dark tile. */}
        <section id="privacy" className="scroll-mt-24">
          <div className="reveal mx-auto grid max-w-[1120px] gap-10 rounded-panel bg-band p-6 text-on-band sm:p-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-16 lg:p-16">
            <h2 className="max-w-[16ch] text-[28px] leading-[1.15] font-medium tracking-[-0.03em] text-balance sm:text-section">
              Client files stay on the firm's computer.
            </h2>
            <dl className="grid gap-3 sm:grid-cols-2">
              {PRIVACY.map(([term, text]) => (
                <div key={term} className="flex flex-col gap-1.5 rounded-card border border-band-border p-5">
                  <dt className="text-body font-semibold">{term}</dt>
                  <dd className="text-body text-on-band-muted">{text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Close on the one action. */}
        <section>
          <div className={`reveal ${TILE} flex flex-col items-center gap-6 px-6 py-16 text-center sm:py-20`}>
            <div className="flex flex-col gap-3">
              <h2 className={H2}>Start with one client's folder.</h2>
              <p className="text-lead text-muted">Create a workspace, add the files, and ask your first question.</p>
            </div>
            <Link to={appHref} className={`${BUTTON} bg-accent text-on-accent hover:bg-accent-hover`}>
              {appLabel}
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}

const BUTTON =
  'press inline-flex h-12 items-center rounded-control px-6 text-body font-medium whitespace-nowrap transition-colors'

/** A section on the landing page: one large rounded white tile on the canvas. */
const TILE = 'mx-auto w-full max-w-[1120px] rounded-panel border border-border bg-surface'

const H2 = 'text-[28px] leading-[1.15] font-medium tracking-[-0.03em] text-balance text-text sm:text-section'

const FORMATS: [string, string, string][] = [
  ['PDF', 'Pleadings, contracts, financial statements', 'Text and tables, page by page'],
  ['Scans and photos (PDF, JPG, PNG, WebP)', 'Signed copies, receipts photographed on a phone', 'Text recognition (OCR)'],
  ['Word (DOCX)', 'Memos, letters, intake forms', 'Headings, paragraphs and tables'],
  ['Excel (XLSX) and CSV', 'Ledgers, schedules, invoice lists', 'Each sheet as a table'],
  ['PowerPoint (PPTX)', 'Board and client presentations', 'Slide by slide'],
  ['Text and Markdown', 'Notes and exports', 'As written'],
]

const PRIVACY: [string, string][] = [
  ['Stored on this computer', "Files, notes and question history live in PinPoint's data folder. Files in a connected folder are read, never changed."],
  ['Only what an answer needs', 'The passages behind an answer go to the language model you configure. With a local model, nothing leaves the computer.'],
  ['Signed-in access', 'Every workspace needs a signed-in account. Passwords are stored as hashes and sessions expire.'],
  ['No tracking', 'No analytics, ads or third-party scripts. Fonts and icons ship with the app.'],
]

function Fact({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 rounded-card bg-surface-muted px-5 py-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6">
      <dt className="text-body font-semibold text-text">{term}</dt>
      <dd className="text-body text-muted">{children}</dd>
    </div>
  )
}

/** A real screenshot of the app, in the viewer's theme. */
function Shot({
  light,
  dark,
  width,
  height,
  alt,
  className = '',
  priority = false,
}: {
  light: string
  dark: string
  width: number
  height: number
  alt: string
  className?: string
  priority?: boolean
}) {
  const img = 'block h-auto w-full'
  return (
    <figure className={`min-w-0 overflow-hidden rounded-card border border-border bg-surface shadow-panel ${className}`}>
      <img src={light} alt={alt} width={width} height={height} className={`${img} dark:hidden`} fetchPriority={priority ? 'high' : undefined} loading={priority ? 'eager' : 'lazy'} />
      <img src={dark} alt={alt} width={width} height={height} className={`${img} hidden dark:block`} loading="lazy" />
    </figure>
  )
}
