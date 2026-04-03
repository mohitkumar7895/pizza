export function VegIcon({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border-2 border-emerald-600 bg-white ${className}`}
      title="Vegetarian"
      aria-label="Vegetarian"
    >
      <span className="h-2 w-2 rounded-full bg-emerald-600" />
    </span>
  );
}

export function NonVegIcon({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border-2 border-red-700 bg-white ${className}`}
      title="Non-vegetarian"
      aria-label="Non-vegetarian"
    >
      <span className="h-2 w-2 rounded-full bg-red-700" />
    </span>
  );
}
