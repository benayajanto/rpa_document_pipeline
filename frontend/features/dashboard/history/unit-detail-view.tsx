"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FileText } from "lucide-react";

import { apiClient, ApiError, type DocumentRecord } from "@/lib/api-client";
import { Alert } from "@/components/ui/alert";
import { Pagination } from "@/components/ui/pagination";
import { SearchBar, type SortOrder } from "@/features/dashboard/history/search-bar";
import { HistoryCard } from "@/features/dashboard/history/history-card";
import { FileDetailModal } from "@/features/dashboard/history/file-detail-modal";

const SORT_OPTIONS = [
  { value: "uploaded_at", label: "Sort by Date" },
  { value: "vendor_name", label: "Sort by Vendor" },
  { value: "total", label: "Sort by Total" },
];

export function UnitDetailView({
  unitId,
  initialDocuments,
  initialTotalPages,
}: {
  unitId: number;
  initialDocuments: DocumentRecord[];
  initialTotalPages: number;
}) {
  const { data: session } = useSession();

  const [documents, setDocuments] = useState(initialDocuments);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("uploaded_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDocument, setOpenDocument] = useState<DocumentRecord | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const token = session?.backendToken;
    if (!token) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-with-loading-flag pattern
    setIsLoading(true);
    apiClient
      .listUnitDocuments(token, unitId, { page, query, sortBy, sortOrder })
      .then((result) => {
        if (cancelled) return;
        setDocuments(result.items);
        setTotalPages(result.total_pages);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load files.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session?.backendToken, unitId, page, query, sortBy, sortOrder]);

  function updateQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  function updateSortBy(value: string) {
    setSortBy(value);
    setPage(1);
  }

  function toggleSortOrder() {
    setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
    setPage(1);
  }

  async function handleDelete(id: number) {
    const token = session?.backendToken;
    if (!token) return;
    setError(null);
    setDeletingId(id);
    try {
      await apiClient.deleteDocument(token, id);
      setDocuments((current) => current.filter((d) => d.id !== id));
      setOpenDocument((current) => (current?.id === id ? null : current));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete document.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <Link href="/dashboard/history" className="mb-4 inline-block text-sm text-blue-600 hover:underline">
          ← Back to Units
        </Link>

        <SearchBar
          query={query}
          onQueryChange={updateQuery}
          placeholder="Search by filename or vendor…"
          sortBy={sortBy}
          onSortByChange={updateSortBy}
          sortOptions={SORT_OPTIONS}
          sortOrder={sortOrder}
          onToggleSortOrder={toggleSortOrder}
        />

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        <div className="rounded-lg bg-white shadow-sm">
          {documents.length === 0 && !isLoading ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="mb-2 text-lg font-medium text-gray-900">No files found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {documents.map((document) => (
                <HistoryCard
                  key={document.id}
                  document={document}
                  onOpen={() => setOpenDocument(document)}
                  onDelete={() => handleDelete(document.id)}
                  isDeleting={deletingId === document.id}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 flex w-full justify-center">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>

        <FileDetailModal
          document={openDocument}
          isOpen={openDocument !== null}
          onClose={() => setOpenDocument(null)}
        />
      </div>
    </div>
  );
}
