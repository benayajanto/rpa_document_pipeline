import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";
import type { DocumentStatus } from "@/lib/api-client";

const statusClasses: Record<DocumentStatus, string> = {
  processed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  failed: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        statusClasses[status],
      )}
    >
      {status}
    </span>
  );
}

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600",
        className,
      )}
      {...props}
    />
  );
}
