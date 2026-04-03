interface FooterProps {
  isLoading?: boolean;
}

export function Footer({ isLoading = false }: FooterProps) {
  return (
    <footer className="mt-auto bg-[#D00000] px-4 py-3.5 text-center text-white sm:py-4">
      {isLoading && (
        <div className="mb-3 flex items-center justify-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></div>
          <p className="text-sm font-medium">Loading menu…</p>
        </div>
      )}
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
