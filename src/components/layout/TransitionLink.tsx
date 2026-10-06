"use client";

import { cn } from "@/lib/utils";
import { useCurtain } from "@/components/layout/CurtainProvider";

type TransitionLinkProps = {
  href: string;
  children: React.ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export function TransitionLink({
  href,
  children,
  className,
  onClick,
  ...rest
}: TransitionLinkProps) {
  const { navigate } = useCurtain();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Let modifier-key clicks (open in new tab, etc.) pass through normally
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onClick?.(e);
    navigate(href);
  };

  return (
    <a href={href} className={cn(className)} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
