"""Fallback template for invoices that don't match a known vendor layout.

Looks for common generic labels regardless of exact positioning:
'Invoice Number:' / 'Invoice #:', 'Date:', 'Total:' / 'Total Due:' / 'Amount Due:'.
Always reports `matches() == True` as a last resort so the pipeline never
comes back empty-handed; `format_detector` should only reach for this after
every vendor-specific template has failed to match.

Amounts are parsed with currency-aware number formatting (see
`backend.extraction.currency`) so both "$1,234.56" (US) and "Rp1.234.567,-"
(Indonesian Rupiah) style amounts come out as the correct numeric value.
"""

from __future__ import annotations

import re

from backend.extraction.currency import AMOUNT_PATTERN, detect_currency, parse_amount
from backend.extraction.rule_based.base_template import InvoiceTemplate
from backend.extraction.schema import ExtractionResult

TOTAL_PATTERN = re.compile(r"(?:Total Due|Amount Due|Total)\s*:?\s*" + AMOUNT_PATTERN, re.IGNORECASE)


class GenericInvoiceTemplate(InvoiceTemplate):
    name = "generic_invoice"

    def matches(self, text: str) -> bool:
        return True

    def extract(self, text: str) -> ExtractionResult:
        vendor = _search(r"(?:From|Vendor|Bill From):\s*(.+)", text) or "Unknown Vendor"
        doc_no = _search(r"Invoice\s*(?:Number|No\.?|#)\s*:\s*(\S+)", text)
        date = _search(r"Date\s*:\s*([\d/-]+)", text)

        currency = detect_currency(text)
        total_match = TOTAL_PATTERN.search(text)
        total = parse_amount(total_match.group(1), currency) if total_match else None

        return ExtractionResult(
            vendor_name=vendor.strip(),
            document_number=doc_no or "",
            document_date=date or "",
            line_items=[],
            subtotal=None,
            tax=None,
            total=total,
            currency=currency,
            method="rule_based",
            template_name=self.name,
            confidence=0.4 if doc_no and total is not None else 0.15,
        )


def _search(pattern: str, text: str) -> str | None:
    m = re.search(pattern, text)
    return m.group(1).strip() if m else None
