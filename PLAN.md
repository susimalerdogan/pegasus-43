# Nike Pegasus 43 Product Page: Mobile-First Implementation Plan

Status: **FINAL. Approved and implemented (see README.md and PROMPT_NOTES.md).**
Stack: **Next.js (App Router) + React + TypeScript.**
Reference device: **375×667px.** Primary usable viewport target: **375×553px.**

Source data: `Pegasus 43 size and stock list.json` (26 sizes, style `HV7521-001`, Black/White-Volt, $140.00). The project keeps its own copy at `data/stock.json`; the app never reads from `~/Downloads`.

---

## 1. Goals and non-negotiables

| # | Requirement | How we meet it |
|---|-------------|----------------|
| 1 | Section order: Photos → Name/Price → Size selector → Tech details → Reviews | Single column, fixed component order in `page.tsx` |
| 2 | On a 375px phone the size grid **starts inside the 553px usable viewport** (and well inside the 667px reference screen) | Height budget in §3: grid begins at y = 458px |
| 3 | Every section has a defined height | Fixed `height` / `min-height` + `aspect-ratio` per section (§4) |
| 4 | Size buttons ≥ 44×44px | Buttons are 48px tall, ≥ 66px wide at a 320px viewport |
| 5 | Clear in-stock / low-stock / selected / sold-out states | §6, never color alone |
| 6 | All 26 sizes shown in `display_order`; sold-out sizes visible, disabled, grid layout unchanged | Every size always rendered in a fixed slot |
| 7 | Loading states; reserved space for images and fonts | §7, §8; target CLS = 0 |

---

## 2. Stack, file structure and component organization

**Next.js (App Router) + React + TypeScript.** Styling: CSS Modules plus global CSS custom properties for the height tokens (header 48, photo 250, dots 20, title 88, cell 48, gap 8, etc.).

```
pegasus-43/
  app/
    layout.tsx              server: <html>, viewport meta, fonts, imports globals.css
    page.tsx                server: loads + validates stock, composes the 5 sections in order
    loading.tsx             full-page skeleton at the same fixed heights
    globals.css             height/color tokens (CSS custom properties), reset
  components/
    SiteHeader.tsx          server: 48px header
    Gallery.tsx             client: scroll-snap carousel + dots, next/image
    TitleBlock.tsx          server: name, colorway, price (88px)
    SizeSelector.tsx        client: selection state, keyboard nav, status line, legend
    SizeButton.tsx          client: one size cell with its state styling
    SizeGridSkeleton.tsx    server: 28 placeholder cells, same dimensions
    SizeGridError.tsx       client: error panel with Retry, rendered by ProductData when stock fails, same footprint
    TechDetails.tsx         client: accordion
    Reviews.tsx             server: summary, cards, empty state (432px)
    *.module.css            one CSS Module per component
  lib/
    stock.ts                types, validation, normalization, sorting by display_order
  data/
    stock.json              project copy of the stock file
  public/
    images/                 product photos (placeholders until supplied)
    fonts/                  only if a licensed web font is provided
  package.json, tsconfig.json, next.config.ts
  PLAN.md
```

How the existing requirements map to Next.js:
- **Data:** `page.tsx` reads `data/stock.json` on the server through `lib/stock.ts` and passes the validated, sorted list to `SizeSelector`. There is no client fetch race, and the 26 sizes arrive in `display_order`.
- **Loading:** `loading.tsx` and `Suspense` fallbacks use fixed-height skeletons that match the final sections exactly.
- **Errors:** `ProductData` catches stock read/validation errors on the server and renders `SizeGridError` ("Couldn't load sizes" + Retry) inside the same 384px box.
- **Images:** `next/image` with explicit `width`/`height`, `priority` on the first photo, inside the fixed 3:2 / 250px container.
- **Fonts:** system font stack by default; if a web font is supplied, `next/font` (self-hosted, size-adjusted fallback).
- **Client vs server:** only `Gallery`, `SizeSelector`/`SizeButton`, `SizeGridError` and `TechDetails` are client components; everything else is server-rendered.
- Trade-off of choosing Next.js: a Node/npm toolchain and build step are required.

---

## 3. First-screen height budget (375px wide)

Reference device: **375×667px** (iPhone SE class). Primary usable viewport target: **375×553px**, which is the 667px screen minus roughly 114px of mobile browser UI (Safari address bar and toolbar). The size grid must begin inside the 553px area. Taller phones show more.

