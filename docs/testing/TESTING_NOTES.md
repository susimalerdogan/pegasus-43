# Testing notes (live production URL)

Tested URL: **https://pegasus-43.vercel.app** (Vercel Hobby, deployed from `susimalerdogan/pegasus-43`, `main`).
Test date: 25 November 2026. Stock data under test: Pegasus Size and Stock Snapshot, 8 December 2026.

## 1. Mobile Lighthouse (performance budget: score >= 90)

Tool: Lighthouse 13.6.0 command line, mobile form factor, default simulated throttling (150 ms RTT, 1638.4 Kbps, 4x CPU slowdown), local Chrome (headless) on a Mac, run against the public URL (not localhost). Eight separate runs:

| Run | Performance | FCP | LCP | TBT | CLS | Time (UTC) |
|---|---|---|---|---|---|---|
| 1 | 72 | 1.0 s | 1.0 s | 1,970 ms | 0 | 07:47:54Z |
| 2 | 100 | 0.8 s | 1.5 s | 60 ms | 0 | 07:48:40Z |
| 3 | 98 | 0.9 s | 1.6 s | 140 ms | 0 | 07:48:52Z |
| 4 | 97 | 0.9 s | 0.9 s | 210 ms | 0 | 07:49:25Z |
| 5 | 99 | 0.9 s | 1.4 s | 140 ms | 0 | 07:49:51Z |
| 6 | 97 | 0.9 s | 1.7 s | 180 ms | 0 | 07:50:10Z |
| 7 | 99 | 0.9 s | 0.9 s | 110 ms | 0 | 07:50:29Z |
| 8 | 97 | 0.9 s | 0.9 s | 190 ms | 0 | 07:50:46Z |

- **Median performance score: 97.5**; range 72 to 100; **7 of 8 runs scored 90 or higher.**
- **Run 1 scored 72**, below the budget. Its total blocking time was 1,970 ms, caused by one 1.8 s long task that Lighthouse could not attribute to a script. The next seven runs on the same URL did not reproduce it. I do not know the cause (possible causes: a cold first run of the browser or the deployment, or load on the test machine); this is not confirmed.
- The 72 is therefore **not** hidden: the budget (>= 90) holds in 7 of 8 runs and for the median, but it did not hold in every run.
- Other categories (run 6): performance 97, accessibility 100, best practices 96, SEO 100.
- Saved: `lighthouse-report-mobile-run6-score97.html` / `.json` (a run close to the median) and `lighthouse-run1-outlier-score72.json`.

## 2. Size-grid layout shift (budget: 0 px)

Tool: `measure-grid-shift.mjs` (puppeteer-core driving Chrome through the DevTools protocol). Conditions: 375 x 812 CSS px, device pixel ratio 3, mobile emulation, 150 ms RTT, 1638.4 Kbps, 4x CPU slowdown, cache disabled. The position of the 384 px size-grid box (the skeleton, then the real `[data-testid="size-grid"]`) was sampled every animation frame from navigation until 4 s after the load event, together with the browser's layout-shift entries.

- First paint: 680 ms; load event: 1218 ms; skeleton replaced by the real grid at 960 ms.
- Grid box top: **[458] px** the whole time from first paint (distinct values seen); height **[384] px**. **Movement: 0 px.**
- Layout-shift entries reported by the browser: **0**; total CLS **0**. Lighthouse also reported CLS 0 in all 8 runs.
- Note: Next.js streams the real grid into a hidden container before swapping it over the skeleton. A first version of the script measured that hidden copy (top 0, height 0) and wrongly showed a 458 px move; the final script measures the visible box. Both versions agree that the browser reported no layout shifts.

## 3. Size buttons and stock data (live page)

- 26 size buttons, in the same order and with the same state as the 8 December 2026 snapshot (0 mismatches, checked by SKU).
- State counts: **10 in stock, 7 low stock, 9 sold out.**
- Smallest button: **79.75 x 48 px** (budget: at least 44 px; the 48 px height is the layout rule). This includes the 9 sold-out buttons, which are all visible, `aria-disabled` and use `data-testid="size-button-sold-out"`.
- Clicking M 6.5 selected it ("M 6.5 selected."). Screenshot: `mobile-size-selected.png` (1125 x 2436 px = 375 x 812 CSS px at 3x).

## Limitations

- **Chrome DevTools MCP was not available**, so these are not DevTools-MCP traces. The grid measurement used the same DevTools protocol through puppeteer-core, and Lighthouse used its own command line. No manual DevTools Performance-panel recording was made.
- Lighthouse throttling was the default *simulated* kind, from one Mac, on one network. Scores vary between runs (72 to 100 here); other machines may score differently.
- Only a 375 x 812 viewport was tested on the live site. Screen readers were not tested. The photos are placeholders.
- The screenshot was taken with the same throttling settings; it shows the final loaded state, not a loading state.
