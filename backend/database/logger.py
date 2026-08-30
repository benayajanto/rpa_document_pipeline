"""Structured event logging for backend operations.

This is a local stand-in (structured console logging) with the same call shape as the
call sites expect. Swapping in a real logging backend later means only changing the body
of `TechLogger.log_event` — call sites don't need to change.
"""

from __future__ import annotations

import json
import logging
from typing import Any

logger = logging.getLogger("backend.tech_events")


class TechLogger:
    def log_event(
        self,
        process_type: str,
        function_name: str,
        status: str = "SUCCESS",
        request: dict[str, Any] | None = None,
        response: dict[str, Any] | None = None,
        error: str | None = None,
        meta: dict[str, Any] | None = None,
        execution_time_ms: int | None = None,
    ) -> None:
        payload = {
            "process_type": process_type,
            "function_name": function_name,
            "status": status,
            "request": request,
            "response": response,
            "error": error,
            "meta": meta,
            "execution_time_ms": execution_time_ms,
        }
        logger.info(json.dumps(payload, default=str))

    def close(self) -> None:
        pass