| Block | Height | Running top |
|-------|--------|-------------|
| Site header (back, logo, bag) | 48px | 48 |
| Photo gallery (3:2 → 375×250) | **250px** | 298 |
| Gallery dots strip | 20px | 318 |
| Name + colorway + price | 88px | 406 |
| Size section: top padding | 8px | 414 |
| Size section: heading row ("Select Size" + Size Guide) | 44px | 458 |
| **Size grid starts** | | **458** |
| First size row (48px) | 48px | 506 (fully visible) |
| Second size row | 48px | 562 (9px cut off at 553) |

Result: the heading and first row are fully inside the 553px target, and the second row is partly visible, which signals that the grid continues.

### 3.1 Reference device vs. usable viewport (375×667 and 553px)

Measured from this plan's numbers: grid start = 48 + 250 + 20 + 88 + 8 + 44 = **458px** (name block = 12 top padding + name 28 + 4 gap + colorway 20 + price 24 = 88px).

- **Against the 553px target:** the grid starts **95px inside** it. Row 1 spans 458–506px (fully visible); row 2 spans 514–562px (9px cut off).
- **Against the 667px reference:** the grid starts **209px above the bottom edge**. Rows 1–3 are fully visible (third row ends at 618px) and row 4 starts at 626px and is cut off. Rows are 48px with 8px gaps (56px pitch).
- The photo would need to grow to about 459px (667 reference) or 345px (553 target) before the grid started at the bottom edge, so **no photo reduction is needed and the photo stays at 250px**.

Tokens (CSS custom properties in `globals.css`) hold these numbers so the budget is changed in one place.

---

## 4. Section specs (top to bottom)

### 4.1 Product photos, fixed 250px + 20px indicator (`Gallery.tsx`)
- Container: `width:100%; aspect-ratio:3/2; background:#f5f5f5`. Reserved before any image loads.
- Horizontal scroll-snap carousel using `next/image` with `width`/`height` and `object-fit: cover`.
- First image: `priority` (LCP element). Other images lazy loaded.
- Dots indicator: fixed 20px row, 8px dots.
- Loading: neutral gray block with a subtle shimmer (off under `prefers-reduced-motion`).
- Error: gray block with a "Photo unavailable" label at the same size.
- **Open item:** no photos were provided. Placeholder blocks are used until real images are added to `public/images/`.

### 4.2 Name and price, fixed 88px (`TitleBlock.tsx`)
- Name "Nike Pegasus 43": 24px/28px, single line, ellipsis on overflow (never wraps, so the height never changes).
- Colorway "Black/White-Volt": 14px/20px, gray.
- Price "$140.00": 18px/24px, bold, `font-variant-numeric: tabular-nums`.
- Skeleton: three gray bars with the same line heights.

### 4.3 Size selector, fixed 520px (`SizeSelector.tsx`)
Breakdown: 8 top pad + 44 heading + 384 grid + 12 gap + 24 status line + 28 legend + 20 bottom pad = **520px**.

- **Heading row (44px):** "Select Size" on the left, "Size Guide" link on the right (minimum 44px tap area).
- **Grid:** 4 columns, 8px gap, 16px side padding.
  - Cell width at 375px ≈ 79.75px; at 320px ≈ 66px. Both exceed 44px.
  - **All 26 sizes in `display_order`** → 7 rows × 4 columns = 28 slots (2 unused). Empty slots are not rendered, but the container height is fixed at 384px (7×48 + 6×8), so nothing shifts.
- **Cell content (2 lines inside a 48px-tall button):**
  - Line 1: `M 9.5` (14px, semibold)
  - Line 2: `W 11 · EU 43` (11px, secondary)
  - Derived from `size_us_men`, `size_us_women`, `size_eu`. The long `size_label` is not used on the button.
- **Status line (24px):** always reserved. Shows e.g. "M 9 selected. Only 3 left." or is empty. Uses `aria-live="polite"`.
- **Legend (28px):** In stock · Low stock · Sold out · Selected, small icons plus text.

### 4.4 Technical details, fixed collapsed height (`TechDetails.tsx`)
- Accordion list, each row a fixed 52px; sections: *Overview*, *Fit & Cushioning*, *Materials*, *Care*.
- Rows open below the selector, using a `grid-template-rows` height animation inside a pre-sized container. Expanding only moves content beneath it, never anything already on screen.
- **Open item:** no spec data was provided. Specs (weight, drop, stack height) will not be invented; rows hold labeled placeholders until copy is supplied.

