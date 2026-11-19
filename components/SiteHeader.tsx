const btn =
  "grid h-11 w-11 place-items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

export default function SiteHeader() {
  return (
    <header className="flex h-12 items-center justify-between px-1">
      <a href="#" aria-label="Back" className={btn}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </a>
      <span className="font-bold tracking-[0.08em]">SHOP</span>
      <a href="#" aria-label="Bag" className={btn}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M5 8h14l-1 12H6L5 8z" />
          <path d="M9 8a3 3 0 016 0" />
        </svg>
      </a>
    </header>
  );
}
