"use client";

import { FileText, Calendar, CheckCircle, XCircle, Eye, Trash2 } from "lucide-react";

import type { DocumentRecord } from "@/lib/api-client";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export function HistoryCard({
  document,
  onOpen,
  onDelete,
  isDeleting,
}: {
  document: DocumentRecord;
  onOpen: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const isProcessed = document.status === "processed";

  return (
    <div className="cursor-pointer p-6 transition-colors hover:bg-gray-50" onClick={onOpen}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="rounded-lg bg-blue-100 p-3">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>

          <div className="flex-1">
            <h3 className="mb-1 font-semibold text-gray-900">{document.original_filename}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(document.uploaded_at)}</span>
              </span>
              <span className="flex items-center space-x-1">
                {isProcessed ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className={cn(isProcessed ? "text-green-500" : "text-red-500")}>{document.status}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-center">
            <p className="text-lg font-semibold text-blue-600">
              {formatCurrency(document.extraction?.total, document.extraction?.currency)}
            </p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-green-600">{document.extraction?.line_items.length ?? 0}</p>
            <p className="text-xs text-gray-500">Line items</p>
          </div>

          <button
            className="rounded-lg p-2 transition-colors hover:bg-gray-200"
            onClick={(event) => {
              event.stopPropagation();
              onOpen();
            }}
          >
            <Eye className="h-5 w-5 text-gray-600" />
          </button>
          <button
            disabled={isDeleting}
            className="rounded-lg p-2 transition-colors hover:bg-red-100 disabled:opacity-50"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-5 w-5 text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
