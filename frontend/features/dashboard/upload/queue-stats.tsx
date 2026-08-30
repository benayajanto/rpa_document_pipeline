"use client";

import { FileText, Clock, X, CheckCircle } from "lucide-react";

import type { QueuedFile } from "@/features/dashboard/upload/types";

export function QueueStats({
  queue,
  onClearAll,
}: {
  queue: QueuedFile[];
  onClearAll: () => void;
}) {
  const pendingCount = queue.filter((f) => f.status === "uploaded").length;
  const processingCount = queue.filter((f) => f.status === "processing").length;
  const errorCount = queue.filter((f) => f.uploadDbStatus === "error").length;
  const completedCount = queue.filter((f) => f.uploadDbStatus === "completed").length;

  return (
    <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-600">{queue.length} files uploaded</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-600">{pendingCount} pending</span>
          </div>
          <div className="flex items-center space-x-2">
            <X className="h-5 w-5 text-red-500" />
            <span className="text-sm font-medium text-gray-600">{errorCount} error files</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-600">{completedCount} successful files</span>
          </div>
          {processingCount > 0 && (
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600" />
              <span className="text-sm font-medium text-gray-600">{processingCount} processing</span>
            </div>
          )}
        </div>
        <button
          disabled={queue.length === 0}
          onClick={onClearAll}
          className={
            queue.length > 0
              ? "text-sm font-medium text-red-600 hover:text-red-700"
              : "text-sm font-medium text-red-300"
          }
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
