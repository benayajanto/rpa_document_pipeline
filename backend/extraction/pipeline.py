"""Orchestrates: load PDF -> get text -> pick a template -> extract -> normalize."""

from __future__ import annotations

import logging
import os

from backend.extraction.format_detector import detect_template
from backend.extraction.llm_assisted.provider import LLMProviderError
from backend.extraction.rule_based.templates.generic_invoice import GenericInvoiceTemplate
from backend.extraction.schema import ExtractionResult


def extract_pdf_text(pdf_path: str) -> str:
    """Extract raw text from a PDF, falling back to OCR for scanned (image-only) pages."""
    import pdfplumber

    with pdfplumber.open(pdf_path) as pdf:
        pages_text = [page.extract_text() or "" for page in pdf.pages]

    text = "\n".join(pages_text)
    if text.strip():
        return text

    return _ocr_pdf(pdf_path)


def _ocr_pdf(pdf_path: str) -> str:
    """Best-effort OCR fallback for PDFs with no extractable text layer (scanned documents)."""
    try:
        import pytesseract
        from pdf2image import convert_from_path
    except ImportError:
        return ""

    images = convert_from_path(pdf_path)
    return "\n".join(pytesseract.image_to_string(image) for image in images)


def _get_llm_provider():
    mode = os.environ.get("EXTRACTION_LLM_PROVIDER", "gemini").lower()
    if mode == "openai":
        from backend.extraction.llm_assisted.openai_provider import OpenAIProvider

        return OpenAIProvider()
    from backend.extraction.llm_assisted.gemini_provider import GeminiProvider

    return GeminiProvider()


def run_extraction(pdf_path: str) -> ExtractionResult:
    """Run the full pipeline on a PDF file and return a normalized ExtractionResult.

    Strategy:
    1. If EXTRACTION_MODE=llm is forced, always use the LLM provider.
    2. Otherwise try to match a known vendor template (rule-based, offline, free).
    3. If nothing matches and an LLM key is configured, try the LLM provider.
    4. Fall back to the generic rule-based template so we never return nothing.
    """
    text = extract_pdf_text(pdf_path)
    force_llm = os.environ.get("EXTRACTION_MODE", "rule_based").lower() == "llm"

    if not force_llm:
        template = detect_template(text)
        if template is not None:
            return template.extract(text)

    try:
        return _get_llm_provider().extract(text)
    except LLMProviderError as exc:
        logging.getLogger(__name__).warning("LLM-assisted extraction failed, falling back to generic template: %s", exc)

    return GenericInvoiceTemplate().extract(text)
