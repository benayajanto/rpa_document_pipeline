import type { DocumentRecord } from "@/lib/api-client";

export type ExtractionStatus = "uploaded" | "processing" | "completed" | "error";
export type InsertStatus = "not-in-stage" | "processing" | "completed" | "error";

export interface QueuedFile {
  id: string;
  file: File;
  status: ExtractionStatus;
  uploadDbStatus: InsertStatus;
  stagingId?: string;
  vendorName?: string;
  total?: number | null;
  currency?: string;
  document?: DocumentRecord;
  error?: string;
  isExiting?: boolean;
}
