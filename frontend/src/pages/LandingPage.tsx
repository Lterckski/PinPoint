import {
  ArrowRight,
  BookMarked,
  Check,
  CircleSlash,
  FileSearch,
  FileText,
  FolderSync,
  HardDrive,
  Images,
  LockKeyhole,
  MessageSquareText,
  Quote,
  ScanSearch,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PublicFooter, PublicHeader } from '../components/PublicChrome'
import { useAuth } from '../lib/auth'

// Landing page: what PinPoint does, how, and why it can be trusted. Static; no tracking, no CDN.
export function LandingPage() {
  const { status } = useAuth()
  const appHref = status === 'signed-in' ? '/workspaces' : '/signin'
  const appLabel = status === 'signed-in' ? 'Open your workspaces' : 'Get started'

  return (
    <div className="min-h-dvh bg-bg text-text">
      <PublicHeader />
      <main id="main">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <RuledPaper />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pt-14 pb-16 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-24 lg:pb-24">
            <div className="animate-rise-in flex flex-col items-start gap-6">
              <p className="inline-flex items-center gap-2 rounded-pill border border-border bg-surface px-3 py-1 text-label text-muted shadow-subtle">
                <span className="size-1.5 rounded-pill bg-success" aria-hidden="true" />
                Runs on your computer. Client files never leave the office.
              </p>
              <h1 className="font-serif text-[44px] leading-[1.02] tracking-[-0.02em] text-text sm:text-[56px] lg:text-display">
                Ask your files anything. <span className="marker italic">See exactly where</span> the answer came from.
              </h1>
              <p className="max-w-xl text-lead text-muted">
                PinPoint reads the scans, phone photos, PDFs and spreadsheets in a client's folder, answers plain-language
                questions in seconds, and shows a snapshot of the exact passage behind every sentence.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to={appHref}
                  className="inline-flex h-11 items-center gap-2 rounded-control bg-accent px-5 text-body font-medium text-on-accent shadow-card transition-colors hover:bg-accent-hover"
                >
                  {appLabel}
                  <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
                </Link>
                <a
                  href="#how"
                  className="inline-flex h-11 items-center rounded-control border border-border-strong bg-surface px-5 text-body font-medium text-text shadow-subtle transition-colors hover:bg-surface-muted"
                >
                  See how it works
                </a>
              </div>
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-small text-muted">
                {['Scans and photos (OCR)', 'Every sentence cited', 'Says "not found" instead of guessing'].map((t) => (
                  <li key={t} className="flex items-center gap-1.5">
                    <Check size={14} strokeWidth={2.25} className="text-success" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <HeroDemo />
          </div>
        </section>

        {/* Who it's for */}
        <section className="border-b border-border bg-surface">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p className="text-eyebrow text-subtle uppercase">Built for document-heavy offices</p>
            <ul className="flex flex-wrap gap-x-8 gap-y-2 text-body font-medium text-muted">
              <li>Law offices</li>
              <li>Accounting firms</li>
              <li>Real estate agencies</li>
              <li>Insurance teams</li>
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-20 border-b border-border">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
            <SectionHeading eyebrow="How it works" title="From a folder of files to a cited answer in three steps." />
            <ol className="mt-12 grid gap-5 md:grid-cols-3">
              <Step
                n={1}
                Icon={FolderSync}
                title="Add a client's files"
                body="Drop in PDFs, scans, phone photos, Word, Excel and PowerPoint files, or connect a folder on this computer. PinPoint reads every page, tables included."
              />
              <Step
                n={2}
                Icon={MessageSquareText}
                title="Ask in your own words"
                body={`"When is the Santos response due?" No keywords or exact phrasing needed, and follow-up questions keep the context.`}
              />
              <Step
                n={3}
                Icon={ScanSearch}
                title="Check the proof"
                body="Each sentence carries a numbered source. Click it to see the highlighted crop from the original page, the file name and the page number."
              />
            </ol>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 border-b border-border bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
            <SectionHeading eyebrow="What you get" title="Answers you can check, not answers you have to trust." />
            <div className="mt-12 grid gap-px overflow-hidden rounded-panel border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
              <Feature Icon={Images} title="Reads what's actually in the folder">
                Scanned contracts, receipts photographed on a phone, 100-page financial statements. Text is read on this
                computer, page by page.
              </Feature>
              <Feature Icon={Quote} title="Every sentence has a source">
                Answers are built only from passages in your files. A sentence without a source is never shown.
              </Feature>
              <Feature Icon={CircleSlash} title="Says when it doesn't know">
                If the files don't contain the answer, you get "Not found in these files," the closest passages, and a
                better question to try.
              </Feature>
              <Feature Icon={BookMarked} title="Remembers what matters">
                Save notes like "The client prefers email updates." Notes are searched and cited like documents, and
                every question stays in history.
              </Feature>
              <Feature Icon={FileSearch} title="Opens the exact page">
                Jump from a citation to the full document with the passage outlined, then ask questions about that one
                file.
              </Feature>
              <Feature Icon={HardDrive} title="One workspace per client">
                Each client's files, notes and history stay in their own workspace, so answers never mix matters.
              </Feature>
            </div>
          </div>
        </section>

        {/* Honesty */}
        <section className="border-b border-border">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-28">
            <div className="flex flex-col gap-5">
              <SectionHeading eyebrow="Honest by design" title="When the answer isn't there, PinPoint says so." align="left" />
              <p className="text-lead text-muted">
                A confident wrong answer is worse than none. PinPoint checks every sentence against the passages it cites
                and refuses to fill gaps, so you know when to look elsewhere.
              </p>
            </div>
            <div className="rounded-panel border border-border bg-surface p-6 shadow-card">
              <p className="text-small font-medium text-text">When is the filing deadline for the Villanueva case?</p>
              <div className="mt-4 flex flex-col gap-3 rounded-card border border-border bg-bg p-5">
                <p className="flex items-center gap-2 text-eyebrow text-subtle uppercase">
                  <CircleSlash size={14} strokeWidth={1.75} aria-hidden="true" />
                  Not found in these files
                </p>
                <p className="text-answer text-text">None of the 6 files in Reyes &amp; Partners mention a Villanueva case.</p>
                <p className="inline-flex items-center gap-2 self-start rounded-control bg-accent-soft px-3 py-1.5 text-small font-medium text-accent">
                  Did you mean the Santos case?
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section id="security" className="scroll-mt-20 border-b border-border bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
              <div className="flex flex-col gap-5">
                <div className="flex size-11 items-center justify-center rounded-card bg-accent-soft text-accent">
                  <LockKeyhole size={20} strokeWidth={1.75} aria-hidden="true" />
                </div>
                <SectionHeading eyebrow="Privacy" title="Confidential files stay confidential." align="left" />
              </div>
              <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                <Point title="Local by default">
                  Parsing, search and the language model can all run on this computer. Nothing is uploaded to a cloud
                  service unless you configure one.
                </Point>
                <Point title="Your originals are untouched">
                  Connected folders are read in place. PinPoint never edits, moves or deletes your files.
                </Point>
                <Point title="Signed-in access only">
                  Every workspace, file and answer requires a signed-in account. Passwords are hashed; sessions expire.
                </Point>
                <Point title="No tracking">
                  No analytics, ads or third-party scripts. Fonts and icons ship with the app.
                </Point>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 border-b border-border">
          <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8 lg:py-28">
            <SectionHeading eyebrow="Questions" title="Good to know" />
            <div className="mt-10 divide-y divide-border rounded-card border border-border bg-surface">
              <Faq q="What kinds of files can PinPoint read?">
                PDFs (including scanned and encrypted ones you can open), photos and scans (PNG, JPG, WebP), Word, Excel,
                PowerPoint, CSV, Markdown and plain text. Files up to 50 MB each.
              </Faq>
              <Faq q="Does it need the internet?">
                No. With a local model, PinPoint works fully offline. You can also point it at a hosted model if your
                office prefers.
              </Faq>
              <Faq q="Can it do calculations, like totals across receipts?">
                Yes. Totals and other numbers are computed from the extracted values, not estimated by the language model,
                and each value cites its source.
              </Faq>
              <Faq q="What happens to a file I delete?">
                Its pages, passages and crops are removed from the workspace, and answers can no longer cite it. Files in a
                connected folder stay on your computer.
              </Faq>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden">
          <RuledPaper />
          <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-5 py-20 text-center sm:px-8 lg:py-28">
            <h2 className="font-serif text-[36px] leading-[1.1] tracking-[-0.015em] text-text sm:text-section">
              Stop opening file after file.
            </h2>
            <p className="max-w-lg text-lead text-muted">Create a workspace for a client, drop in their folder, and ask your first question.</p>
            <Link
              to={appHref}
              className="inline-flex h-11 items-center gap-2 rounded-control bg-accent px-5 text-body font-medium text-on-accent shadow-card transition-colors hover:bg-accent-hover"
            >
              {appLabel}
              <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}

/** Faint ruled lines and a margin rule, like a legal pad. Decorative. */
function RuledPaper() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-60 [background-image:repeating-linear-gradient(to_bottom,transparent_0,transparent_31px,var(--border)_31px,var(--border)_32px)] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
    />
  )
}

function SectionHeading({ eyebrow, title, align = 'center' }: { eyebrow: string; title: string; align?: 'center' | 'left' }) {
  return (
    <div className={`flex flex-col gap-3 ${align === 'center' ? 'items-center text-center' : 'items-start'}`}>
      <p className="text-eyebrow text-accent uppercase">{eyebrow}</p>
      <h2 className="max-w-2xl font-serif text-[34px] leading-[1.1] tracking-[-0.015em] text-text sm:text-section">{title}</h2>
    </div>
  )
}

function Step({ n, Icon, title, body }: { n: number; Icon: LucideIcon; title: string; body: string }) {
  return (
    <li className="flex flex-col gap-4 rounded-panel border border-border bg-surface p-6 shadow-subtle">
      <div className="flex items-center justify-between">
        <div className="flex size-10 items-center justify-center rounded-card bg-accent-soft text-accent">
          <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
        </div>
        <span className="font-serif text-[32px] leading-none text-faint" aria-hidden="true">
          0{n}
        </span>
      </div>
      <h3 className="text-h2 text-text">{title}</h3>
      <p className="text-body text-muted">{body}</p>
    </li>
  )
}

function Feature({ Icon, title, children }: { Icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 bg-surface p-6 sm:p-7">
      <Icon size={20} strokeWidth={1.75} className="text-accent" aria-hidden="true" />
      <h3 className="text-h3 text-text">{title}</h3>
      <p className="text-body text-muted">{children}</p>
    </div>
  )
}

function Point({ title, children }: { title: string; children: ReactNode }) {
  return (
    <li className="flex flex-col gap-1.5 border-l-2 border-accent-border pl-4">
      <h3 className="text-h3 text-text">{title}</h3>
      <p className="text-body text-muted">{children}</p>
    </li>
  )
}

function Faq({ q, children }: { q: string; children: ReactNode }) {
  return (
    <details className="group px-5 py-1 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex items-center justify-between gap-4 py-4 text-h3 text-text">
        {q}
        <span
          aria-hidden="true"
          className="flex size-6 shrink-0 items-center justify-center rounded-pill border border-border text-muted transition-transform duration-200 group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <p className="pb-5 text-body text-muted">{children}</p>
    </details>
  )
}

/** A static rendering of the Ask screen with demo content, so the hero shows the real product. */
function HeroDemo() {
  return (
    <div className="animate-rise-in relative mx-auto w-full max-w-[520px] [animation-delay:80ms] lg:mx-0" aria-label="Example: a question and its cited answer" role="img">
      <div className="rounded-panel border border-border bg-surface p-2 shadow-panel">
        <div className="flex items-center gap-1.5 px-2 pt-1 pb-2.5" aria-hidden="true">
          <span className="size-2.5 rounded-pill bg-surface-hover" />
          <span className="size-2.5 rounded-pill bg-surface-hover" />
          <span className="size-2.5 rounded-pill bg-surface-hover" />
          <span className="ml-2 text-label text-subtle">Reyes &amp; Partners · Ask</span>
        </div>
        <div className="flex flex-col gap-3 rounded-card bg-bg p-4 sm:p-5">
          <div className="flex items-center gap-2.5 rounded-card border border-border bg-surface px-3.5 py-2.5 shadow-subtle">
            <MessageSquareText size={16} strokeWidth={1.75} className="shrink-0 text-subtle" />
            <span className="truncate text-small text-text">When is the Santos response due?</span>
          </div>
          <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-subtle">
            <p className="flex items-center gap-1.5 text-eyebrow text-subtle uppercase">
              <Check size={13} strokeWidth={2.25} className="text-success" />
              Answer · from 2 of 6 files
            </p>
            <p className="text-[15px] leading-[24px] text-text">
              The response for the Santos case is due on <strong className="font-semibold">March 14, 2026</strong>
              <Cite n={1} active />. This includes the 15-day extension the court granted on February 27
              <Cite n={2} />.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <MiniSource n={1} name="Santos_Motion.pdf" page={3} active />
              <MiniSource n={2} name="Court_Order.jpg" page={1} />
            </div>
          </div>
        </div>
      </div>
      {/* The proof, floating out of the card like a pinned note. */}
      <div className="absolute -right-2 -bottom-10 hidden w-[300px] rotate-[1.5deg] rounded-card border border-border bg-surface p-3 shadow-panel sm:block lg:-right-8">
        <p className="flex items-center gap-1.5 pb-2 text-label text-muted">
          <span className="flex size-[18px] items-center justify-center rounded-pill bg-accent text-[10px] font-semibold text-on-accent">1</span>
          Santos_Motion.pdf · Page 3
        </p>
        <p className="rounded-control bg-surface-muted p-3 font-serif text-[15px] leading-[22px] text-muted">
          …the Court grants petitioner fifteen (15) days, <span className="marker text-text">until 14 March 2026</span>, within
          which to file the required response.
        </p>
      </div>
    </div>
  )
}

function Cite({ n, active = false }: { n: number; active?: boolean }) {
  return (
    <span
      className={`ml-0.5 inline-flex h-[18px] min-w-[18px] translate-y-[-1px] items-center justify-center rounded-[5px] px-1 align-middle text-[11px] font-semibold ${
        active ? 'bg-accent text-on-accent' : 'bg-accent-soft text-accent'
      }`}
    >
      {n}
    </span>
  )
}

function MiniSource({ n, name, page, active = false }: { n: number; name: string; page: number; active?: boolean }) {
  return (
    <div className={`flex flex-col gap-2 rounded-control border p-2 ${active ? 'border-accent' : 'border-border'}`}>
      <div className="flex h-12 flex-col justify-center gap-1.5 rounded-[6px] bg-surface-muted px-2">
        <span className="h-1.5 w-4/5 rounded-pill bg-border-strong" />
        <span className="h-1.5 w-3/5 rounded-pill bg-highlight-strong" />
        <span className="h-1.5 w-2/3 rounded-pill bg-border-strong" />
      </div>
      <p className="flex items-center gap-1.5 text-[11px] text-muted">
        <span className="font-semibold text-accent">{n}</span>
        <FileText size={11} strokeWidth={1.75} className="shrink-0" />
        <span className="truncate">{name}</span>
        <span className="ml-auto shrink-0">p. {page}</span>
      </p>
    </div>
  )
}
