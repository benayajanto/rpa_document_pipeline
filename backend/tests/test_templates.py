from backend.extraction.rule_based.templates.northwind_retail import NorthwindRetailTemplate
from backend.extraction.rule_based.templates.acme_distribution import AcmeDistributionTemplate
from backend.extraction.rule_based.templates.generic_invoice import GenericInvoiceTemplate

NORTHWIND_TEXT = (
    "NORTHWIND RETAIL INVOICE\n"
    "Invoice No: NW-2026-00123\n"
    "Date: 2026-01-15\n"
    "Item Qty Unit Price Total\n"
    "Widget A 2 10.00 20.00\n"
    "Widget B 1 15.00 15.00\n"
    "Subtotal: 35.00\n"
    "Tax (10%): 3.50\n"
    "Total Due: 38.50"
)

ACME_TEXT = (
    "ACME DISTRIBUTION CO.\n"
    "PURCHASE INVOICE\n"
    "Doc #: ACME-98765\n"
    "Issued: 15/01/2026\n"
    "DESCRIPTION QTY PRICE AMOUNT\n"
    "Steel Bolts 100 0.50 50.00\n"
    "Steel Nuts 100 0.30 30.00\n"
    "Sub Total 80.00\n"
    "VAT 11% 8.80\n"
    "Grand Total 88.80"
)

GENERIC_TEXT = (
    "INVOICE\n"
    "From: Riverside Office Supplies\n"
    "Invoice Number: INV-2026-0042\n"
    "Date: 2026-02-03\n"
    "Total: $128.40"
)

GENERIC_RUPIAH_TEXT = (
    "INVOICE\n"
    "From: Toko Sumber Makmur\n"
    "Invoice Number: INV-2026-0099\n"
    "Date: 2026-03-10\n"
    "Total: Rp1.500.000,-"
)


def test_northwind_matches_and_extracts():
    template = NorthwindRetailTemplate()
    assert template.matches(NORTHWIND_TEXT)

    result = template.extract(NORTHWIND_TEXT)
    assert result.vendor_name == "Northwind Retail"
    assert result.document_number == "NW-2026-00123"
    assert result.document_date == "2026-01-15"
    assert result.total == 38.5
    assert result.subtotal == 35.0
    assert result.tax == 3.5
    assert len(result.line_items) == 2
    assert result.line_items[0].description == "Widget A"
    assert result.line_items[0].line_total == 20.0


def test_northwind_does_not_match_other_formats():
    assert not NorthwindRetailTemplate().matches(ACME_TEXT)


def test_acme_matches_and_extracts():
    template = AcmeDistributionTemplate()
    assert template.matches(ACME_TEXT)

    result = template.extract(ACME_TEXT)
    assert result.vendor_name == "Acme Distribution Co."
    assert result.document_number == "ACME-98765"
    assert result.document_date == "2026-01-15"
    assert result.subtotal == 80.0
    assert result.tax == 8.8
    assert result.total == 88.8
    assert len(result.line_items) == 2
    assert result.line_items[1].description == "Steel Nuts"


def test_generic_invoice_fallback_always_matches():
    template = GenericInvoiceTemplate()
    assert template.matches(NORTHWIND_TEXT)
    assert template.matches("literally anything")

    result = template.extract(GENERIC_TEXT)
    assert result.vendor_name == "Riverside Office Supplies"
    assert result.document_number == "INV-2026-0042"
    assert result.document_date == "2026-02-03"
    assert result.total == 128.4
    assert result.currency == "USD"


def test_generic_invoice_parses_rupiah_amounts():
    result = GenericInvoiceTemplate().extract(GENERIC_RUPIAH_TEXT)
    assert result.vendor_name == "Toko Sumber Makmur"
    assert result.currency == "IDR"
    assert result.total == 1_500_000.0
