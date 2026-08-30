"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { Logo } from "@/components/ui/logo";
import { NavLinks } from "@/features/dashboard/nav/nav-links";

export function SidebarNav({ userName }: { userName: string }) {
  return (
    <div className="flex h-full flex-col bg-blue-600 px-3 py-4 text-white md:px-2">
      <Link
        href="/dashboard"
        className="mb-2 flex h-20 items-center justify-start rounded-md hover:bg-blue-800"
      >
        <div className="w-40 p-4">
          <Logo light />
        </div>
      </Link>

      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-4">
        <NavLinks />

        <div className="hidden w-full grow rounded-md bg-blue-500 md:block" />

        <div className="mb-2 text-sm font-semibold md:mb-0 md:text-base">
          Welcome, <span className="underline">{userName}</span>!
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-blue-500 p-3 text-sm font-medium text-white hover:bg-blue-400 md:flex-none md:justify-start md:p-2 md:px-3"
        >
          <LogOut className="w-6" />
          <div className="hidden md:block">Sign Out</div>
        </button>
      </div>
    </div>
  );
}
