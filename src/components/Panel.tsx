/**
 * Standard rounded panel that hosts a section of the dashboard. The reference
 * uses these as "tiles" — heavier than a plain card, with internal title.
 */
export function Panel({
  title,
  subtitle,
  right,
  children,
  className = "",
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-card-grad border border-border rounded-2xl p-5 md:p-6 shadow-panel ${className}`}>
      {(title || right) && (
        <div className="flex items-baseline justify-between gap-3 mb-4">
          <div>
            {title ? <h3 className="text-base font-bold m-0 tracking-tight">{title}</h3> : null}
            {subtitle ? <div className="text-muted text-xs mt-0.5">{subtitle}</div> : null}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}