### 4.5 Customer reviews, fixed 432px (`Reviews.tsx`)
- Summary row (72px): average rating, count, star bar.
- Review cards: fixed 96px each, text clamped to 3 lines, 8px gaps. Three cards visible, then a 44px "Show more reviews" button. Total: 72 + 12 gap + 3×96 + 2×8 + 12 gap + 44 = **432px**.
- Loading: 3 skeleton cards with the same height.
- Empty state ("No reviews yet") shown inside the same 432px box.
- **Open item:** no review data exists. Reviews will **not** be fabricated. Default is the empty state; demo content, if wanted, will be clearly labeled "Sample".

---

## 5. Data handling (`lib/stock.ts`)

- `page.tsx` reads `data/stock.json` on the server, then sorts by `display_order`. All 26 sizes are kept.
- Map `stock_status` → state: `in_stock`, `low_stock`, `sold_out`. Treat `in_stock === false`, `stock_quantity === 0` or `stock_status === "sold_out"` as sold out regardless of the other fields (defensive).
- Validate each row (required fields, numeric quantity). Invalid rows render as sold-out slots instead of breaking the grid, and log a server warning.
- Counts from the current file: 17 in stock, 5 low stock (M 4, 9, 9.5, 11, 15), 4 sold out (M 3.5, 10, 15.5, 16), 1,525 units total.

### Data concerns to confirm before launch
1. **M 9, M 9.5, M 10** are low or sold out while M 8.5 (198) and M 10.5 (212) are the highest in stock. This may be a data error.
2. `launch_date` is **2026-12-10**, which is in the future (today 2026-11-19). Default: show stock as given and ignore the date.
3. EU sizes skip half steps (37, 41.5, 43.5), which matches Nike's usual chart.

---

## 6. Size button states (`SizeButton.tsx`)

All states share the same box: 48px tall, **2px border always present** (transparent when unused), so state changes never alter dimensions.

| State | Visual | Non-color cue | Interaction / a11y |
|-------|--------|---------------|--------------------|
| In stock | White bg, 2px gray border `#cacacb`, black text | none needed | Enabled, `role="radio"` in a `radiogroup` |
| Low stock | Same as in stock + amber dot top-right | Dot **and** status line "Only N left" on select | Enabled; `aria-label` includes "only N left" |
| Selected | Black bg, white text, black border | Check icon top-right | `aria-checked="true"` |
| Sold out | Gray bg `#f5f5f5`, gray text, diagonal strike line | Strike line + "sold out" in the accessible name | `aria-disabled="true"`, no hover, not selectable; arrow-key navigation skips it |
| Focus | 2px offset focus ring, 3:1 contrast | ring | Arrow-key navigation within the grid |
| Pressed | Slightly darker border; no `transform` (no layout effect) | | |

Contrast: text/background ≥ 4.5:1 for all except sold-out text, which is intentionally muted but still ≥ 3:1 and conveyed by the strike line and aria text.

Selection behavior: tapping a selected size does not deselect it (standard radio behavior). Default is no size selected.

---

## 7. Loading and error states

Every state sits inside the same reserved box:

1. **Initial HTML** is server-rendered with every section at its final height. `loading.tsx` / `Suspense` fallbacks use fixed-height skeletons, so no client JS is needed to reserve space.
2. **Photos:** gray 3:2 block → image fades in (opacity only).
3. **Name/price:** server-rendered static content, so no skeleton unless it comes from an API later.
4. **Size grid:** `SizeGridSkeleton` (28 cells, 48px tall, same grid) → replaced by real buttons in place. Heading and legend are static.
5. **Error (stock fails to load or validate):** the server-side catch in `ProductData` renders `SizeGridError` ("Couldn't load sizes" + 44px Retry button) within the same 384px.
6. **Reviews:** skeleton cards → real cards or empty state.

Rules: only `opacity` is animated, never height or position. `prefers-reduced-motion` turns off shimmer and fade.

---

## 8. Font and image stability

- **Fonts:** Nike's typeface is proprietary and not available. Default is the **system font stack** (`-apple-system, system-ui, Helvetica Neue, Arial`), which has zero font-loading shift. If a licensed font is supplied, use `next/font/local` (self-hosted `woff2`, `display: swap`, size-adjusted fallback). Fixed line heights and single-line truncation already limit any shift.
- **Images:** `next/image` always gets `width`/`height`; the container uses `aspect-ratio`. Responsive sizes come from `next/image` (WebP/AVIF).
- **Icons:** inline SVG with fixed width/height, no icon font.

