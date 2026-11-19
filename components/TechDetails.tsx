"use client";

import { useState } from "react";

// No spec data was supplied, so the panels hold placeholder copy (no invented specs).
const ROWS = ["Overview", "Fit & Cushioning", "Materials", "Care"];

export default function TechDetails() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section aria-labelledby="tech-heading" className="min-h-[280px] px-4 pt-2">
      <h2 id="tech-heading" className="flex h-11 items-center text-base font-bold">
        Technical Details
      </h2>
      {ROWS.map((title, i) => {
        const isOpen = open === i;
        return (
          <div key={title} className="border-t border-line">
            <h3 className="m-0">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`tech-panel-${i}`}
                id={`tech-btn-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex h-[52px] w-full items-center justify-between text-left font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                {title}
                <svg
                  aria-hidden
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`transition-transform motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </h3>
            <div
              id={`tech-panel-${i}`}
              role="region"
              aria-labelledby={`tech-btn-${i}`}
              className={`grid transition-[grid-template-rows] motion-reduce:transition-none ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden text-neutral-600">
                <p className="pb-4 leading-5">Details to be provided.</p>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
