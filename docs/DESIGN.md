# PinPoint design system: "Chambers"

Code: `frontend/src/index.css` (tokens), `frontend/src/components/` (components).
The original Figma file (dEpoBVGwqEwzOmYaKJC750) is reference only; this document wins where they differ.

## Philosophy
PinPoint is used by law offices and accounting firms to answer questions from client files. It should look like the tools those firms already trust: a document system or a bank's back office. Quiet slate neutrals, near-black text, one navy for actions, and plain ruled tables. The only bright thing on screen is the yellow mark on a cited passage, because that passage is the proof. No gradients, sparkles, glass, cream-and-serif styling, or decorative labels: credibility comes from showing the source.

The design follows the reference skills the team chose: interface-design (one focal point per view, hierarchy from weight and color before size, borders-only depth), hallmark (no eyebrows, no dot-joined meta strings, no invented facts, real product screenshots instead of drawn mockups), hueapp (two-tier tokens), and Apple's HIG and Emil Kowalski's notes on motion (short ease-out transitions, press feedback, reduced motion honoured).

## Principles
1. **The highlight is the proof.** The marker yellow (`--highlight`) appears only on cited passages (crops, the citation panel, the landing screenshots). Never on buttons, badges, headings or decoration.
2. **One filled action per view.** Each screen has at most one primary (navy) button. Alternatives are secondary (bordered) or ghost.
3. **Every answer shows its work.** Answer sentences carry numbered source chips; sources sit under the answer, never behind a hover.
4. **Weight and color do the hierarchy.** One family (IBM Plex Sans). Titles are 600, names 500, meta 400 in a lighter text step. No uppercase or letter-spaced labels; labels are sentence case, a step smaller.
5. **Records are tables.** Clients, files and formats are ruled rows with aligned figures (tabular numbers), not grids of identical cards.
6. **Every list has four states.** Loading (skeleton shaped like the content), empty (what will appear plus the one action that fills it), error (what failed plus Try again), and content.
7. **Phones are first-class.** Every screen works from 360px: the sidebar becomes a drawer, dialogs become bottom sheets, table rows stack.
8. **Say only what is true.** No invented metrics, testimonials or logos. Privacy copy states exactly what leaves the computer (the passages sent to the configured language model).

## Color
Two tiers. Primitives are ramps named by material (`--slate-*`, `--graphite-*`, `--navy-*`, `--marker-*`, `--green/amber/red-*`), generated in OKLCH (slate hue 258 at chroma up to 0.018, navy hue 262) and written as hex. Components never use them. Semantic tokens name a role; components use them through Tailwind utilities.

| Token | Utility | Light | Dark | Role |
|---|---|---|---|---|
| `--background` | `bg-bg` | #fafafc | #0f1113 | Page canvas |
| `--surface1` | `bg-surface` | #ffffff | #15171a | Tables, cards, sidebar, inputs |
| `--surface2` | `bg-surface-muted` | #f4f5f7 | #1c1e22 | Table heads, wells, crop frames |
| `--surface3` | `bg-surface-hover` | #edeef1 | #23252a | Hover on ghost buttons |
| `--border` | `border-border` | #e1e3e6 | #2b2e32 | Rules, card edges |
| `--border-visible` | `border-border-strong` | #cbced2 | #3a3d42 | Secondary buttons, dashed drop zones |
| `--border-input` | `border-input` | #7f8389 | #6d7279 | Form fields (3.3:1 or better) |
| `--text1` | `text-text` | #131921 | #e9ebee | Headings, body |
| `--text2` | `text-muted` | #4a5059 | #b0b4bb | Descriptions, secondary text |
| `--text3` | `text-subtle` | #60656d | #9da2a9 | Meta, timestamps, placeholders |
| `--text4` | `text-faint` | #a1a5ab | #595e65 | Decorative only (not for reading) |
| `--accent` | `bg-accent`/`text-accent` | #234485 | #90b1ee | The one action color (navy) |
| `--accent-hover` | `bg-accent-hover` | #153470 | #a8c5f9 | Hover/pressed accent |
| `--accent-subtle` | `bg-accent-soft` | #ecf2fd | #192437 | Active nav, citation chips |
| `--accent-border` | `border-accent-border` | #c3d2ec | #2d4268 | Accent-tinted outlines |
| `--on-accent` | `text-on-accent` | #ffffff | #0b0f18 | Text on accent fills |
| `--highlight` | `bg-highlight`, `.marker` | #fae492 | #554614 | Cited passages only |
| `--success` / `--success-bg` | `text-success` / `bg-success-soft` | #206b38 / #e6fae9 | #76c788 / #132416 | Ready, answered |
| `--warning` / `--warning-bg` | `text-warning` / `bg-warning-soft` | #90570c / #fff1de | #e4b066 / #2c1f0e | Partial reads |
| `--error` / `--error-bg` | `text-danger` / `bg-danger-soft` | #b02b27 / #ffefed | #eb827b / #341816 | Failures, destructive actions |
| `--band` / `--on-band` | `bg-band` / `text-on-band` | #131921 / #e9ebee | #1c1e22 / #e9ebee | The one inverted band (landing, privacy) |

