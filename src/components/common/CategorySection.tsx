import type { ReactNode } from "react";

type Props = {
  id: string;
  title: string;
  children: ReactNode;
};

export function CategorySection({ id, title, children }: Props) {
  return (
    <section id={id} className="scroll-mt-24 sm:scroll-mt-28 md:scroll-mt-32">
      <div className="relative mb-3 text-center sm:mb-4">
        <h2 className="font-body text-sm font-extrabold uppercase tracking-wide text-neutral-900 sm:text-base md:text-lg">
          {title}
        </h2>
        <div
          aria-hidden
          className="mt-2 h-px w-full bg-[#D0D0D0] sm:mt-2.5"
        />
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-2.5 md:grid-cols-3 md:gap-3 lg:gap-3">
        {children}
      </div>
    </section>
  );
}
