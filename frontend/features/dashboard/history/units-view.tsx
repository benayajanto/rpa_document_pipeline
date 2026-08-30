"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FileText } from "lucide-react";

import { apiClient, ApiError, type Unit } from "@/lib/api-client";
import { Alert } from "@/components/ui/alert";
import { Pagination } from "@/components/ui/pagination";
import { SearchBar, type SortOrder } from "@/features/dashboard/history/search-bar";
import { UnitCard } from "@/features/dashboard/history/unit-card";

const SORT_OPTIONS = [
  { value: "created_at", label: "Sort by Date" },
  { value: "uploaded_by", label: "Sort by Uploader" },
  { value: "file_amount", label: "Sort by File Count" },
];

export function UnitsView({
  initialUnits,
  initialTotalPages,
}: {
  initialUnits: Unit[];
  initialTotalPages: number;
}) {
  const { data: session } = useSession();
  const router = useRouter();

  const [units, setUnits] = useState(initialUnits);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = session?.backendToken;
    if (!token) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-with-loading-flag pattern
    setIsLoading(true);
    apiClient
      .listUnits(token, { page, query, sortBy, sortOrder })
      .then((result) => {
        if (cancelled) return;
        setUnits(result.items);
        setTotalPages(result.total_pages);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load units.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session?.backendToken, page, query, sortBy, sortOrder]);

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <SearchBar
          query={query}
          onQueryChange={updateQuery}
          placeholder="Search by uploader…"
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
          {units.length === 0 && !isLoading ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="mb-2 text-lg font-medium text-gray-900">No units found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {units.map((unit) => (
                <UnitCard key={unit.id} unit={unit} onOpen={() => router.push(`/dashboard/history/${unit.id}`)} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 flex w-full justify-center">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
