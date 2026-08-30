"use client";

import { FileText, Heading, List, Clock, Info, X } from "lucide-react";

import type { DocumentRecord } from "@/lib/api-client";
import { ExtractionResultView } from "@/features/dashboard/extraction-result-view";
import { formatCurrency, formatDate } from "@/lib/utils";

export function FileDetailModal({
  document,
  isOpen,
  onClose,
}: {
  document: DocumentRecord | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen || !document) return null;

  const extraction = document.extraction;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={(event) => event.stopPropagation()}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-6">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{document.original_filename}</h2>
                <p className="text-sm text-gray-500">Uploaded on {formatDate(document.uploaded_at)}</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-gray-200">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="max-h-[calc(90vh-96px)] overflow-y-auto p-6">
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-blue-50 p-4">
                <div className="flex items-center space-x-2">
                  <Heading className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Vendor</span>
                </div>
                <p className="mt-1 truncate text-lg font-bold text-blue-800">
                  {extraction?.vendor_name ?? "—"}
                </p>
              </div>

              <div className="rounded-lg bg-green-50 p-4">
                <div className="flex items-center space-x-2">
                  <List className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Total</span>
                </div>
                <p className="mt-1 text-2xl font-bold text-green-800">
                  {formatCurrency(extraction?.total, extraction?.currency)}
                </p>
              </div>

              <div className="rounded-lg bg-purple-50 p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Template</span>
                </div>
                <p className="mt-1 text-2xl font-bold text-purple-800">
                  {extraction?.template_name?.replace(/_/g, " ") ?? "—"}
                </p>
              </div>

              <div className="rounded-lg bg-orange-50 p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">Status</span>
                </div>
                <div className="mt-1 flex items-center space-x-2">
                  <Info className="h-5 w-5 text-green-600" />
                  <span className="max-w-[150px] overflow-x-auto text-sm font-semibold whitespace-nowrap text-green-700">
                    {document.status}
                  </span>
                </div>
              </div>
            </div>

            {extraction ? (
              <ExtractionResultView extraction={extraction} />
            ) : (
              <p className="text-sm text-gray-400">No extraction result available for this document.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
