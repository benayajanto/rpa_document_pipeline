"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History } from "lucide-react";

import { cn } from "@/lib/utils";

const links = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "History", href: "/dashboard/history", icon: History },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = link.href === "/dashboard" ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.name}
            href={link.href}
            className={cn(
              "flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3",
              isActive && "bg-sky-100 text-blue-600",
            )}
          >
            <Icon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