---

## 9. Responsive and accessibility notes

- Layout: single column, `max-width: 560px`, centered on larger screens in v1 (a two-column desktop layout is out of scope).
- Narrow phones (320px): grid stays 4 columns (cells ≈ 66px). Below 300px (or at high text zoom, which triggers the width query), switch to 3 columns; the fixed grid height is recomputed from the row count via a CSS variable.
- Safe-area insets respected on notched phones.
- Landmarks, headings in order (h1 = shoe name), labelled buttons. Touch targets ≥ 44×44px, including Size Guide and Retry.

---

## 10. Implementation steps (after approval)

1. Scaffold the Next.js app (App Router, TypeScript) in the project folder; add `globals.css` tokens (heights, colors, spacing); copy the stock JSON to `data/stock.json`; add `lib/stock.ts` (types, validation, sort by `display_order`). Retire the earlier plain-HTML prototype files (`index.html`, `css/`, `js/`), confirming with you before deleting.
2. `layout.tsx`, `page.tsx` and `loading.tsx` with all five sections and skeletons at their final heights.
3. `SiteHeader`, `Gallery`, `TitleBlock` (photo 250px, grid start at 458px).
4. `SizeSelector`, `SizeButton`, `SizeGridSkeleton`: all 26 sizes in `display_order` with in-stock, low-stock, selected and sold-out states.
5. Selection logic, status line, keyboard support.
6. `TechDetails` accordion and `Reviews` section.
7. Server-side error catch + `SizeGridError` with Retry.
8. Verification (§11).

---

## 11. Verification checklist

- Run the dev server and preview at **320, 375, 390, 430, 768px**. Confirm on 375px that the grid heading and first row fit inside **553px**, and that the grid starts at **458px** on the 667px reference.
- `next build`, `tsc` and lint pass with no errors.
- Measure layout shift (Lighthouse / Performance panel): **CLS = 0** with throttled network, cached and uncached.
- Confirm every section's height is identical before and after content loads (script compares skeleton vs loaded heights).
- Confirm all 26 sizes render in `display_order`, and that M 3.5, M 10, M 15.5, M 16 are visible, disabled, and don't shift neighbors.
- Measure all button bounding boxes ≥ 44×44px.
- Keyboard-only and screen-reader pass; check contrast.
- Test the error state by forcing a temporary error in `lib/stock.ts` during development.
- Known environment note: the preview server previously failed on this Mac with "Operation not permitted" when run from `~/Desktop`; this needs a local fix (folder access permission or a different project location) before browser verification.

---

## 12. Open questions and defaults

Each has a default, so none of these blocks the build:

1. ~~Stack~~ **Decided:** Next.js with React (§2, §13).
2. Product photos, technical specs and review data: **default** placeholders and an empty-state reviews section.
3. **Add to bag** button: **default** not included (not in your section list). If added, it needs its own reserved height (~56px).
4. Future launch date (2026-12-10): **default** no behavior change.
5. Low stock numbers for M 9 / M 9.5 / M 10: **default** use the data as given.
6. Web font: **default** system font stack.

---

## 13. Design review: final decisions

1. **Stack: Next.js (App Router) + React + TypeScript.** Replaces the earlier plain HTML/CSS/JS proposal. §2 (structure and components), §4 (component names), §5 (server-side data), §7 (loading/error), §8 (`next/image`, `next/font`), §10 (steps) and §11 (verification) were updated to match. UX requirements and layout measurements are unchanged.
2. **Viewport targets.** **667px is the reference device height; 553px is the primary usable viewport target** after mobile browser UI. The size grid must begin inside the 553px area.
3. **Measurements kept.** Product photo stays at **250px** and the size grid starts at **458px**: 95px inside the 553px target and 209px inside the 667px reference. No layout change was needed.
4. **Content and states kept.** All **26 sizes in `display_order`**, with in-stock, low-stock, selected and sold-out states as specified in §6. Sold-out sizes stay visible and disabled without changing the grid.
5. **Consistency review.** The full plan was reviewed for leftover references to the plain-HTML approach (file names, `fetch`, `assets/`, `<img>` attributes); these were replaced. Section heights add up: first-screen budget 458px; size section 520px; reviews 432px.
