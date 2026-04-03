export function Footer() {
  return (
    <footer className="mt-auto bg-[#D00000] px-4 py-3.5 text-center text-white sm:py-4">
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-0">
        <p className="font-logo text-xs leading-none text-white sm:text-sm">
          Designed By
        </p>
        <p className="font-body mt-0.5 text-xl font-extrabold uppercase leading-tight tracking-wide sm:text-2xl sm:tracking-tighter">
          Scan Menu
        </p>
        <p className="font-body mt-1 max-w-md text-[0.6rem] font-semibold uppercase leading-snug tracking-[0.12em] text-white/95 sm:text-[10px] sm:tracking-[0.14em]">
          (Restaurant Marketing Partner)
        </p>
      </div>
    </footer>
  );
}
