import type { Product } from "@/lib/sizes";
import { TitleFrame } from "./SectionFrames";

/** Name, colorway and the single price on the page (88px, single lines so nothing wraps). */
export default function TitleBlock({ product }: { product: Product }) {
  return (
    <TitleFrame>
      <h1 className="truncate text-[24px] font-bold leading-7">{product.name}</h1>
      <p className="mt-1 truncate text-[14px] leading-5 text-neutral-600">{product.colorway}</p>
      <p className="text-[18px] font-bold leading-6 tabular-nums">{product.priceLabel}</p>
    </TitleFrame>
  );
}
