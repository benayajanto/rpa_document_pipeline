import type { Metadata } from "next";

import { auth } from "@/auth";
import { apiClient } from "@/lib/api-client";
import { UnitsView } from "@/features/dashboard/history/units-view";

export const metadata: Metadata = {
  title: "History — Invoice Extractor",
};

export default async function HistoryPage() {
  const session = await auth();
  const result = session?.backendToken
    ? await apiClient.listUnits(session.backendToken, { page: 1 })
    : { items: [], total_pages: 1, total_count: 0 };

  return <UnitsView initialUnits={result.items} initialTotalPages={result.total_pages} />;
}
