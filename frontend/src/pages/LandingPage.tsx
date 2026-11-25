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
      <main id="main">
        {/* Hero: the claim on the left, the product answering a question on the right. */}
        <section className="overflow-x-clip border-b border-border">
          <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-4 pt-14 pb-16 sm:px-8 lg:min-h-[min(640px,calc(100dvh-64px))] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14 lg:py-16">
            <div className="stagger flex min-w-0 flex-col items-start gap-6">
              <h1 className="text-[40px] leading-[1.05] font-semibold tracking-[-0.03em] [overflow-wrap:break-word] text-text sm:text-display">
                Every answer, cited to&nbsp;the&nbsp;page.
              </h1>
              <p className="max-w-[34ch] text-lead text-muted">
                Ask about a client's files in plain words. Each answer shows the passage it came from.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link to={appHref} className={`${BUTTON} bg-accent text-on-accent hover:bg-accent-hover`}>
                  {appLabel}
                </Link>
                <a href="#sources" className={`${BUTTON} border border-border-strong bg-surface text-text hover:bg-surface-muted`}>
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
              className="animate-page [animation-delay:200ms] lg:w-[min(820px,58vw)]"
              priority
            />
          </div>
        </section>

        {/* Sources */}
        <section id="sources" className="scroll-mt-20 border-b border-border bg-surface">
          <div className="reveal mx-auto grid max-w-[1200px] items-center gap-12 px-4 py-20 sm:px-8 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-20 lg:py-28">
            <div className="flex min-w-0 flex-col gap-8">
              <div className="flex flex-col gap-4">
                <h2 className="text-[28px] leading-[1.15] font-semibold tracking-[-0.025em] text-text sm:text-section">
                  Each sentence points to its source.
                </h2>
                <p className="max-w-[52ch] text-lead text-muted">
                  Click a number in an answer to see where it came from. Nothing is hidden behind a hover.
                </p>
              </div>
              <dl className="border-t border-text">
                <Fact term="The page itself">A crop of the original page, scans and phone photos included.</Fact>
                <Fact term="The passage">Highlighted, ready to copy into a memo or a reply.</Fact>
                <Fact term="The file and page">One click opens the document at that page.</Fact>
              </dl>
            </div>
            <Shot
              light={sourceLight}
              dark={sourceDark}
              width={1118}
              height={870}
              alt="A source opened from an answer: the crop from page 2 of Santos_Motion_Extension.pdf with the cited words highlighted."
              className="mx-auto w-full max-w-[480px]"
            />
          </div>
        </section>

        {/* Formats */}
        <section id="formats" className="scroll-mt-20 border-b border-border">
          <div className="reveal mx-auto flex max-w-[1200px] flex-col gap-10 px-4 py-20 sm:px-8 lg:py-28">
            <div className="flex flex-col gap-4">
              <h2 className="max-w-[22ch] text-[28px] leading-[1.15] font-semibold tracking-[-0.025em] text-text sm:text-section">
                Reads the files a practice actually keeps.
              </h2>
              <p className="max-w-[60ch] text-lead text-muted">
                Upload files of up to 50 MB each, or connect a folder on this computer instead.
              </p>
            </div>
            <div className="overflow-hidden rounded-card border border-border bg-surface">
              <table className="w-full border-collapse text-left">
                <thead className="hidden bg-surface-muted md:table-header-group">
                  <tr className="text-label text-muted">
                    <th scope="col" className="w-[30%] px-5 py-2.5 font-medium">Format</th>
                    <th scope="col" className="w-[38%] px-5 py-2.5 font-medium">Typical files</th>
                    <th scope="col" className="px-5 py-2.5 font-medium">How it is read</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {FORMATS.map(([format, examples, how]) => (
                    <tr key={format} className="flex flex-col gap-0.5 px-4 py-3.5 md:table-row md:p-0">
                      <th scope="row" className="text-body font-medium text-text md:px-5 md:py-3.5">
                        {format}
                      </th>
                      <td className="text-body text-muted md:px-5 md:py-3.5">{examples}</td>
                      <td className="text-small text-subtle md:px-5 md:py-3.5 md:text-body md:text-muted">{how}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Not found */}
        <section id="not-found" className="scroll-mt-20 border-b border-border bg-surface">
          <div className="reveal mx-auto grid max-w-[1200px] items-center gap-12 px-4 py-20 sm:px-8 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-20 lg:py-28">
            <Shot
              light={notFoundLight}
              dark={notFoundDark}
              width={1568}
              height={368}
              alt="PinPoint replying “Not found in these files” instead of guessing, with options to upload more files or rephrase."
              className="order-2 w-full lg:order-1"
            />
            <div className="order-1 flex min-w-0 flex-col gap-4 lg:order-2">
              <h2 className="text-[28px] leading-[1.15] font-semibold tracking-[-0.025em] text-text sm:text-section">
                When the files don't say, PinPoint says so.
              </h2>
              <p className="max-w-[46ch] text-lead text-muted">
                An answer appears only if every sentence is backed by a passage. Otherwise you see “Not found” and the closest
                passages, never a confident guess.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy: the one inverted band. */}
        <section id="privacy" className="scroll-mt-20 bg-band text-on-band">
          <div className="reveal mx-auto grid max-w-[1200px] gap-12 px-4 py-20 sm:px-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-20 lg:py-28">
            <h2 className="max-w-[16ch] text-[28px] leading-[1.15] font-semibold tracking-[-0.025em] sm:text-section">
              Client files stay on the firm's computer.
            </h2>
            <dl className="grid gap-x-12 sm:grid-cols-2">
              {PRIVACY.map(([term, text]) => (
                <div key={term} className="flex flex-col gap-1.5 border-t border-band-border py-5">
                  <dt className="text-body font-semibold">{term}</dt>
                  <dd className="text-body text-on-band-muted">{text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Close on the one action. */}
        <section className="border-b border-border">
          <div className="reveal mx-auto flex max-w-[1200px] flex-col items-start gap-6 px-4 py-20 sm:px-8 md:flex-row md:items-center md:justify-between lg:py-24">
            <div className="flex flex-col gap-2">
              <h2 className="text-[28px] leading-[1.15] font-semibold tracking-[-0.025em] text-text sm:text-section">
                Start with one client's folder.
              </h2>
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
  'press inline-flex h-11 items-center rounded-control px-5 text-body font-medium whitespace-nowrap transition-colors'

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
    <div className="grid gap-1 border-b border-border py-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-6">
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
    <figure className={`min-w-0 overflow-hidden rounded-panel border border-border bg-surface shadow-panel ${className}`}>
      <img src={light} alt={alt} width={width} height={height} className={`${img} dark:hidden`} fetchPriority={priority ? 'high' : undefined} loading={priority ? 'eager' : 'lazy'} />
      <img src={dark} alt={alt} width={width} height={height} className={`${img} hidden dark:block`} loading="lazy" />
    </figure>
  )
}
