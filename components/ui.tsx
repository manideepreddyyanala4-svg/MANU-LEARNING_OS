import Link from 'next/link';
import type { Route } from 'next';
import type { ReactNode } from 'react';

type PageProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function Page({ eyebrow, title, subtitle, children, actions, className = '' }: PageProps) {
  return (
    <div className={`mx-auto w-full max-w-[1680px] px-5 py-7 md:px-10 md:py-9 ${className}`}>
      <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow && (
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--fg)] md:text-3xl lg:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 max-w-2xl text-sm text-[var(--muted)]">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}

export function Card({
  children,
  className = '',
  href,
}: {
  children: ReactNode;
  className?: string;
  href?: Route;
}) {
  const content = (
    <div
      className={`rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xs transition hover:border-color-mix(in srgb, var(--accent) 30%, var(--line)) ${className}`}
    >
      {children}
    </div>
  );
  return href ? (
    <Link href={href} className="block no-underline">
      {content}
    </Link>
  ) : (
    content
  );
}

export function Empty({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]/60 p-10 text-center">
      {icon && <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)]">{icon}</div>}
      <h3 className="text-base font-bold text-[var(--fg)]">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-[var(--muted)]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
