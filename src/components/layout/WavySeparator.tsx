/** Dark-red zig-zag wavy line under the navbar (more up–down). */
export function WavySeparator() {
  return (
    <div
      className="pointer-events-none flex w-full justify-center bg-white leading-none text-[#D30000]"
      aria-hidden
    >
      <svg
        className="block h-[12px] w-full max-w-none sm:h-[18px]"
        viewBox="0 0 1200 36"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.15}
          vectorEffect="non-scaling-stroke"
          d="M0 18 Q37.5 0 75 18 Q112.5 36 150 18 Q187.5 0 225 18 Q262.5 36 300 18 Q337.5 0 375 18 Q412.5 36 450 18 Q487.5 0 525 18 Q562.5 36 600 18 Q637.5 0 675 18 Q712.5 36 750 18 Q787.5 0 825 18 Q862.5 36 900 18 Q937.5 0 975 18 Q1012.5 36 1050 18 Q1087.5 0 1125 18 Q1162.5 36 1200 18"
        />
      </svg>
    </div>
  );
}
