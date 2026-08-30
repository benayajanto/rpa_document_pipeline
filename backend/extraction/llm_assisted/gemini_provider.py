from __future__ import annotations

import json
import os

from backend.extraction.llm_assisted.provider import (
    EXTRACTION_PROMPT,
    LLMProvider,
    LLMProviderError,
)
from backend.extraction.schema import ExtractionResult, LineItem


class GeminiProvider(LLMProvider):
    def __init__(self, api_key: str | None = None, model: str = "gemini-3.6-flash"):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        self.model = model
        if not self.api_key:
            raise LLMProviderError("GEMINI_API_KEY is not set")

    def extract(self, document_text: str) -> ExtractionResult:
        try:
            import google.generativeai as genai
        except ImportError as exc:
            raise LLMProviderError(
                "google-generativeai is not installed; run `pip install google-generativeai`"
            ) from exc

        genai.configure(api_key=self.api_key)
        model = genai.GenerativeModel(self.model)
        prompt = EXTRACTION_PROMPT.format(document_text=document_text)

        try:
            response = model.generate_content(prompt)
            raw = response.text
        except Exception as exc:  # noqa: BLE001 - surface any SDK/network error uniformly
            raise LLMProviderError(f"Gemini request failed: {exc}") from exc

        return _parse_json_response(raw)


def _parse_json_response(raw: str) -> ExtractionResult:
    cleaned = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise LLMProviderError(f"Model did not return valid JSON: {exc}") from exc

    items = [LineItem(**item) for item in data.get("line_items", [])]
    return ExtractionResult(
        vendor_name=data.get("vendor_name", ""),
        document_number=data.get("document_number", ""),
        document_date=data.get("document_date", ""),
        line_items=items,
        subtotal=data.get("subtotal"),
        tax=data.get("tax"),
        total=data.get("total"),
        currency=data.get("currency") or "USD",
        method="llm_assisted",
        template_name="gemini",
        confidence=0.8,
    )
