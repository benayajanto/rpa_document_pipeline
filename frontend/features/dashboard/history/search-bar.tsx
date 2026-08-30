"use client";

import { Search, ArrowUpDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type SortOrder = "asc" | "desc";

export interface SortOption {
  value: string;
  label: string;
}

export function SearchBar({
  query,
  onQueryChange,
  placeholder = "Search…",
  sortBy,
  onSortByChange,
  sortOptions,
  sortOrder,
  onToggleSortOrder,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder?: string;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOptions: SortOption[];
  sortOrder: SortOrder;
  onToggleSortOrder: () => void;
}) {
  return (
    <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(event) => onSortByChange(event.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            onClick={onToggleSortOrder}
            aria-label={`Sort ${sortOrder === "asc" ? "ascending" : "descending"}, click to reverse`}
            title={sortOrder === "asc" ? "Ascending" : "Descending"}
            className="rounded-lg border border-gray-300 p-2 transition-colors hover:bg-gray-50"
          >
            <ArrowUpDown className={cn("h-5 w-5 text-gray-500", sortOrder === "asc" && "scale-y-[-1]")} />
          </button>
        </div>
      </div>
    </div>
  );
}
