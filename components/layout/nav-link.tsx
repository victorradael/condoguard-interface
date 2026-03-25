"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function NavLink({ href, children, icon }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
        isActive ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white",
      ].join(" ")}
    >
      {icon ? <span className="h-4 w-4 shrink-0">{icon}</span> : null}
      {children}
    </Link>
  );
}
