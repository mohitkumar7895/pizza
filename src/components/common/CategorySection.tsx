import type { ReactNode } from "react";

type Props = {
  id: string;
  title: string;
  children: ReactNode;
};

export function CategorySection({ id, title, children }: Props) {
  return (
    <section id={id} className="scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28 lg:scroll-mt-32">
      <div className="relative mb-2.5 text-center sm:mb-3 md:mb-4">
        <h2 className="font-body text-xs font-extrabold uppercase tracking-wide text-neutral-900 sm:text-sm md:text-base">
          {title}
        </h2>
        <div
          aria-hidden
          className="mt-1.5 h-px w-full bg-[#D0D0D0] sm:mt-2 md:mt-2.5"
        />
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5 md:grid-cols-3 lg:gap-3">
        {children}
      </div>
    </section>
  );
}
