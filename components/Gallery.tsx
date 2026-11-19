"use client";

import Image from "next/image";
import { useRef, useState } from "react";

// Placeholder images until real product photos are added to public/images/.
const PHOTOS = [
  "/images/placeholder-1.svg",
  "/images/placeholder-2.svg",
  "/images/placeholder-3.svg",
];

/** 250px photo area (3:2 at 375px wide, reserved with a gray background) + 20px dots row. */
export default function Gallery() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  return (
    <>
      <section aria-label="Product photos" className="h-[250px] overflow-hidden bg-[#f0f0f0]">
        <div
          ref={trackRef}
          tabIndex={0}
          aria-label="Photo carousel, scroll horizontally"
          onScroll={(e) => {
            const el = e.currentTarget;
            setIndex(Math.round(el.scrollLeft / el.clientWidth));
          }}
          className="flex h-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600"
        >
          {PHOTOS.map((src, i) => (
            <div key={src} className="h-full flex-[0_0_100%] snap-start">
              <Image
                src={src}
                alt={`Nike Pegasus 43 placeholder photo ${i + 1} of ${PHOTOS.length}`}
                width={750}
                height={500}
                priority={i === 0}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>
      <div aria-hidden className="flex h-5 items-center justify-center gap-2">
        {PHOTOS.map((_, i) => (
          <i
            key={i}
            className={`h-2 w-2 rounded-full ${i === index ? "bg-neutral-900" : "bg-line"}`}
          />
        ))}
      </div>
    </>
  );
}
