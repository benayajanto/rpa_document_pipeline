import type { ReactNode } from "react";

const highlights = [
  "Extract vendor, totals, and line items from PDF invoices",
  "Instant rule-based templates, with an LLM fallback for anything else",
  "Your documents and history, private to your account",
];

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-1">
      <div className="flex w-full items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 p-8 lg:w-1/2">
        <div className="max-w-md text-center text-white">
          <div className="mb-8">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="mb-4 text-4xl font-bold text-white">Invoice Extractor</h1>
            <p className="mb-6 text-lg text-blue-100">
              Turn PDF invoices and receipts into structured, searchable data.
            </p>
            <div className="space-y-4 text-left">
              {highlights.map((text) => (
                <div key={text} className="flex items-start space-x-3">
                  <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-300" />
                  <p className="text-blue-100">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-white p-8 lg:w-1/2">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </main>
  );
}
