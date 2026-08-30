"""In-memory staging area for extracted-but-not-yet-persisted documents.

Mirrors the original app's staged extract -> review -> insert-to-DB flow, but without a
separate microservice: `/api/extract` stages a result here, `/api/units/{id}/documents`
reads it back to persist, and it's discarded either way. Staged entries don't survive a
process restart, which matches the original's own ephemeral temp-file staging closely
enough for a single-process demo deployment.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import Any

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMP_DIR = os.environ.get("STAGING_DIR", os.path.join(BASE_DIR, "instance", "staging"))
HISTORY_DIR = os.environ.get("HISTORY_DIR", os.path.join(BASE_DIR, "instance", "history_uploads"))

os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(HISTORY_DIR, exist_ok=True)


@dataclass
class StagedFile:
    user_id: int
    original_filename: str
    temp_path: str
    extraction: dict[str, Any] = field(default_factory=dict)


STAGING: dict[str, StagedFile] = {}
