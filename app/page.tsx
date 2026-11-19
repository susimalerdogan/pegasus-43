import { Suspense } from "react";
import SiteHeader from "@/components/SiteHeader";
import Gallery from "@/components/Gallery";
import ProductData from "@/components/ProductData";
import { ProductSkeleton } from "@/components/SizeGridSkeleton";
import TechDetails from "@/components/TechDetails";
import Reviews from "@/components/Reviews";

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-[560px] pb-[env(safe-area-inset-bottom)]">
      <SiteHeader />
      <Gallery />
      <Suspense fallback={<ProductSkeleton />}>
        <ProductData />
      </Suspense>
      <TechDetails />
      <Reviews />
    </main>
  );
}
