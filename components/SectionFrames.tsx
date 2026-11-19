import type { ReactNode } from "react";

/** Fixed 88px block shared by the real title, its skeleton and the error fallback. */
export function TitleFrame({ children }: { children?: ReactNode }) {
  return <section className="h-[88px] overflow-hidden px-4 pt-3">{children}</section>;
}

export function Legend() {
  const box = "relative inline-block h-3.5 w-3.5 rounded-[4px] border-2";
  return (
    <ul className="flex h-7 items-center gap-3 whitespace-nowrap text-[12px] text-neutral-600">
      <li className="flex items-center gap-1">
        <i className={`${box} border-line bg-white`} /> In stock
      </li>
      <li className="flex items-center gap-1">
        <i className={`${box} border-line bg-white`}>
          <b className="absolute -right-[3px] -top-[3px] h-1.5 w-1.5 rounded-full bg-low" />
        </i>{" "}
        Low stock
      </li>
      <li className="flex items-center gap-1">
        <i className={`${box} border-outbg bg-outbg`} /> Sold out
      </li>
      <li className="flex items-center gap-1">
        <i className={`${box} border-neutral-900 bg-neutral-900`} /> Selected
      </li>
    </ul>
  );
}

/**
 * Fixed-height size section (520px at 375px wide): 8 pad + 44 heading + grid box
 * + 12 gap + 24 status + 28 legend + 20 pad. The grid starts at y = 458px.
 */
export function SizesFrame({ grid, status }: { grid: ReactNode; status?: ReactNode }) {
  return (
    <section aria-labelledby="size-heading" className="sizes-section overflow-hidden px-4 pt-2">
      <div className="flex h-11 items-center justify-between">
        <h2 id="size-heading" className="text-base font-bold">
          Select Size
        </h2>
        <a
          href="#size-guide"
          className="inline-flex min-h-11 items-center text-sm text-neutral-600 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Size Guide
        </a>
      </div>
      <div className="mb-3 h-[var(--grid-h)]">{grid}</div>
      <div className="h-6 text-[13px] leading-6">{status}</div>
      <Legend />
    </section>
  );
}
