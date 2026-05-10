import { HeroIllustration } from "@/components/HeroIllustration";
import { SparkIcon, GlobeIcon, FilterIcon, CalendarIcon } from "@/components/Icons";

export function Hero({
  title,
  subtitle,
  right,
  children,
  showIllustration = true,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  children?: React.ReactNode;
  showIllustration?: boolean;
}) {
  return (
    <div className="relative bg-hero-grad border border-border rounded-2xl p-7 md:p-10 mb-5 shadow-panel overflow-hidden">
      {showIllustration ? <HeroIllustration /> : null}
      <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl md:text-[2.4rem] font-extrabold tracking-tight m-0 leading-[1.1]">
              {title}
            </h1>
            <SparkIcon size={20} className="text-accent" />
          </div>
          {subtitle ? (
            <div className="text-muted text-sm mt-2">{subtitle}</div>
          ) : null}
        </div>
        {right ? <div className="flex gap-2 flex-wrap">{right}</div> : null}
      </div>
      {children ? <div className="relative mt-6">{children}</div> : null}
    </div>
  );
}

/**
 * Filter dropdown styled to match the reference: small accent icon on the
 * left, text label, then dropdown indicator on the right.
 */
const ICONS: Record<string, React.ReactNode> = {
  Site: <GlobeIcon size={14} className="text-accent" />,
  Status: <FilterIcon size={14} className="text-accent" />,
  Range: <CalendarIcon size={14} className="text-accent" />,
};

export function FilterSelect({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name?: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  const icon = ICONS[label];
  return (
    <div className="relative bg-surface border border-border rounded-xl px-3 py-2 flex flex-col min-w-[180px]">
      <div className="flex items-center gap-1.5">
        {icon ?? null}
        <span className="text-[0.65rem] uppercase tracking-wider text-muted-2 font-semibold">
          {label}
        </span>
      </div>
      <select
        name={name}
        defaultValue={defaultValue}
        className="bg-transparent border-0 px-0 py-0.5 text-sm text-text focus:ring-0 focus:outline-none focus:shadow-none cursor-pointer"
        style={{ borderRadius: 0, minHeight: 0 }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-bg">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
