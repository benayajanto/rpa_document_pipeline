"use client";

import { UploadForm } from "@/features/dashboard/upload/upload-form";

export function DashboardPageContent() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Invoice Extractor</h1>
          <p className="text-gray-600">Upload documents to extract vendor, totals, and line items</p>
        </div>

        <UploadForm />
      </div>
    </div>
  );
}
