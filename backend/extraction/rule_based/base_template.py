"""Base class every rule-based invoice template implements."""

from __future__ import annotations

from abc import ABC, abstractmethod

from backend.extraction.schema import ExtractionResult


class InvoiceTemplate(ABC):
    """A template knows how to (a) recognize its own layout and (b) parse it."""

    name: str = "base"

    @abstractmethod
    def matches(self, text: str) -> bool:
        """Return True if this template's fingerprint is present in the document text."""

    @abstractmethod
    def extract(self, text: str) -> ExtractionResult:
        """Parse the raw text into a normalized ExtractionResult."""
