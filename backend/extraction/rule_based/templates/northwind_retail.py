"""Fictional retail invoice layout: 'Northwind Retail'.

Sample layout this template is built to parse:

    NORTHWIND RETAIL INVOICE
    Invoice No: NW-2026-00123
    Date: 2026-01-15

    Item                     Qty   Unit Price   Total
    Widget A                 2     10.00        20.00
    Widget B                 1     15.00        15.00

    Subtotal: 35.00
    Tax (10%): 3.50
    Total Due: 38.50
"""

from __future__ import annotations

import re

from backend.extraction.rule_based.base_template import InvoiceTemplate
from backend.extraction.schema import ExtractionResult, LineItem

FINGERPRINT = "NORTHWIND RETAIL"

ITEM_LINE = re.compile(
    r"^(?P<desc>[A-Za-z][A-Za-z ]*?)\s+(?P<qty>\d+(?:\.\d+)?)\s+(?P<price>\d+(?:\.\d+)?)\s+(?P<total>\d+(?:\.\d+)?)\s*$",
    re.MULTILINE,
)


class NorthwindRetailTemplate(InvoiceTemplate):
    name = "northwind_retail"

    def matches(self, text: str) -> bool:
        return FINGERPRINT in text.upper()

    def extract(self, text: str) -> ExtractionResult:
        invoice_no = _search(r"Invoice No:\s*(\S+)", text)
        date = _search(r"Date:\s*([\d-]+)", text)
        subtotal = _search_float(r"Subtotal:\s*([\d.]+)", text)
        tax = _search_float(r"Tax \([^)]*\):\s*([\d.]+)", text)
        total = _search_float(r"Total Due:\s*([\d.]+)", text)

        items = []
        for m in ITEM_LINE.finditer(text):
            desc = m.group("desc").strip()
            if desc.lower() in ("item", "description"):
                continue
            items.append(
                LineItem(
                    description=desc,
                    quantity=float(m.group("qty")),
                    unit_price=float(m.group("price")),
                    line_total=float(m.group("total")),
                )
            )

        return ExtractionResult(
            vendor_name="Northwind Retail",
            document_number=invoice_no or "",
            document_date=date or "",
            line_items=items,
            subtotal=subtotal,
            tax=tax,
            total=total,
            method="rule_based",
            template_name=self.name,
            confidence=1.0 if invoice_no and total is not None else 0.6,
        )


def _search(pattern: str, text: str) -> str | None:
    m = re.search(pattern, text)
    return m.group(1).strip() if m else None


def _search_float(pattern: str, text: str) -> float | None:
    m = re.search(pattern, text)
    return float(m.group(1)) if m else None
