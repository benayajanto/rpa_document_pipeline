"""Pluggable interface for LLM-assisted extraction, used when no rule-based
template matches (or when EXTRACTION_MODE=llm is forced)."""

from __future__ import annotations

from abc import ABC, abstractmethod

from backend.extraction.schema import ExtractionResult

EXTRACTION_PROMPT = """You are extracting structured data from an invoice or receipt.
Read the document text below and return ONLY a JSON object with this exact shape:

{{
  "vendor_name": string,
  "document_number": string,
  "document_date": string (ISO 8601, YYYY-MM-DD, best guess if ambiguous),
  "line_items": [{{"description": string, "quantity": number, "unit_price": number, "line_total": number}}],
  "subtotal": number or null,
  "tax": number or null,
  "total": number or null,
  "currency": string (ISO 4217 code, e.g. "USD" or "IDR", best guess from symbols/context)
}}

All numeric fields must be plain numbers, not formatted strings. Watch for regional
number formatting: Indonesian Rupiah amounts commonly use "." as the thousands
separator and "," as the decimal separator (the opposite of US convention), and often
omit cents entirely — e.g. "Rp1.500.000" means 1500000, and a trailing ",-" (as in
"Rp1.500.000,-") means an even amount with no cents. Convert any such amount to its
correct plain numeric value regardless of how it was formatted in the source text.

Document text:
---
{document_text}
---

Return only the JSON object, no commentary, no markdown fences."""


class LLMProvider(ABC):
    @abstractmethod
    def extract(self, document_text: str) -> ExtractionResult:
        """Send the document text to the LLM and parse its JSON reply into an ExtractionResult."""


class LLMProviderError(RuntimeError):
    """Raised when the provider can't be used (missing key, request failure, bad response)."""
