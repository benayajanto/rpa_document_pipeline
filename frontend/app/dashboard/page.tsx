import type { Metadata } from "next";

import { DashboardPageContent } from "@/features/dashboard/dashboard-page-content";

export const metadata: Metadata = {
  title: "Dashboard — Invoice Extractor",
};

export default function DashboardPage() {
  return <DashboardPageContent />;
}
