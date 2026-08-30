"""Normalized output shape every extraction method must produce."""

from __future__ import annotations

from dataclasses import dataclass, field, asdict


@dataclass
class LineItem:
    description: str
    quantity: float
    unit_price: float
    line_total: float


@dataclass
class ExtractionResult:
    vendor_name: str
    document_number: str
    document_date: str
    line_items: list[LineItem] = field(default_factory=list)
    subtotal: float | None = None
    tax: float | None = None
    total: float | None = None
    currency: str = "USD"
    method: str = "rule_based"
    template_name: str | None = None
    confidence: float = 1.0

    def to_dict(self) -> dict:
        return asdict(self)


REQUIRED_FIELDS = ("vendor_name", "document_number", "document_date", "total")


def is_complete(result: ExtractionResult) -> bool:
    return all(getattr(result, f) not in (None, "") for f in REQUIRED_FIELDS)
