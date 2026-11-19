import { SizesFrame, TitleFrame } from "./SectionFrames";

/** Same grid geometry as the real selector: 48px cells, 8px gaps, fixed box height. */
export function SizeGridSkeleton() {
  return (
    <div
      aria-hidden
      className="grid h-full grid-cols-4 gap-2 overflow-hidden [grid-auto-rows:48px] max-[299px]:grid-cols-3"
    >
      {Array.from({ length: 28 }, (_, i) => (
        <div key={i} className="shimmer h-12 rounded-lg" />
      ))}
    </div>
  );
}

/** Title (88px) + size section (520px) placeholder used while stock loads. */
export function ProductSkeleton() {
  return (
    <div role="status" aria-label="Loading product details">
      <TitleFrame>
        <div className="shimmer h-7 w-48 rounded" />
        <div className="shimmer mt-1 h-5 w-32 rounded" />
        <div className="shimmer mt-0 h-6 w-20 rounded" />
      </TitleFrame>
      <SizesFrame grid={<SizeGridSkeleton />} />
    </div>
  );
}
