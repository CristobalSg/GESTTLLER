import type { ReactNode } from "react";

type StatItem = {
  label: string;
  value: string;
};

type PageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
  stats?: StatItem[];
};

export function PageShell({ eyebrow, title, description, children, stats }: PageShellProps) {
  const safeStats = stats ?? [];
  const hasStats = safeStats.length > 0;

  return (
    <section className="space-y-6">
      <div className={hasStats ? "grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]" : ""}>
        <article className="rounded-[28px] border border-stone-200/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(120,113,108,0.12)] sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">{eyebrow}</p>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600">{description}</p>

          {children ? <div className="mt-8">{children}</div> : null}
        </article>

        {hasStats ? (
          <article className="rounded-[28px] border border-stone-900/10 bg-[#1f2937] p-6 text-stone-100 shadow-[0_24px_70px_rgba(17,24,39,0.20)] sm:p-8 xl:sticky xl:top-28 xl:self-start">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
              Resumen del módulo
            </p>
            <div className="mt-6 grid gap-3">
              {safeStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <p className="text-sm text-slate-300">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </article>
        ) : null}
      </div>
    </section>
  );
}
