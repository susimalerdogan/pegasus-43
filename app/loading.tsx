import { ProductSkeleton } from "@/components/SizeGridSkeleton";

/** Route-level loading UI: same fixed heights as the loaded page (header 48, photo 250, dots 20, ...). */
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-[560px]">
      <div className="h-12" />
      <div className="shimmer h-[250px]" />
      <div className="h-5" />
      <ProductSkeleton />
    </main>
  );
}
