"""Picks a rule-based template for a document's raw text, if one fits."""

from __future__ import annotations

from backend.extraction.rule_based.base_template import InvoiceTemplate
from backend.extraction.rule_based.templates import ALL_TEMPLATES


def detect_template(text: str) -> InvoiceTemplate | None:
    """Return the first specific (non-fallback) template whose fingerprint matches."""
    for template in ALL_TEMPLATES:
        if template.name == "generic_invoice":
            continue
        if template.matches(text):
            return template
    return None
