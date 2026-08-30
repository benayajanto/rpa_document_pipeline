"use client";

import { useRef, useState, type DragEvent } from "react";
import { useSession } from "next-auth/react";
import { Upload, Database } from "lucide-react";

import { apiClient, ApiError } from "@/lib/api-client";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FileCard } from "@/features/dashboard/upload/file-card";
import { QueueStats } from "@/features/dashboard/upload/queue-stats";
import type { QueuedFile } from "@/features/dashboard/upload/types";
import { cn } from "@/lib/utils";

export function UploadForm() {
  const { data: session } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isInserting, setIsInserting] = useState(false);

  function enqueueFiles(files: FileList | File[]) {
    setError(null);
    const pdfFiles = Array.from(files).filter((file) => file.name.toLowerCase().endsWith(".pdf"));
    const skipped = files.length - pdfFiles.length;

    if (skipped > 0) {
      setError(`${skipped} skipped - only PDF files are supported`);
      setTimeout(() => setError(null), 5000);
    }

    const items: QueuedFile[] = pdfFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      status: "uploaded",
      uploadDbStatus: "not-in-stage",
    }));

    setQueue((current) => [...items, ...current]);
  }

  async function processFile(id: string) {
    const target = queue.find((item) => item.id === id);
    if (!target || !session?.backendToken) return;

    setQueue((current) => current.map((item) => (item.id === id ? { ...item, status: "processing" } : item)));

    try {
      const staged = await apiClient.extractDocument(session.backendToken, target.file);
      setQueue((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "completed",
                stagingId: staged.staging_id,
                vendorName: staged.extraction.vendor_name,
                total: staged.extraction.total,
                currency: staged.extraction.currency,
              }
            : item,
        ),
      );
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Extraction failed.";
      setQueue((current) => current.map((item) => (item.id === id ? { ...item, status: "error", error: message } : item)));
    }
  }

  async function processAllFiles() {
    const pending = queue.filter((item) => item.status === "uploaded");
    await Promise.all(pending.map((item) => processFile(item.id)));
  }

  function handleRemove(id: string) {
    if (!session?.backendToken) return;
    const target = queue.find((item) => item.id === id);
    if (target?.stagingId) void apiClient.discardStaged(session.backendToken, target.stagingId);

    setQueue((current) => current.map((item) => (item.id === id ? { ...item, isExiting: true } : item)));
    setTimeout(() => {
      setQueue((current) => current.filter((item) => item.id !== id));
    }, 350);
  }

  function handleClearAll() {
    if (session?.backendToken) void apiClient.discardAllStaged(session.backendToken);
    setQueue([]);
  }

  async function insertToDatabase() {
    const token = session?.backendToken;
    if (!token) return;

    const readyFiles = queue.filter((item) => item.status === "completed" && item.uploadDbStatus === "not-in-stage");
    if (readyFiles.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to insert "${readyFiles.length}" file(s) into the database?`,
    );
    if (!confirmed) return;

    setIsInserting(true);

    try {
      const unit = await apiClient.createUnit(token, readyFiles.length);

      let errorCount = 0;
      let successCount = 0;

      await Promise.all(
        readyFiles.map(async (item) => {
          setQueue((current) =>
            current.map((f) => (f.id === item.id ? { ...f, uploadDbStatus: "processing" } : f)),
          );
          try {
            const document = await apiClient.insertDocument(token, unit.id, item.stagingId!);
            successCount += 1;
            setQueue((current) =>
              current.map((f) => (f.id === item.id ? { ...f, uploadDbStatus: "completed", document } : f)),
            );
          } catch (err) {
            errorCount += 1;
            const message = err instanceof ApiError ? err.message : "Failed to save to database.";
            setQueue((current) =>
              current.map((f) => (f.id === item.id ? { ...f, status: "error", uploadDbStatus: "error", error: message } : f)),
            );
          }
        }),
      );

      await apiClient.finalizeUnit(token, unit.id, errorCount, successCount);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create the upload batch.");
    } finally {
      setIsInserting(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files.length > 0) enqueueFiles(event.dataTransfer.files);
  }

  const pendingCount = queue.filter((item) => item.status === "uploaded").length;
  const readyToInsertCount = queue.filter(
    (item) => item.status === "completed" && item.uploadDbStatus === "not-in-stage",
  ).length;

  return (
    <>
      <QueueStats queue={queue} onClearAll={handleClearAll} />

      <div className="mb-6 rounded-lg bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-xl font-semibold text-gray-800">Upload PDF Documents</h2>

        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "rounded-lg border-2 border-dashed p-12 text-center transition-colors",
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
          )}
        >
          <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className="mb-2 text-lg text-gray-600">
            Drag and drop your PDF files here, or{" "}
            <label className="cursor-pointer text-blue-600 underline hover:text-blue-700">
              browse
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                multiple
                className="hidden"
                onChange={(event) => {
                  if (event.target.files?.length) enqueueFiles(event.target.files);
                  event.target.value = "";
                }}
              />
            </label>
          </p>
          <p className="text-sm text-gray-500">PDF files only, up to 16MB each</p>
        </div>

        {error && (
          <Alert variant="error" className="mt-4">
            {error}
          </Alert>
        )}

        {pendingCount > 0 && (
          <div className="mt-6">
            <Button className="w-full" onClick={() => void processAllFiles()}>
              Process All Files ({pendingCount})
            </Button>
          </div>
        )}
      </div>

      {queue.length > 0 && (
        <div className="relative rounded-lg bg-white p-6 shadow-lg">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Files ({queue.length})</h3>
            {readyToInsertCount > 0 && (
              <Button size="sm" isLoading={isInserting} onClick={() => void insertToDatabase()}>
                <Database className="h-4 w-4" />
                {isInserting ? "Uploading..." : "Upload to Database"}
              </Button>
            )}
          </div>
          <div className="space-y-4">
            {queue.map((item) => (
              <FileCard key={item.id} item={item} onRemove={handleRemove} onProcess={(id) => void processFile(id)} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
