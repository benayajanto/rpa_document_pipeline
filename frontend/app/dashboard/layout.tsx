import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SidebarNav } from "@/features/dashboard/nav/sidebar-nav";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen flex-col bg-blue-600 md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SidebarNav userName={session.user.name ?? session.user.email ?? "Account"} />
      </div>
      <div className="flex-grow bg-white p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  );
}
