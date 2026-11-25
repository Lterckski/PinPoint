# PinPoint design system: "Quiet"

Code: `frontend/src/index.css` (tokens), `frontend/src/components/` (components).
The original Figma file (dEpoBVGwqEwzOmYaKJC750) is reference only; this document wins where they differ.

## Philosophy
PinPoint is used by law offices and accounting firms to answer questions from client files. It should feel calm, clean and considered: white paper, black ink, generous space, and soft motion that confirms every action without getting in the way. The interface is monochrome on purpose, so the only color on screen is the yellow mark on a cited passage (the proof) and the occasional status. No gradients, sparkles, glass, cream-and-serif styling, or decorative labels.

The design follows the reference skills the team chose: interface-design (one focal point per view, hierarchy from weight and color before size), hallmark (no eyebrows, no dot-joined meta strings, no invented facts, real product screenshots instead of drawn mockups), hueapp (two-tier tokens), and Apple's HIG with Emil Kowalski's motion notes (ease-out, transform and opacity only, press feedback, reduced motion honoured).

## Principles
1. **The highlight is the proof.** The marker yellow (`--highlight`) appears only on cited passages (crops, the citation panel, the landing screenshots). Never on buttons, badges, headings or decoration.
2. **One filled action per view.** Each screen has at most one primary (black) button. Alternatives are secondary (bordered) or ghost.
3. **Every answer shows its work.** Answer sentences carry numbered source chips; sources sit under the answer, never behind a hover.
4. **Weight and color do the hierarchy.** One family (Geist). Titles are 600, names 500, meta 400 in a lighter text step. No uppercase or letter-spaced labels; labels are sentence case, a step smaller.
5. **Records are tables.** Clients, files and formats are ruled rows with aligned figures (tabular numbers), not grids of identical cards.
6. **Every list has four states.** Loading (skeleton shaped like the content), empty (what will appear plus the one action that fills it), error (what failed plus Try again), and content.
7. **Phones are first-class.** Every screen works from 360px: the sidebar becomes a drawer, dialogs become bottom sheets, table rows stack.
8. **Say only what is true.** No invented metrics, testimonials or logos. Privacy copy states exactly what leaves the computer (the passages sent to the configured language model).

## Color
Two tiers. Primitives are neutral ramps (`--gray-*` for light, `--night-*` for dark), the marker and status hues. Components never use them. Semantic tokens name a role; components use them through Tailwind utilities.

| Token | Utility | Light | Dark | Role |
|---|---|---|---|---|
| `--background` | `bg-bg` | #fafafa | #0c0c0d | Page canvas |
| `--surface1` | `bg-surface` | #ffffff | #141416 | Tables, cards, sidebar, inputs |
| `--surface2` | `bg-surface-muted` | #f4f4f5 | #1a1a1d | Wells, segmented controls, crop frames |
| `--surface3` | `bg-surface-hover` | #ededef | #212124 | Hover on ghost buttons |
| `--border` | `border-border` | #e8e8eb | #26262a | Rules, card edges |
| `--border-visible` | `border-border-strong` | #d9d9dd | #333337 | Dashed drop zones, emphasis |
| `--border-input` | `border-input` | #8b8b92 | #6b6b72 | Form fields (3.2:1 or better) |
| `--text1` | `text-text` | #111113 | #ededef | Headings, body |
| `--text2` | `text-muted` | #52525a | #a8a8af | Descriptions, secondary text |
| `--text3` | `text-subtle` | #67676f | #909098 | Meta, timestamps, placeholders |
| `--text4` | `text-faint` | #a8a8ae | #4f4f55 | Decorative only (not for reading) |
| `--accent` | `bg-accent`/`text-accent` | #111113 | #ededef | The action color: ink |
| `--accent-hover` | `bg-accent-hover` | #2c2c30 | #ffffff | Hover/pressed accent |
| `--accent-subtle` | `bg-accent-soft` | #f1f1f3 | #222225 | Active nav, citation chips |
| `--accent-border` | `border-accent-border` | #d9d9dd | #333337 | Outlines on active items |
| `--on-accent` | `text-on-accent` | #ffffff | #111113 | Text on accent fills |
| `--highlight` | `bg-highlight`, `.marker` | #fae492 | #554614 | Cited passages only |
| `--success` / `--success-bg` | `text-success` / `bg-success-soft` | #206b38 / #e9f8ec | #76c788 / #132416 | Ready, answered |
| `--warning` / `--warning-bg` | `text-warning` / `bg-warning-soft` | #90570c / #fff3e3 | #e4b066 / #2c1f0e | Partial reads |
| `--error` / `--error-bg` | `text-danger` / `bg-danger-soft` | #b02b27 / #fff0ee | #eb827b / #341816 | Failures, destructive actions |
| `--band` | `bg-band` | #f4f4f5 | #1a1a1d | The one tinted band (landing, privacy) |

Measured contrast (WCAG), worst case across background, surface, wells and hover rows: text1 at least 13.7:1, text2 at least 6.6:1, text3 at least 4.7:1; ink buttons 16:1 (light) and 13.7:1 (dark); status text on its own tint at least 5:1; input borders at least 3.2:1. Dark mode separates surfaces by lightness and borders; nothing casts a resting shadow.

Dark mode is the `.dark` class on `<html>`, set before first paint (index.html) from the stored choice or the system setting.

## Type
Geist for everything, Geist Mono for file paths. Document text (quoted passages, notes) is set apart by the highlight, not by a second face. Both fonts ship with the app (@fontsource).

