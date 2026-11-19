# Nike Pegasus 43 Product Page

Mobile-first product page built with **Next.js (App Router), React, TypeScript and Tailwind CSS**, following [PLAN.md](PLAN.md).
Sizes and stock come from `data/stock.json` (the Pegasus 43 size and stock list), not from hardcoded inventory.

## Setup

Requires Node.js 18.18+ (tested with Node 24) and npm.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. For the intended view, use your browser's device toolbar at **375px** wide.

Other scripts:

```bash
npm run build       # production build
npm run start       # serve the production build
npm run typecheck   # TypeScript check
```

## What is on the page (top to bottom)

1. **Product photos**: fixed 250px area (placeholder images in `public/images/`).
2. **Name, colorway and price** (`$140.00`, shown once, from the JSON): fixed 88px.
3. **Size selector**: fixed 520px section; the grid starts at about 458px on a 375px-wide phone, inside the 553px usable viewport target (667px reference device).
4. **Technical details**: accordion with placeholder copy.
5. **Customer reviews**: empty state (no review data exists).

## Size selector

- All 26 sizes in `display_order`, 4 columns, 48px-tall buttons (min 44px wide).
- Button shows `M 9.5` and `W 11 · EU 43`. The price is not inside the buttons.
- States: **in stock** (white), **low stock** (amber dot, status line "Only N left"), **selected** (black with a check), **sold out** (gray with a strike line, visible but disabled).
- Keyboard: Tab enters the group once; Arrow keys move between sizes (sold-out sizes are skipped), Home/End jump to first/last; Space/Enter select.
- Accessible: `radiogroup`/`radio` roles, labels such as "Men's 9, Women's 10.5, EU 42.5, low stock, only 3 left", and a polite live status line.

## Layout stability

- Every section has a fixed height token (see `app/globals.css` and `components/`).
- Photos have a reserved 3:2 area with explicit `width`/`height`; fonts are the system font stack (no font swap).
- Loading: `Suspense` fallback and `app/loading.tsx` use skeletons with the same dimensions. Error: if the stock data can't be read or validated, the size area shows "Couldn't load sizes" with a Retry button in the same space.

## Data

`data/stock.json` is read on the server by `lib/stock.ts`, validated and sorted by `display_order`.
A size is treated as sold out if `in_stock` is false, `stock_quantity` is 0 or `stock_status` is `sold_out`. Rows missing required fields are skipped with a console warning.

To test the error state, temporarily rename `data/stock.json`, reload, then rename it back and press Retry.

## Placeholders and open items

- Product photos: replace the SVGs in `public/images/` and update `components/Gallery.tsx`.
- Technical details and reviews: no content was provided, so nothing is invented.
- "Size Guide" links to `#size-guide` (no guide page yet).
- Stock data to double check: M 9, M 9.5 and M 10 are low or sold out while neighbouring sizes are well stocked; `launch_date` (2026-12-10) is not used.
