import type { ReactNode } from "react";

type Props = {
  id: string;
  title: string;
  children: ReactNode;
};

export function CategorySection({ id, title, children }: Props) {
  return (
    <section id={id} className="scroll-mt-28 sm:scroll-mt-32 md:scroll-mt-36">
      <div className="relative mb-4 text-center sm:mb-5">
        <h2 className="font-body text-base font-extrabold uppercase tracking-wide text-neutral-900 sm:text-lg md:text-xl">
          {title}
        </h2>
        <div
          aria-hidden
          className="mt-3 h-px w-full bg-[#D0D0D0] sm:mt-3.5"
        />
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3 lg:gap-5">
        {children}
      </div>
    </section>
  );
}
