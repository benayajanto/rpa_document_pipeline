"""Fictional wholesale invoice layout: 'Acme Distribution Co.'.

Sample layout this template is built to parse:

    ACME DISTRIBUTION CO.
    PURCHASE INVOICE
    Doc #: ACME-98765
    Issued: 15/01/2026

    DESCRIPTION              QTY    PRICE   AMOUNT
    Steel Bolts              100    0.50    50.00
    Steel Nuts               100    0.30    30.00

    Sub Total          80.00
    VAT 11%            8.80
    Grand Total        88.80
"""

from __future__ import annotations

import re

from backend.extraction.rule_based.base_template import InvoiceTemplate
from backend.extraction.schema import ExtractionResult, LineItem

FINGERPRINT = "ACME DISTRIBUTION"

ITEM_LINE = re.compile(
    r"^(?P<desc>[A-Za-z][A-Za-z ]*?)\s+(?P<qty>\d+(?:\.\d+)?)\s+(?P<price>\d+(?:\.\d+)?)\s+(?P<amount>\d+(?:\.\d+)?)\s*$",
    re.MULTILINE,
)


class AcmeDistributionTemplate(InvoiceTemplate):
    name = "acme_distribution"

    def matches(self, text: str) -> bool:
        return FINGERPRINT in text.upper()

    def extract(self, text: str) -> ExtractionResult:
        doc_no = _search(r"Doc #:\s*(\S+)", text)
        raw_date = _search(r"Issued:\s*([\d/]+)", text)
        date = _to_iso_date(raw_date)
        subtotal = _search_float(r"Sub Total\s+([\d.]+)", text)
        tax = _search_float(r"VAT\s+\d+%\s+([\d.]+)", text)
        total = _search_float(r"Grand Total\s+([\d.]+)", text)

        items = []
        for m in ITEM_LINE.finditer(text):
            desc = m.group("desc").strip()
            if desc.upper() in ("DESCRIPTION",):
                continue
            items.append(
                LineItem(
                    description=desc,
                    quantity=float(m.group("qty")),
                    unit_price=float(m.group("price")),
                    line_total=float(m.group("amount")),
                )
            )

        return ExtractionResult(
            vendor_name="Acme Distribution Co.",
            document_number=doc_no or "",
            document_date=date or "",
            line_items=items,
            subtotal=subtotal,
            tax=tax,
            total=total,
            method="rule_based",
            template_name=self.name,
            confidence=1.0 if doc_no and total is not None else 0.6,
        )


def _search(pattern: str, text: str) -> str | None:
    m = re.search(pattern, text)
    return m.group(1).strip() if m else None


def _search_float(pattern: str, text: str, flags=0) -> float | None:
    m = re.search(pattern, text, flags)
    return float(m.group(1)) if m else None


def _to_iso_date(raw: str | None) -> str | None:
    if not raw:
        return None
    day, month, year = raw.split("/")
    return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
