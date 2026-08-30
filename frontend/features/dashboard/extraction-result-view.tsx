import type { ExtractionResult } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export function ExtractionResultView({ extraction }: { extraction: ExtractionResult }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{extraction.method === "rule_based" ? "Rule-based" : "LLM-assisted"}</Badge>
        {extraction.template_name && <Badge>{extraction.template_name.replace(/_/g, " ")}</Badge>}
        <Badge>{Math.round(extraction.confidence * 100)}% confidence</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label="Vendor" value={extraction.vendor_name} />
        <Field label="Document #" value={extraction.document_number} />
        <Field label="Date" value={extraction.document_date} />
        <Field label="Total" value={formatCurrency(extraction.total, extraction.currency)} />
        <Field label="Subtotal" value={formatCurrency(extraction.subtotal, extraction.currency)} />
        <Field label="Tax" value={formatCurrency(extraction.tax, extraction.currency)} />
      </div>

      {extraction.line_items.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2 font-medium">Description</th>
                <th className="px-4 py-2 font-medium">Qty</th>
                <th className="px-4 py-2 font-medium">Unit price</th>
                <th className="px-4 py-2 font-medium">Line total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {extraction.line_items.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 text-gray-700">{item.description}</td>
                  <td className="px-4 py-2 text-gray-700">{item.quantity}</td>
                  <td className="px-4 py-2 text-gray-700">{formatCurrency(item.unit_price, extraction.currency)}</td>
                  <td className="px-4 py-2 text-gray-700">{formatCurrency(item.line_total, extraction.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-gray-400 uppercase">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-gray-900">{value || "—"}</dd>
    </div>
  );
}