Measured contrast (WCAG), worst case across background, surface, wells and hover rows: text1 at least 12.8:1, text2 at least 7.0:1, text3 at least 5.0:1; accent 8.1:1 (light) and 7.1:1 (dark); on-accent on accent 9.2:1 and 8.9:1; status text on its own tint at least 5.3:1; input borders at least 3.4:1; band text at least 8.0:1. Dark mode is graphite, not black: surfaces step up a few percent in lightness, borders carry the structure, and nothing casts a resting shadow.

Dark mode is the `.dark` class on `<html>`, set before first paint (index.html) from the stored choice or the system setting.

## Type
IBM Plex Sans for everything in the interface. IBM Plex Serif only for document text (quoted passages, notes): the client's words, set apart from the interface's. IBM Plex Mono for file paths. All fonts ship with the app (@fontsource).

| Token | Size / line | Weight | Use |
|---|---|---|---|
| `text-display` | 52 / 1.04, -0.032em | 600 | Landing headline |
| `text-section` | 34 / 1.12, -0.025em | 600 | Landing section titles |
| `text-h1` | 26 / 32, -0.02em | 600 | Page titles |
| `text-h2` | 18 / 26 | 600 | The asked question, figures |
| `text-h3` | 15 / 22 | 600 | Section headings |
| `text-lead` | 18 / 28 | 400 | Landing intro paragraphs |
| `text-answer` | 16 / 26 | 400 | Answer text |
| `text-body` | 14 / 22 | 400 | Default UI text |
| `text-small` | 13 / 20 | 400 | Meta, help |
| `text-label` | 12 / 16 | 500 | Labels, table heads, counts (sentence case) |
| `text-doc` | 15 / 25 | 400 serif | Document passages, notes |

Counts and figures use `.tabular`. Headings use `text-wrap: balance`, paragraphs `pretty`. Phones get 16px form text so iOS never zooms.

## Space, radius, elevation, motion
- 4/8px grid. Page gutters 16px (phone), 24px (sm), 40–48px (desktop); content max 1280px.
- Radius: 6px controls and tags (`rounded-control`), 8px tables and cards (`rounded-card`), 12px panels, dialogs and the ask box (`rounded-panel`), pills only for small counts (`rounded-pill`).
- Elevation: flat. Surfaces at rest are separated by 1px borders (`shadow-subtle` is none). `shadow-card` is a hairline lift for the answer; `shadow-panel` is for things that float (menus, dialogs, the citation panel, landing screenshots).
- Motion: short and mechanical. 120 to 220ms, ease-out `cubic-bezier(0.23,1,0.32,1)`, no bounce, only transform and opacity. Buttons scale to 0.98 when pressed (`.press`). Panels slide 16px; skeletons sweep instead of blinking. `prefers-reduced-motion` turns it all off.

## Components
| Component | Variants and rules |
|---|---|
| Button | primary, secondary, ghost, danger × sm (32), md (36), lg (44). `loading` shows a spinner and blocks clicks. Icon left, 16px, 1.75 stroke. |
| IconButton | Icon-only, required `label` (aria-label + tooltip). 32 or 36px. `tone="danger"` for delete. |
| Field / PasswordField | Visible label, 40px input on `border-input`, soft accent glow on focus, hint or error under it wired with aria-describedby. Password fields have show/hide and allow paste. |
| States | `Skeleton`, `EmptyState` (icon, title, one action), `ErrorState` (message + Try again). |
| Sidebar / SidebarItem | 256px, same white as the content, one border. Workspaces, Settings, Clients list with file counts and a + for new workspace, theme toggle, user menu. Becomes a drawer below 1024px. |
| UserMenu, Avatar | Name and email; Settings, Sign out. |
| Workspace Table | The client register: industry icon, name (a link stretched over the row), industry, files (right-aligned figures), last updated. Delete appears on hover/focus with a pointer, always visible on touch. Rows stack on phones. |
| File Row | Inside one bordered list. Type icon, name (opens the viewer), meta, status tag (Ready, Reading, Queued, Failed; words first, no dots), actions. Wraps on phones. |
| Search Input (Ask box) | 12px-radius panel, accent ring on focus, Ask button (an arrow on phones). |
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
- No serif in headings or controls (serif is for document text only).
- No hex values or primitive ramps in components.
- No hover-only controls on touch screens.
- No icon-only button without a label.
- No placeholder-as-label in forms.
- No spinners for content that has a shape; use a skeleton.
- No border-radius above 12px except pills.
- No emoji or sparkle icons; Lucide only, 1.75 stroke.
- No drawn product mockups on the landing page; use real screenshots (frontend/src/assets/landing, captured from the app in mock mode).
- No invented numbers, quotes or logos.
- No buttons that do nothing.
