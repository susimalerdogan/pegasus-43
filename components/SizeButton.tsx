"use client";

import { sizeAriaLabel, type SizeItem } from "@/lib/sizes";

interface Props {
  size: SizeItem;
  selected: boolean;
  tabStop: boolean;
  onSelect: (sku: string) => void;
}

const base =
  "relative flex h-12 min-w-11 flex-col items-center justify-center rounded-lg border-2 px-0.5 leading-tight " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

export default function SizeButton({ size, selected, tabStop, onSelect }: Props) {
  const soldOut = size.state === "sold_out";
  const low = size.state === "low_stock";

  const look = soldOut
    ? "cursor-not-allowed border-outbg bg-outbg text-outink overflow-hidden"
    : selected
      ? "cursor-pointer border-neutral-900 bg-neutral-900 text-white"
      : "cursor-pointer border-line bg-white text-neutral-900 hover:border-neutral-900";

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-disabled={soldOut || undefined}
      aria-label={sizeAriaLabel(size)}
      data-testid={soldOut ? "size-button-sold-out" : "size-button"}
      data-sku={size.sku}
      data-state={size.state}
      tabIndex={tabStop && !soldOut ? 0 : -1}
      onClick={() => {
        if (!soldOut) onSelect(size.sku);
      }}
      className={`${base} ${look}`}
    >
      <span className="text-[14px] font-semibold">M {size.men}</span>
      <span className={`whitespace-nowrap text-[10px] tracking-tight max-[399px]:text-[9px] ${selected ? "text-neutral-300" : soldOut ? "text-outink" : "text-neutral-600"}`}>
        W {size.women} · <span className="max-[359px]:hidden">EU </span>
        {size.eu}
      </span>

      {low && !selected && (
        <span aria-hidden className="absolute right-[5px] top-[5px] h-2 w-2 rounded-full bg-low" />
      )}
      {selected && (
        <svg
          aria-hidden
          className="absolute right-[5px] top-[5px]"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M2 6.5l3 3 5-6" />
        </svg>
      )}
      {soldOut && (
        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top right, transparent calc(50% - 1px), #767676 50%, transparent calc(50% + 1px))",
          }}
        />
      )}
    </button>
  );
}