| Token | Size / line | Weight | Use |
|---|---|---|---|
| `text-display` | 56 / 1.04, -0.04em | 500 | Landing headline |
| `text-section` | 36 / 1.12, -0.03em | 500 | Landing section titles |
| `text-h1` | 26 / 32, -0.025em | 600 | Page titles |
| `text-h2` | 18 / 26 | 600 | The asked question, figures |
| `text-h3` | 15 / 22 | 600 | Section headings |
| `text-lead` | 18 / 28 | 400 | Landing intro paragraphs |
| `text-answer` | 16 / 26 | 400 | Answer text |
| `text-body` | 14 / 22 | 400 | Default UI text |
| `text-small` | 13 / 20 | 400 | Meta, help |
| `text-label` | 12 / 16 | 500 | Labels, table heads, counts (sentence case) |
| `text-doc` | 15 / 24 | 400 | Document passages, notes |

Counts and figures use `.tabular`. Headings use `text-wrap: balance`, paragraphs `pretty`. Phones get 16px form text so iOS never zooms.

## Space, radius, elevation, motion
- 4/8px grid. Page gutters 16px (phone), 24px (sm), 40–48px (desktop); content max 1280px.
- Radius: 8px controls (`rounded-control`), 12px tables and cards (`rounded-card`), 16px panels, dialogs and the ask box (`rounded-panel`), pills for small counts (`rounded-pill`).
- Elevation: soft. Resting cards and tables get a whisper of shadow (`shadow-subtle`); `shadow-card` on hover and for the answer; `shadow-panel` for things that float (menus, dialogs, the citation panel, landing screenshots). Dark mode drops resting shadows.
- Motion (index.css, "Motion"): ease-out `cubic-bezier(0.23,1,0.32,1)`, 140 to 420ms, transform and opacity only, no bounce. Every button eases its colors on hover and dips to 97% when pressed (`.press`). Pages and workspace tabs rise 10px and fade in (`.animate-page`, keyed on the route). Lists cascade in 40ms apart (`.stagger`). Dialogs scale in from 97% (bottom sheets slide up on phones); the citation panel slides in from the right. The workspace tabs are a segmented control whose thumb slides between tabs. Landing sections rise in as they scroll into view (`.reveal`, only hidden once JavaScript is running). Animations use fill-mode `backwards` so a finished animation never traps fixed panels. `prefers-reduced-motion` turns all of it off.

## Components
| Component | Variants and rules |
|---|---|
| Button | primary, secondary, ghost, danger × sm (32), md (36), lg (44). `loading` shows a spinner and blocks clicks. Icon left, 16px, 1.75 stroke. |
| IconButton | Icon-only, required `label` (aria-label + tooltip). 32 or 36px. `tone="danger"` for delete. |
| Field / PasswordField | Visible label, 40px input on `border-input`, soft accent glow on focus, hint or error under it wired with aria-describedby. Password fields have show/hide and allow paste. |
| States | `Skeleton`, `EmptyState` (icon, title, one action), `ErrorState` (message + Try again). |
| Segmented Tabs | A workspace's Ask, Files and Memory: a gray track with a white thumb that slides to the active tab. |
| Sidebar / SidebarItem | 256px, same white as the content, one border. Workspaces, Settings, Clients list with file counts and a + for new workspace, theme toggle, user menu. Becomes a drawer below 1024px. |
| UserMenu, Avatar | Name and email; Settings, Sign out. |
| Workspace Table | The client register: industry icon, name (a link stretched over the row), industry, files (right-aligned figures), last updated. Delete appears on hover/focus with a pointer, always visible on touch. Rows stack on phones. |
| File Row | Inside one bordered list. Type icon, name (opens the viewer), meta, status tag (Ready, Reading, Queued, Failed; words first, no dots), actions. Wraps on phones. |
| Search Input (Ask box) | 16px-radius panel, accent ring on focus, Ask button (an arrow on phones). |
| Answer Card | "Answer" label, answer text with numbered source chips (filled when open), sources grid, Copy / Save / Follow-up. |
| Citation Card / Panel | Crop on top, number chip, file and page. Panel slides in from the right (full width on phones) with the marker-highlighted passage and sticky actions. |
| Dialogs | Centered on desktop, bottom sheet on phones; Escape closes, focus returns to the opener. |

## Screens
Landing (`/`, `/welcome`), Sign in / first-run setup (`/signin`), Workspaces (`/workspaces`), a workspace's Ask, Files and Memory tabs (`/w/:id/...`), Settings (`/settings`), 404. Signed-in visitors to `/` go straight to Workspaces.

## Anti-patterns
- No gradients on surfaces or buttons (the skeleton sweep is the only gradient).
- No highlight yellow outside citations, and no highlighted or colored word inside a heading.
- No eyebrows, and no uppercase or letter-spaced labels.
- No meta strings joined with middle dots; use commas, columns or line breaks.
- No grids of identical cards for records; use a ruled table.
- No second typeface for decoration.
- No hex values or primitive ramps in components.
- No hover-only controls on touch screens.
- No icon-only button without a label.
- No placeholder-as-label in forms.
- No spinners for content that has a shape; use a skeleton.
- No border-radius above 16px except pills.
- No emoji or sparkle icons; Lucide only, 1.75 stroke.
- No drawn product mockups on the landing page; use real screenshots (frontend/src/assets/landing, captured from the app in mock mode).
- No invented numbers, quotes or logos.
- No buttons that do nothing.
