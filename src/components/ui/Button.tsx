import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "outline" | "subtle" | "cyan";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-semibold tracking-[0.01em] transition-[transform,background-color,border-color,color,box-shadow] duration-[180ms] ease-state active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none select-none";

const variants: Record<Variant, string> = {
  primary: "bg-pink text-on-pink hover:bg-pink-soft hover:scale-105",
  outline: "bg-surface border border-pink/40 text-pink-soft hover:bg-surface-high hover:border-pink",
  cyan: "bg-surface border border-cyan/40 text-cyan hover:bg-surface-high hover:border-cyan",
  ghost: "text-snow/80 hover:text-pink hover:bg-white/5",
  subtle: "bg-surface text-snow hover:bg-surface-high border border-outline-variant",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-[52px] px-6 text-sm",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = React.ComponentProps<"button"> & { variant?: Variant; size?: Size };

export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  return (
    <button className={buttonClasses(variant, size, className)} {...props}>
      <span className="relative inline-flex items-center gap-2">{children}</span>
    </button>
  );
}

type LinkButtonProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: Variant;
  size?: Size;
  external?: boolean;
};

export function LinkButton({ href, variant = "primary", size = "md", className, children, external, ...props }: LinkButtonProps) {
  const cls = buttonClasses(variant, size, className);
  const inner = (
    <>
      <span className="relative inline-flex items-center gap-2">{children}</span>
    </>
  );
  if (external || href.startsWith("http") || href.startsWith("#")) {
    return (
      <a href={href} className={cls} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...props}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...props}>
      {inner}
    </Link>
  );
}
