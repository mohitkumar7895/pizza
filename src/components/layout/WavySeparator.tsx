/** Thin dark-red sinusoidal line under the navbar (full width). */
export function WavySeparator() {
  return (
    <div
      className="pointer-events-none flex w-full justify-center bg-white leading-none text-[#D30000]"
      aria-hidden
    >
      <svg
        className="block h-[7px] w-full max-w-none sm:h-[12px]"
        viewBox="0 0 1200 20"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.35}
          vectorEffect="non-scaling-stroke"
          d="M0 10 Q75 1 150 10 T300 10 T450 10 T600 10 T750 10 T900 10 T1050 10 T1200 10"
        />
      </svg>
    </div>
  );
}
