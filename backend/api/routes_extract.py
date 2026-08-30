from __future__ import annotations

import os
import shutil
import time
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from backend.api.schemas import ExtractionOut, ExtractStagedResponse
from backend.auth import get_current_user_id
from backend.database.logger import TechLogger
from backend.extraction.pipeline import run_extraction
from backend.staging import STAGING, TEMP_DIR, StagedFile

router = APIRouter(prefix="/api/extract", tags=["extract"])

ALLOWED_EXTENSIONS = {".pdf"}


@router.post("", response_model=ExtractStagedResponse, status_code=201)
def extract_document(file: UploadFile = File(...), user_id: int = Depends(get_current_user_id)):
    start_time = time.perf_counter()
    filename = file.filename or ""
    ext = os.path.splitext(filename)[1].lower()
    if not filename or ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="only .pdf files are supported")

    staging_id = uuid.uuid4().hex
    temp_path = os.path.join(TEMP_DIR, f"{staging_id}{ext}")
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    tech_logger = TechLogger()
    try:
        result = run_extraction(temp_path)
    except Exception as exc:  # noqa: BLE001 - report failure to the client instead of 500ing
        os.remove(temp_path)
        tech_logger.log_event(
            process_type="Extract Document",
            function_name="extract_document",
            status="ERROR",
            error=str(exc),
            meta={"file_name": filename, "user_id": user_id},
            execution_time_ms=int((time.perf_counter() - start_time) * 1000),
        )
        raise HTTPException(status_code=422, detail=f"extraction failed: {exc}") from exc

    STAGING[staging_id] = StagedFile(
        user_id=user_id,
        original_filename=filename,
        temp_path=temp_path,
        extraction=result.to_dict(),
    )

    tech_logger.log_event(
        process_type="Extract Document",
        function_name="extract_document",
        status="SUCCESS",
        request={"file_name": filename},
        response={"vendor_name": result.vendor_name, "total": result.total},
        meta={"file_name": filename, "user_id": user_id},
        execution_time_ms=int((time.perf_counter() - start_time) * 1000),
    )

    return ExtractStagedResponse(
        staging_id=staging_id,
        filename=filename,
        size=os.path.getsize(temp_path),
        extraction=ExtractionOut(**result.to_dict()),
    )


@router.delete("/{staging_id}", status_code=204)
def discard_staged_file(staging_id: str, user_id: int = Depends(get_current_user_id)):
    staged = STAGING.get(staging_id)
    if staged and staged.user_id == user_id:
        _discard(staging_id)


@router.delete("", status_code=204)
def discard_all_staged_files(user_id: int = Depends(get_current_user_id)):
    for staging_id, staged in list(STAGING.items()):
        if staged.user_id == user_id:
            _discard(staging_id)


def _discard(staging_id: str) -> None:
    staged = STAGING.pop(staging_id, None)
    if staged and os.path.exists(staged.temp_path):
        os.remove(staged.temp_path)
