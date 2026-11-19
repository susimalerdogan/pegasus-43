"use client";

import { startTransition } from "react";
import { useRouter } from "next/navigation";
import { SizesFrame, TitleFrame } from "./SectionFrames";

/** Same 88px + 520px footprint as the real content, so an error never shifts the page. */
export default function SizeGridError() {
  const router = useRouter();
  return (
    <>
      <TitleFrame>
        <h1 className="truncate text-[24px] font-bold leading-7">Nike Pegasus 43</h1>
      </TitleFrame>
      <SizesFrame
        grid={
          <div
            role="alert"
            className="flex h-full flex-col items-center justify-center gap-3 text-neutral-600"
          >
            <span>Couldn&rsquo;t load sizes</span>
            <button
              type="button"
              onClick={() => startTransition(() => router.refresh())}
              className="min-h-11 min-w-11 rounded-full border-2 border-neutral-900 bg-white px-5 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Retry
            </button>
          </div>
        }
      />
    </>
  );
}
