/** Fixed 432px section. No review data exists, so it shows an empty state (nothing is fabricated). */
export default function Reviews() {
  return (
    <section aria-labelledby="reviews-heading" className="px-4 pb-6 pt-2">
      <h2 id="reviews-heading" className="flex h-11 items-center text-base font-bold">
        Customer Reviews
      </h2>
      <div className="grid h-[388px] place-items-center rounded-lg border border-dashed border-line text-neutral-600">
        <p>No reviews yet.</p>
      </div>
    </section>
  );
}
