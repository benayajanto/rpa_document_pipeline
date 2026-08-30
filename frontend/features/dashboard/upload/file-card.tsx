import { File, X, Clock, CheckCircle, AlertCircle, CheckCheck } from "lucide-react";

import { cn, formatFileSize, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { QueuedFile } from "@/features/dashboard/upload/types";

function cardColor(item: QueuedFile): string {
  if (item.uploadDbStatus === "completed") return "border-blue-200 bg-blue-50";
  switch (item.status) {
    case "processing":
      return "border-blue-200 bg-blue-50";
    case "completed":
      return "border-green-200 bg-green-50";
    case "error":
      return "border-red-200 bg-red-50";
    default:
      return "border-gray-200 bg-gray-50";
  }
}

function StatusIcon({ status }: { status: QueuedFile["status"] }) {
  if (status === "uploaded") return <Clock className="h-5 w-5 flex-shrink-0 text-gray-500" />;
  if (status === "processing") {
    return <div className="h-5 w-5 flex-shrink-0 animate-spin rounded-full border-b-2 border-blue-600" />;
  }
  if (status === "completed") return <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />;
  return <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />;
}

export function FileCard({
  item,
  onRemove,
  onProcess,
}: {
  item: QueuedFile;
  onRemove: (id: string) => void;
  onProcess: (id: string) => void;
}) {
  const canRemove = item.status !== "processing" && item.uploadDbStatus !== "processing" && !item.isExiting;

  return (
    <div className={cn("relative rounded-lg border p-4 pt-6 pr-6 transition-colors", cardColor(item), item.isExiting && "card-exit")}>
      {canRemove && (
        <button
          onClick={() => onRemove(item.id)}
          aria-label="Remove file"
          className="absolute top-2 right-2 rounded-full bg-white p-2 text-red-600 shadow hover:text-red-700"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="flex items-start gap-3">
        <File className="mt-1 h-8 w-8 flex-shrink-0 text-red-500" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium text-gray-900">{item.file.name}</p>
            <StatusIcon status={item.status} />
          </div>
          <p className="text-gray-700">{formatFileSize(item.file.size)}</p>

          {item.status === "uploaded" && (
            <div className="mt-3">
              <Button size="sm" onClick={() => onProcess(item.id)}>
                Process
              </Button>
            </div>
          )}

          {item.status === "processing" && (
            <div className="mt-2">
              <div className="h-2 overflow-hidden rounded-full bg-blue-200">
                <div className="h-full w-3/5 animate-pulse rounded-full bg-blue-600" />
              </div>
              <p className="mt-1 text-sm text-blue-600">Processing...</p>
            </div>
          )}

          {item.status === "completed" && item.uploadDbStatus === "not-in-stage" && (
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div className="rounded bg-blue-100 p-2">
                <p className="text-xs text-blue-700">Vendor</p>
                <p className="truncate font-semibold text-blue-800">{item.vendorName}</p>
              </div>
              <div className="rounded bg-green-100 p-2">
                <p className="text-xs text-green-700">Total</p>
                <p className="font-semibold text-green-800">{formatCurrency(item.total, item.currency)}</p>
              </div>
            </div>
          )}

          {item.status === "error" && (
            <div className="mt-4 flex items-center space-x-2 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
              <p className="text-red-700">{item.error}</p>
            </div>
          )}

          {item.uploadDbStatus === "processing" && (
            <div className="mt-2">
              <div className="h-2 overflow-hidden rounded-full bg-blue-200">
                <div className="h-full w-3/5 animate-pulse rounded-full bg-blue-600" />
              </div>
              <p className="mt-1 text-sm text-blue-600">Uploading to Database...</p>
            </div>
          )}

          {item.uploadDbStatus === "completed" && (
            <div className="mt-4 flex items-center space-x-2 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <CheckCheck className="h-5 w-5 flex-shrink-0 text-blue-600" />
              <p className="text-blue-700">Successful</p>
            </div>
          )}

          {item.uploadDbStatus === "error" && (
            <div className="mt-4 flex items-center space-x-2 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
              <p className="text-red-700">{item.error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
