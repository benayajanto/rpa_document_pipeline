import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { apiClient, ApiError, type DocumentRecord } from "@/lib/api-client";
import { UnitDetailView } from "@/features/dashboard/history/unit-detail-view";

async function loadDocuments(token: string, unitId: number) {
  try {
    return await apiClient.listUnitDocuments(token, unitId, { page: 1 });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export default async function UnitDetailPage({
  params,
}: PageProps<"/dashboard/history/[unitId]">) {
  const { unitId } = await params;
  const id = Number(unitId);
  if (!Number.isInteger(id)) notFound();

  const session = await auth();
  if (!session?.backendToken) notFound();

  const result: { items: DocumentRecord[]; total_pages: number } = await loadDocuments(session.backendToken, id);

  return <UnitDetailView unitId={id} initialDocuments={result.items} initialTotalPages={result.total_pages} />;
}
