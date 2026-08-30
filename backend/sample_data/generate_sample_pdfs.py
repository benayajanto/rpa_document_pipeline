"""Generates a handful of fully synthetic sample invoice PDFs.

Every vendor, amount, and address here is made up for demo purposes only -
none of it reflects any real company or transaction. Run this before trying
the app for the first time:

    python -m backend.sample_data.generate_sample_pdfs
"""

from __future__ import annotations

import os

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "generated")

NORTHWIND_LINES = [
    "NORTHWIND RETAIL INVOICE",
    "",
    "Invoice No: NW-2026-00123",
    "Date: 2026-01-15",
    "",
    "Item                     Qty   Unit Price   Total",
    "Widget A                 2     10.00        20.00",
    "Widget B                 1     15.00        15.00",
    "",
    "Subtotal: 35.00",
    "Tax (10%): 3.50",
    "Total Due: 38.50",
]

ACME_LINES = [
    "ACME DISTRIBUTION CO.",
    "PURCHASE INVOICE",
    "",
    "Doc #: ACME-98765",
    "Issued: 15/01/2026",
    "",
    "DESCRIPTION              QTY    PRICE   AMOUNT",
    "Steel Bolts              100    0.50    50.00",
    "Steel Nuts               100    0.30    30.00",
    "",
    "Sub Total          80.00",
    "VAT 11%            8.80",
    "Grand Total        88.80",
]

GENERIC_LINES = [
    "INVOICE",
    "",
    "From: Riverside Office Supplies",
    "Invoice Number: INV-2026-0042",
    "Date: 2026-02-03",
    "",
    "Thank you for your business.",
    "",
    "Total: $128.40",
]


def _write_pdf(filename: str, lines: list[str]) -> str:
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    path = os.path.join(OUTPUT_DIR, filename)

    c = canvas.Canvas(path, pagesize=letter)
    c.setFont("Courier", 11)

    width, height = letter
    y = height - 72
    for line in lines:
        c.drawString(72, y, line)
        y -= 16

    c.save()
    return path


def generate_all() -> list[str]:
    return [
        _write_pdf("northwind_retail_sample.pdf", NORTHWIND_LINES),
        _write_pdf("acme_distribution_sample.pdf", ACME_LINES),
        _write_pdf("generic_invoice_sample.pdf", GENERIC_LINES),
    ]


if __name__ == "__main__":
    paths = generate_all()
    for p in paths:
        print(f"generated {p}")
