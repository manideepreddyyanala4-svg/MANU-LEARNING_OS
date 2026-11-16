# Light and dark design system

Source of truth: CSS variables in `app/globals.css`. Contrast is recomputed by `node docs/ux/contrast-check.mjs` (exit code 1 on any failure; last run: all required pairs pass).

## Tokens and measured contrast

| Token | Light (warm cream) | Dark (green-gray charcoal) |
|---|---|---|
| `--bg` page | `#F5F1E8` | `#1E2323` |
| `--surface` reading / cards | `#FBF9F4` | `#282E2D` |
| `--sidebar` | `#F0EAE0` | `#222827` |
| `--fg` primary text | `#252A30` | `#ECE9E1` |
| `--muted` secondary text | `#535A5D` | `#BBC3BF` |
| `--muted-light` tertiary text | `#6B6F6C` | `#9AA5A1` |
| `--line` subtle border (decorative) | `#DCD5C8` | `#414A46` |
| `--line-strong` control border | `#8C8678` | `#7D8A85` |
| `--accent` | `#2F5D46` forest green | `#9CC3A8` sage |
| `--accent-hover` | `#244A37` | `#B3D3BD` |
| `--accent-subtle` / `--accent-border` | `#E4EBDD` / `#A9BFA9` | `#2B3B34` / `#4E6F5C` |
| `--on-accent` (text on accent) | `#FBF9F4` | `#14201A` |
| `--success` / `--warning` / `--danger` | `#2F6B3F` / `#8A5A00` / `#A32A2A` | `#8CC79B` / `#E0B35A` / `#EB9C9C` |
| `--code-bg` / `--code-fg` | `#2B2F33` / `#F1EEE6` | `#171C1B` / `#ECE9E1` |

| Pair | Light | Dark | Required |
|---|---:|---:|---:|
| Text on page / reading surface / sidebar | 12.83 / 13.74 / 12.08 | 13.11 / 11.40 / 12.36 | 4.5 |
| Secondary text on page / surface / sidebar | 6.23 / 6.68 / 5.87 | 8.84 / 7.68 / 8.33 | 4.5 |
| Tertiary text on surface | 4.85 | 5.45 | 4.5 |
| Accent text on page / surface | 6.71 / 7.19 | 8.17 / 7.10 | 4.5 |
| Button label on accent / accent hover | 7.19 / 9.46 | 8.62 / 10.36 | 4.5 |
| Success / warning / danger text on surface | 6.06 / 5.63 / 6.83 | 7.08 / 7.09 / 6.43 | 4.5 |
| Code text on code background | 11.63 | 14.21 | 4.5 |
| Control border on surface | 3.44 | 3.85 | 3.0 |
| Focus ring on page / surface / sidebar | 6.71 / 7.19 / 6.32 | 8.17 / 7.10 / 7.70 | 3.0 |

Rationale: dark text luminance is kept high (13:1) because the polarity studies read (see research doc, sources 8–11) found the best proofreading with high luminance contrast; "softer" is not treated as automatically more comfortable. Dark mode is designed separately (green-gray neutrals, desaturated sage accent, no pure black or white), not by inversion. The dark candidates from the brief (`#1E2323`, `#282E2D`, `#222827`, `#ECE9E1`, `#BBC3BF`, `#414A46`) all passed after small refinements to the accent and control-border values.

## Legacy Tailwind palette remap

About 700 hardcoded utility classes (`bg-white`, `slate-*`, `sky-*`, `violet-*`, `emerald-*`, `amber-*`, `red-*` …) are remapped in a `@theme` block in `globals.css`, so every page follows the system without touching each class:

- `white` → `#FBF9F4`; `slate/gray/zinc/neutral/stone` → warm neutral scale.
- `sky, blue, indigo, violet, purple, fuchsia, cyan, teal` → one forest-green scale. `emerald/green/lime` → success green. `amber/orange/yellow` → ochre. `red/rose/pink` → brick.
- The 500 and 600 shades were darkened until text on a 10–20% tint of itself reaches ≥ 4.5:1 (axe found this on the Ideas, Progress and Job Preparation pages before the fix).
- `@custom-variant dark` now ties `dark:` classes to the `.dark` class. Before, they followed the operating system only, so many `dark:` styles did not respond to the app's own theme switch.
- In dark mode, `text-*-500/600/700` utilities map to light tints (`.dark :is(...)` rules) because the fixed scales are tuned for light surfaces.

Meaningful colour was kept: the subject colour picker in Learning, finance and status colours, Python Lab's dark code editor.

## Typography and spacing

- Font: existing Inter (no new font files).
- Reading view (`.reading`): 18 px body (17 px on phones), line-height 1.7, paragraph gap 1.1em, left-aligned, measure `68ch` (rendered ≈ 73 characters, within WCAG 1.4.8's 80), headings 1.6/1.35/1.15 em, `overflow-wrap: anywhere`.
- Code: monospace 0.86 em, `white-space: pre` (indentation preserved), horizontal scroll inside the block only, focusable (`tabindex=0`), Copy button. No syntax colouring (see limitation below).
- No text below 12 px: 273 Tailwind classes and 25 CSS declarations were raised; weights `font-black`/`font-extrabold` were lowered to bold.
- Motion: `prefers-reduced-motion` removes animation and smooth scrolling.

## Components

- Shell: one `NavLinks` component for desktop sidebar and mobile drawer. Four primary links (Study Now, Learning, Python Lab, Roadmap) always visible; Career, Personal and System are collapsible and open automatically when they contain the current page. Active item: accent tint + 3 px accent bar + `aria-current="page"`. Skip link, `aria-expanded` on groups.
- Header: current page name, Search (⌘K palette), theme toggle. No badges, version tags, fake account strip or "Online" indicator.
- Buttons: primary = accent fill with `--on-accent`; secondary = surface with `--line-strong` border; minimum 44 px height for main actions.
- Cards: 1 px subtle border, almost no shadow (`--shadow-*` reduced to ≤ 0.12 alpha warm tones).
- Focus: 2 px accent outline, 2 px offset, all interactive elements.
- Theme: next-themes, class strategy, default light, `enableSystem` on. A stored light/dark choice is never overridden by the OS (tested). "Auto" in Settings now actually follows the OS; before, system was disabled.
