from __future__ import annotations

import json
import os

from backend.extraction.llm_assisted.provider import (
    EXTRACTION_PROMPT,
    LLMProvider,
    LLMProviderError,
)
from backend.extraction.schema import ExtractionResult, LineItem


class OpenAIProvider(LLMProvider):
    def __init__(self, api_key: str | None = None, model: str = "gpt-4o-mini"):
        self.api_key = api_key or os.environ.get("OPENAI_API_KEY")
        self.model = model
        if not self.api_key:
            raise LLMProviderError("OPENAI_API_KEY is not set")

    def extract(self, document_text: str) -> ExtractionResult:
        try:
            from openai import OpenAI
        except ImportError as exc:
            raise LLMProviderError("openai is not installed; run `pip install openai`") from exc

        client = OpenAI(api_key=self.api_key)
        prompt = EXTRACTION_PROMPT.format(document_text=document_text)

        try:
            response = client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
            )
            raw = response.choices[0].message.content
        except Exception as exc:  # noqa: BLE001 - surface any SDK/network error uniformly
            raise LLMProviderError(f"OpenAI request failed: {exc}") from exc

        return _parse_json_response(raw)


def _parse_json_response(raw: str) -> ExtractionResult:
    try:
        data = json.loads(raw)
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
        template_name="openai",
        confidence=0.8,
    )
