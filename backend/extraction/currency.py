"""Currency detection and locale-aware amount parsing.

Handles the two number-formatting conventions this app needs to support:
- US/generic: comma thousands separator, period decimal ("1,234.56").
- Indonesian Rupiah: period thousands separator, comma decimal, and often no
  decimals at all, sometimes written with a trailing ",-" to mean "even amount,
  no cents" ("Rp1.500.000" or "Rp1.500.000,-").
"""

from __future__ import annotations

import re

_CURRENCY_MARKERS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"\bRp\.?\s*", re.IGNORECASE), "IDR"),
    (re.compile(r"\bIDR\b", re.IGNORECASE), "IDR"),
    (re.compile(r"\$"), "USD"),
    (re.compile(r"\bUSD\b", re.IGNORECASE), "USD"),
]

# Matches a run of digits/./, optionally followed by a trailing ",-" (Indonesian
# convention for "no cents"), immediately after an optional currency marker.
AMOUNT_PATTERN = r"(?:Rp\.?|IDR|USD|\$)?\s*([\d.,]+(?:,-)?)"


def detect_currency(text: str, default: str = "USD") -> str:
    for pattern, code in _CURRENCY_MARKERS:
        if pattern.search(text):
            return code
    return default


def parse_amount(raw: str | None, currency: str) -> float | None:
    """Normalize a matched amount string to a float, given its detected currency."""
    if raw is None:
        return None

    cleaned = raw.strip()
    if cleaned.endswith(",-"):
        cleaned = cleaned[:-2]

    if currency == "IDR":
        # Period = thousands separator, comma = decimal separator.
        cleaned = cleaned.replace(".", "").replace(",", ".")
    else:
        # Comma = thousands separator, period = decimal separator.
        cleaned = cleaned.replace(",", "")

    try:
        return float(cleaned)
    except ValueError:
        return None
