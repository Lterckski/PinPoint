# PinPoint — Design system: "Margin Notes"

Code: `frontend/src/index.css` (tokens), `frontend/src/components/` (components).
The original Figma file (dEpoBVGwqEwzOmYaKJC750) is reference only; this document wins where they differ.

## Philosophy
PinPoint is a legal pad with a highlighter. The interface stays quiet, warm paper, ink-dark text, one indigo for actions, so that the only loud thing on screen is the yellow mark on the passage that proves an answer. Lineage: ruled legal pads, court filings, a lawyer's marked-up exhibit. The tension: an AI product that refuses to look like one. No gradients, sparkles, or robots; trust comes from showing the source.

## Principles
1. **The highlight is the proof.** The marker yellow (`--highlight`) appears only on cited passages (crops, the citation panel, the landing demo). Never on buttons, badges, or decoration.
2. **One filled action per view.** Each screen has at most one primary (indigo-filled) button. Alternatives are secondary (bordered) or ghost.
3. **Every answer shows its work.** Answer sentences carry numbered source chips; sources sit under the answer, never hidden behind a hover.
4. **Type does the hierarchy.** Size and weight separate levels; color steps only from text1 to text3. Serif is for display moments and document text, never for UI controls.
5. **Every list has four states.** Loading (skeleton shaped like the content), empty (what will appear plus the one action that fills it), error (what failed plus Try again), and content.
6. **Phones are first-class.** Every screen works from 360px: the sidebar becomes a drawer, dialogs become bottom sheets, rows wrap instead of truncating actions away.
7. **Respect the reader.** Visible focus everywhere, 4.5:1 text contrast in both themes, reduced motion honoured, no hover-only actions on touch.

## Color
Two tiers. Primitives are ramps named by hue (`--paper-*`, `--ink-*`, `--indigo-*`, `--marker-*`, `--green/amber/red-*`), generated in OKLCH with a constant hue per ramp and written as hex. Components never use them. Semantic tokens name a role; components use them through Tailwind utilities.

| Token | Utility | Light | Dark | Role |
|---|---|---|---|---|
| `--background` | `bg-bg` | #fbf9f7 | #0d0e11 | Page canvas |
| `--surface1` | `bg-surface` | #ffffff | #151619 | Cards, sidebar, inputs |
| `--surface2` | `bg-surface-muted` | #f5f3f0 | #1d1e22 | Wells, crop frames, chips |
| `--surface3` | `bg-surface-hover` | #efece8 | #24252a | Hover on rows and ghost buttons |
| `--border` | `border-border` | #e4e1dd | #2a2b30 | Dividers, card edges |
| `--border-visible` | `border-border-strong` | #d0cdc8 | #3e3f46 | Secondary buttons, dashed empty states |
| `--border-input` | `border-input` | #96938c | #616369 | Form fields (3:1 against surface) |
| `--text1` | `text-text` | #191a20 | #edeef1 | Headings, body |
| `--text2` | `text-muted` | #5b5d65 | #afb1b8 | Descriptions, secondary text |
| `--text3` | `text-subtle` | #6a6b72 | #93959d | Meta, timestamps, placeholders |
| `--text4` | `text-faint` | #a3a4aa | #616369 | Decorative numerals only (not for reading) |
| `--accent` | `bg-accent`/`text-accent` | #4840d2 | #96a2fc | The one action color (from the logo) |
| `--accent-hover` | `bg-accent-hover` | #3b30b6 | #adb8fe | Hover/pressed accent |
| `--accent-subtle` | `bg-accent-soft` | #eef1ff | #222546 | Active nav, citation chips |
| `--accent-border` | `border-accent-border` | #bec7f9 | #404683 | Accent-tinted outlines |
| `--on-accent` | `text-on-accent` | #ffffff | #0c0e1c | Text on accent fills |
| `--highlight` | `bg-highlight`, `.marker` | #fee484 | #5e4b0c | Cited passages only |
| `--success` / `--success-bg` | `text-success` / `bg-success-soft` | #1d7d3e / #e6fae9 | #6fd087 / #172c1c | Ready, answered |
| `--warning` / `--warning-bg` | `text-warning` / `bg-warning-soft` | #a35e16 / #fff3e2 | #eeb154 / #362512 | Partial reads |
| `--error` / `--error-bg` | `text-danger` / `bg-danger-soft` | #be2323 / #fdeeed | #f47b74 / #3e1e1c | Failures, destructive actions |

Measured contrast (WCAG), worst case across background, surface, wells and hover rows: text1 ≥ 13.1:1, text2 ≥ 5.5:1, text3 ≥ 4.5:1; accent on surface 7.1:1 (light) and 7.6:1 (dark); on-accent on accent 7.1:1 / 8.1:1; status text on its own tint ≥ 4.5:1; input borders ≈ 3:1. Dark mode is derived, not inverted: lower chroma accent, warm-neutral ink, and no shadows.

