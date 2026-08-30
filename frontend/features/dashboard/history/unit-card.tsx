"use client";

import { FileText, Calendar, Upload, Eye } from "lucide-react";

import type { Unit } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";

export function UnitCard({ unit, onOpen }: { unit: Unit; onOpen: () => void }) {
  return (
    <div
      className="rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
      onClick={onOpen}
    >
      <div className="cursor-pointer p-6 hover:bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="rounded-lg bg-blue-100 p-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>

            <div className="flex-1">
              <h3 className="mb-1 font-semibold text-gray-900">Invoice Upload</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(unit.created_at)}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Upload className="h-4 w-4" />
                  <span>Uploaded by: {unit.uploaded_by ?? "—"}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-center">
              <p className="text-lg font-semibold text-blue-600">{unit.file_amount}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-green-600">{unit.success_count}</p>
              <p className="text-xs text-gray-500">Complete</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-red-600">{unit.error_count}</p>
              <p className="text-xs text-gray-500">Errors</p>
            </div>

            <button className="rounded-lg p-2 transition-colors hover:bg-gray-200">
              <Eye className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
