# Prompt Notes: Nike Pegasus 43 Product Page

## Main prompt (summary)

Build a mobile-first Nike Pegasus 43 product page in Next.js (App Router), React and Tailwind CSS, using the provided stock JSON (`Pegasus 43 size and stock list.json`, 26 sizes). Section order: product photos, shoe name and price, size selector, technical details, customer reviews. On a 375px phone the product photo is 250px tall and the size grid starts at about 458px, inside a 553px usable viewport (667px reference device). Size buttons are at least 44px wide and 48px tall, with clear in-stock, low-stock, selected and sold-out states; sold-out sizes stay visible but disabled. Reserve space for images, fonts and the grid to prevent layout shift; include loading and error states, accessible labels and keyboard navigation.

Workflow: plan first (`PLAN.md`), approval, then implementation.

## Design decisions

- **Fixed height budget** (`PLAN.md` §3): header 48 + photo 250 + dots 20 + name block 88 + 8 padding + 44 heading = grid at 458px. 95px inside the 553px target and 209px inside the 667px reference.
- **Stack:** Next.js App Router + TypeScript + Tailwind 3. The stock file is read on the server (`lib/stock.ts`), validated and sorted by `display_order`; only the gallery, size selector and accordion are client components.
- **Grid:** 4 columns, 8px gaps, 48px rows, fixed 384px box (7 rows for 26 sizes). Below 300px wide it switches to 3 columns with a taller fixed box.
- **Button content:** `M 9.5` and `W 11 · EU 43`. The price is shown once, above the selector.
- **States never rely on color alone:** low stock = amber dot + "Only N left" status line; selected = black fill + check icon; sold out = gray + strike line + "sold out" in the accessible name. Every state uses the same 2px border, so nothing changes size.
- **Accessibility:** `radiogroup` / `radio` roles, descriptive labels, one Tab stop with Arrow/Home/End navigation that skips sold-out sizes, polite live status line, visible focus rings.
- **Layout stability:** fixed section heights, explicit image dimensions, system font stack (no font swap), skeletons with identical dimensions, error fallback in the same footprint.
- **No invented content:** photos are placeholders, technical details say "Details to be provided", reviews show an empty state.
- A client/server split was needed: shared types live in `lib/sizes.ts` so client components never import Node's `fs`.

## Testing notes

Automated checks (local):
- `npm run typecheck`: passes.
- `npm run build`: passes; the prerendered HTML contains 26 size buttons (17 in stock, 5 low stock, 4 sold out) and the price once.

Browser checks (dev server, 375×553 viewport):
- Photo 250px, name block 88px, size section 520px, grid top at 458px, first row ends at 506px.
- 26 buttons, all 48px tall and 79.75px wide; no horizontal scroll.
- Clicking a sold-out size does nothing; clicking M 9 selects it and shows "M 9 selected. Only 3 left."
- ArrowRight from M 9.5 skips sold-out M 10 and lands on M 10.5; exactly one Tab stop in the group.
- Size label text fits on one line in every button, including the longest (`W 17.5 · EU 50.5`).
- 375×667: grid top 458px, first 3 rows fully visible, no horizontal scroll.
- 320×568: cells 66×48px, no horizontal scroll, grid top 458px. Below 360px the label drops the word "EU" and uses 9px text so it fits (the accessible label keeps it). Below 400px the text is 9px.
- Error state: with `data/stock.json` temporarily renamed, the page shows "Couldn't load sizes" + a 44px Retry button in the same 520px size section; after restoring the file, Retry loads all 26 sizes. (A first version relied on a React error boundary and left the skeleton on screen forever; fixed by catching the error in the server component.)

Known gaps:
- Screen-reader testing and a Lighthouse CLS measurement were not run.
- Data to double check: M 9, M 9.5 and M 10 are low or sold out while neighbouring sizes are well stocked; `launch_date` (2026-12-10) is not used.
