import Link from "next/link";

type Variant = "primary" | "secondary" | "danger";
type Size = "md" | "lg";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-accent-grad text-[#0a1428] hover:brightness-110 shadow-glow",
  secondary:
    "bg-surface-2 text-text border border-border-strong hover:bg-surface-3",
  danger: "bg-danger text-white hover:brightness-110",
};

const SIZE: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
};

function classes(variant: Variant, size: Size, full?: boolean): string {
  return `inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-all active:scale-[0.985] no-underline ${VARIANT[variant]} ${SIZE[size]} ${full ? "w-full" : ""}`;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  full,
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  full?: boolean;
}) {
  return (
    <button {...rest} className={`${classes(variant, size, full)} ${className}`}>
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  children,
  variant = "primary",
  size = "md",
  full,
  className = "",
  target,
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  full?: boolean;
  className?: string;
  target?: string;
}) {
  return (
    <Link
      href={href}
      target={target}
      className={`${classes(variant, size, full)} ${className}`}
    >
      {children}
    </Link>
  );
}
