"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import type { SizeItem } from "@/lib/sizes";
import SizeButton from "./SizeButton";
import { SizesFrame } from "./SectionFrames";

export default function SizeSelector({ sizes }: { sizes: SizeItem[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const firstEnabled = sizes.find((s) => s.state !== "sold_out")?.sku ?? null;
  const tabStop = selected ?? firstEnabled; // roving tabindex: one Tab stop for the group
  const current = sizes.find((s) => s.sku === selected);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const grid = gridRef.current;
    if (!grid) return;
    const buttons = Array.from(grid.querySelectorAll<HTMLButtonElement>('[role="radio"]'));
    const idx = buttons.findIndex((b) => b === document.activeElement);
    if (idx < 0) return;

    const enabled = (i: number) => sizes[i]?.state !== "sold_out";
    const cols = getComputedStyle(grid).gridTemplateColumns.split(" ").length || 1;

    // Walk in one direction until an enabled size is found (sold-out sizes are skipped).
    const walk = (from: number, step: number) => {
      for (let i = from + step; i >= 0 && i < buttons.length; i += step) {
        if (enabled(i)) return i;
      }
      return -1;
    };

    let target = -1;
    switch (e.key) {
      case "ArrowRight":
        target = walk(idx, 1);
        break;
      case "ArrowLeft":
        target = walk(idx, -1);
        break;
      case "ArrowDown":
        target = walk(idx, cols);
        break;
      case "ArrowUp":
        target = walk(idx, -cols);
        break;
      case "Home":
        target = walk(-1, 1);
        break;
      case "End":
        target = walk(buttons.length, -1);
        break;
      default:
        return;
    }
    e.preventDefault();
    if (target >= 0) {
      buttons[target].focus();
      setSelected(sizes[target].sku);
    }
  }

  const status = current
    ? current.state === "low_stock"
      ? `M ${current.men} selected. Only ${current.quantity} left.`
      : `M ${current.men} selected.`
    : "";

  return (
    <SizesFrame
      grid={
        <div
          ref={gridRef}
          role="radiogroup"
          data-testid="size-grid"
          aria-labelledby="size-heading"
          onKeyDown={onKeyDown}
          className="grid h-full grid-cols-4 gap-2 [grid-auto-rows:48px] max-[299px]:grid-cols-3"
        >
          {sizes.map((s) => (
            <SizeButton
              key={s.sku}
              size={s}
              selected={s.sku === selected}
              tabStop={s.sku === tabStop}
              onSelect={setSelected}
            />
          ))}
        </div>
      }
      status={
        <p aria-live="polite" className="m-0">
          {status}
        </p>
      }
    />
  );
}