Dark mode is the `.dark` class on `<html>`, set before first paint (index.html) from the stored choice or the system setting.

## Type
Inter for all UI. Instrument Serif for display (landing, page-level questions, sign-in) and document text (passages, notes). Monospace (`font-mono`, system stack) for file paths. All fonts ship with the app.

| Token | Size / line | Weight | Use |
|---|---|---|---|
| `text-display` | 64 / 1.0, −0.02em | 400 serif | Landing hero |
| `text-section` | 40 / 1.1 | 400 serif | Landing section titles |
| `text-h1` | 24 / 32, −0.015em | 600 | Page titles |
| `text-h2` | 18 / 26 | 600 | Card titles, the asked question |
| `text-h3` | 15 / 22 | 600 | Section headings |
| `text-lead` | 17 / 28 | 400 | Landing intro paragraphs |
| `text-answer` | 16 / 26 | 400 | Answer text |
| `text-body` | 14 / 22 | 400 | Default UI text |
| `text-small` | 13 / 20 | 400 | Meta, help |
| `text-label` | 12 / 16 | 500 | Labels, counts |
| `text-eyebrow` | 11 / 16, +0.08em, uppercase | 600 | Section kickers |
| `text-doc` | 16 / 24 | 400 serif | Document passages, notes |

Counts and stats use `.tabular` (tabular numbers). Headings use `text-wrap: balance`, paragraphs `pretty`. Phones get 16px form text so iOS never zooms.

## Space, radius, elevation, motion
- 4/8px grid. Page gutters 16px (phone), 24px (sm), 40–48px (desktop); content max 1280px.
- Radius: 8px controls (`rounded-control`), 12px cards (`rounded-card`), 16px panels and the ask box (`rounded-panel`), pills (`rounded-pill`).
- Elevation: subtle. `shadow-subtle` (resting), `shadow-card` (hover, answer), `shadow-panel` (menus, dialogs, side panel). Dark mode drops resting shadows and relies on borders.
- Motion: mechanical and short. 120–260ms, ease-out `cubic-bezier(0.2,0.8,0.2,1)`, no bounce. Enters rise 4px and fade; panels slide 16px; skeletons sweep instead of blinking. `prefers-reduced-motion` turns it all off.

## Components
| Component | Variants and rules |
|---|---|
| Button | primary, secondary, ghost, danger × sm (32), md (36), lg (44). `loading` shows a spinner and blocks clicks. Icon left, 16px, 1.75 stroke. |
| IconButton | Icon-only, required `label` (aria-label + tooltip). 32 or 36px. `tone="danger"` for delete. |
| Field / PasswordField | Visible label, 40px input on `border-input`, soft accent glow on focus, hint or error under it wired with aria-describedby. Password fields have show/hide and allow paste. |
| States | `Skeleton`, `EmptyState` (icon, title, one action), `ErrorState` (message + Try again). |
| Sidebar / SidebarItem | 256px. Workspaces, Settings, Clients list with file counts and a + for new workspace, theme toggle, user menu. Becomes a drawer below 1024px. |
| UserMenu, Avatar | Name and email; Settings, Sign out. |
| Workspace Card | Industry icon, industry pill, name, file count and last update. Lifts 2px on hover. Delete appears on hover/focus with a pointer, always visible on touch. |
| File Row | Inside one bordered list. Type icon, name (opens the viewer), meta, status badge (Ready, Reading, Queued, Failed), actions. Wraps on phones. |
| Search Input (Ask box) | 16px-radius panel, accent glow on focus, Ask button (an arrow on phones). |
| Answer Card | Eyebrow, answer text with numbered source chips (filled when open), sources grid, Copy / Save / Follow-up. |
| Citation Card / Panel | Crop on top, number chip, file and page. Panel slides in from the right (full width on phones) with the marker-highlighted passage and sticky actions. |
| Dialogs | Centered on desktop, bottom sheet on phones; Escape closes, focus returns to the opener. |

## Screens
Landing (`/`, `/welcome`), Sign in / first-run setup (`/signin`), Workspaces (`/workspaces`), a workspace's Ask, Files and Memory tabs (`/w/:id/...`), Settings (`/settings`), 404. Signed-in visitors to `/` go straight to Workspaces.

## Anti-patterns
- No gradients on surfaces or buttons (the skeleton sweep and the marker are the only gradients).
- No highlight yellow outside citations.
- No hex values or primitive ramps in components.
- No hover-only controls on touch screens.
- No icon-only button without a label.
- No placeholder-as-label in forms.
- No spinners for content that has a shape; use a skeleton.
- No border-radius above 16px except pills.
- No emoji as icons; Lucide only, 1.75 stroke (2 for active nav).
- No buttons that do nothing (the old static Share button was removed).
