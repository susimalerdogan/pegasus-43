// Standalone check (not part of the Next.js app): needs `npm i puppeteer-core` and a local Chrome.
// Usage: node measure.mjs <url> <outDir> [snapshot.json]
import puppeteer from "puppeteer-core";
import fs from "node:fs";

const url = process.argv[2];
const outDir = process.argv[3];
const snapshotPath = process.argv[4];
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
const cdp = await page.createCDPSession();
await cdp.send("Network.enable");
await cdp.send("Network.emulateNetworkConditions", {
  offline: false,
  latency: 150,
  downloadThroughput: (1638.4 * 1024) / 8,
  uploadThroughput: (1638.4 * 1024) / 8,
});
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });

await page.evaluateOnNewDocument(() => {
  window.__samples = [];
  window.__shifts = [];
  const t0 = performance.now();
  const describe = (n) => (n ? (n.getAttribute?.("data-testid") || n.nodeName) : "?");
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        window.__shifts.push({
          t: Math.round(e.startTime),
          value: e.value,
          hadRecentInput: e.hadRecentInput,
          sources: (e.sources || []).map((s) => ({
            node: describe(s.node),
            prev: [s.previousRect.x, s.previousRect.y, s.previousRect.width, s.previousRect.height].map(Math.round),
            curr: [s.currentRect.x, s.currentRect.y, s.currentRect.width, s.currentRect.height].map(Math.round),
          })),
        });
      }
    }).observe({ type: "layout-shift", buffered: true });
  } catch (e) {}
  window.__paints = [];
  try {
    new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__paints.push([e.name, Math.round(e.startTime)])))
      .observe({ type: "paint", buffered: true });
  } catch (e) {}
  const tick = () => {
    // Visible size section (skeleton or real; Next streams the real one in a hidden container first).
    const secs = [...document.querySelectorAll('section[aria-labelledby="size-heading"]')];
    const sec = secs.find((x) => x.getBoundingClientRect().height > 0 && !x.closest("[hidden]"));
    const box = sec ? sec.children[1] : null; // the fixed-height grid box (384px)
    const r = box ? box.getBoundingClientRect() : null;
    const real = sec ? !!sec.querySelector('[data-testid="size-grid"]') : false;
    window.__samples.push({
      t: Math.round(performance.now()),
      top: r ? Math.round((r.top + scrollY) * 100) / 100 : null,
      h: r ? Math.round(r.height * 100) / 100 : null,
      real,
    });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});

const navStart = Date.now();
await page.goto(url, { waitUntil: "load", timeout: 120000 });
const loadMs = Date.now() - navStart;
await new Promise((r) => setTimeout(r, 4000)); // settle: catch late shifts

const result = await page.evaluate(() => ({ samples: window.__samples, shifts: window.__shifts, paints: window.__paints }));
const fp = (result.paints.find((p) => p[0] === "first-paint") || [0, 0])[1];
const allTops = result.samples.filter((s) => s.top !== null);
const preFirstPaint = allTops.filter((s) => s.t < fp);
const tops = allTops.filter((s) => s.t >= fp); // from first paint onward
const distinctTops = [...new Set(tops.map((s) => s.top))];
const heights = [...new Set(tops.map((s) => s.h))];
const firstSeen = tops[0];
const gridShifts = result.shifts.filter((s) => s.sources.some((x) => x.node === "size-grid" || x.node === "BUTTON" || x.node === "DIV"));

// Button sizes + states for all 26 sizes
const buttons = await page.evaluate(() =>
  [...document.querySelectorAll('[data-testid="size-grid"] [role="radio"]')].map((b) => {
    const r = b.getBoundingClientRect();
    return { sku: b.dataset.sku, state: b.dataset.state, testid: b.dataset.testid, w: r.width, h: r.height, disabled: b.getAttribute("aria-disabled") === "true" };
  })
);

let snapshotCheck = null;
if (snapshotPath) {
  const snap = JSON.parse(fs.readFileSync(snapshotPath, "utf8")).sort((a, b) => a.display_order - b.display_order);
  const mismatches = [];
  snap.forEach((r, i) => {
    const b = buttons[i];
    if (!b || b.sku !== r.sku || b.state !== r.stock_status) mismatches.push({ i, expected: [r.sku, r.stock_status], got: b ? [b.sku, b.state] : null });
  });
  snapshotCheck = { snapshotRows: snap.length, buttons: buttons.length, mismatches };
}

// Select an available size and take the mobile screenshot (3x DPR, 375x812).
const target = await page.$('[data-testid="size-button"][data-sku="HV7521-001-065"]'); // M 6.5, in stock
await target.click();
await new Promise((r) => setTimeout(r, 400));
const selectedOk = await page.evaluate(() => document.querySelector('[role="radio"][aria-checked="true"]')?.textContent || null);
const status = await page.evaluate(() => document.querySelector("[aria-live]")?.textContent || "");
await page.screenshot({ path: `${outDir}/mobile-size-selected.png` });

const summary = {
  url,
  conditions: "375x812, DPR 3, mobile emulation, 150ms RTT, 1638.4 Kbps, 4x CPU slowdown, cache disabled (puppeteer-core + Chrome CDP)",
  loadEventMs: loadMs,
  paints: result.paints,
  firstPaintMs: fp,
  gridSamplesBeforeFirstPaint: { count: preFirstPaint.length, distinctTop: [...new Set(preFirstPaint.map((s) => s.top))], distinctHeight: [...new Set(preFirstPaint.map((s) => s.h))] },
  gridTopFirstSampleAfterFirstPaint: firstSeen,
  skeletonToRealSwapAtMs: (tops.find((s) => s.real) || {}).t ?? null,
  firstVisibleGridBoxSampleMs: tops[0]?.t ?? null,
  samplesWithSkeleton: tops.filter((s) => !s.real).length,
  samplesWithRealGrid: tops.filter((s) => s.real).length,
  gridTopDistinctValues: distinctTops,
  gridHeightDistinctValues: heights,
  gridTopMovementPx: distinctTops.length ? Math.max(...distinctTops) - Math.min(...distinctTops) : null,
  sampleCount: tops.length,
  totalCLS: result.shifts.filter((s) => !s.hadRecentInput).reduce((a, s) => a + s.value, 0),
  layoutShiftEntries: result.shifts,
  gridRelatedShiftEntries: gridShifts,
  buttonCount: buttons.length,
  minButtonWidth: Math.min(...buttons.map((b) => b.w)),
  minButtonHeight: Math.min(...buttons.map((b) => b.h)),
  soldOutButtons: buttons.filter((b) => b.state === "sold_out").map((b) => ({ sku: b.sku, w: b.w, h: b.h, disabled: b.disabled, testid: b.testid })),
  stateCounts: buttons.reduce((a, b) => ((a[b.state] = (a[b.state] || 0) + 1), a), {}),
  snapshotCheck,
  selectedAfterClick: selectedOk,
  statusLine: status,
};
fs.writeFileSync(`${outDir}/grid-shift-measurement.json`, JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ ...summary, layoutShiftEntries: summary.layoutShiftEntries.length + " entries", paints: summary.paints }, null, 2));
await browser.close();
