import clsx, { type ClassValue } from "clsx";

export function cn(...values: ClassValue[]): string {
  return clsx(...values);
}

export function formatCurrency(value: number | null | undefined, currency: string = "USD"): string {
  if (value === null || value === undefined) return "—";
  const locale = currency === "IDR" ? "id-ID" : "en-US";
  // Rupiah amounts are conventionally shown with no decimal places.
  const fractionDigits = currency === "IDR" ? 0 : 2;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(parsed);
}

export function formatFileSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export type PageToken = number | "...";

export function generatePagination(currentPage: number, totalPages: number): PageToken[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, "...", totalPages - 1, totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, 2, "...", totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}
