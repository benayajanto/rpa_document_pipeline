from __future__ import annotations

import math
import os
import shutil

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from backend.api.schemas import (
    CreateUnitRequest,
    DocumentListResponse,
    DocumentOut,
    InsertDocumentRequest,
    UnitListResponse,
    UnitOut,
    UpdateUnitRequest,
)
from backend.api.serializers import serialize_document, serialize_unit
from backend.auth import get_current_user_id
from backend.database.db import get_db
from backend.database.logger import TechLogger
from backend.database.models import Document, ExtractionResultRecord, Unit, User
from backend.staging import HISTORY_DIR, STAGING

router = APIRouter(prefix="/api/units", tags=["units"])

ITEMS_PER_PAGE = 6

UNIT_SORT_COLUMNS = {
    "created_at": Unit.created_at,
    "file_amount": Unit.file_amount,
    "uploaded_by": Unit.uploaded_by,
}

DOCUMENT_SORT_COLUMNS = {
    "uploaded_at": Document.uploaded_at,
    "vendor_name": ExtractionResultRecord.vendor_name,
    "total": ExtractionResultRecord.total,
}


def _paginate(query, page: int):
    total_count = query.count()
    total_pages = max(1, math.ceil(total_count / ITEMS_PER_PAGE))
    page = min(max(page, 1), total_pages)
    items = query.offset((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE).all()
    return items, total_pages, total_count


@router.post("", response_model=UnitOut, status_code=201)
def create_unit(
    body: CreateUnitRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    user = db.get(User, user_id)
    unit = Unit(user_id=user_id, file_amount=body.file_amount, uploaded_by=user.name if user else None)
    db.add(unit)
    db.commit()
    return serialize_unit(unit)


@router.patch("/{unit_id}", response_model=UnitOut)
def finalize_unit(
    unit_id: int,
    body: UpdateUnitRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    unit = db.query(Unit).filter_by(id=unit_id, user_id=user_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="not found")

    unit.error_count = body.error_count
    unit.success_count = body.success_count
    unit.status = "complete"
    db.commit()
    return serialize_unit(unit)


@router.get("", response_model=UnitListResponse)
def list_units(
    query: str = Query(""),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    q = db.query(Unit).filter(Unit.user_id == user_id)

    needle = query.strip().lower()
    if needle:
        q = q.filter(Unit.uploaded_by.ilike(f"%{needle}%"))

    sort_col = UNIT_SORT_COLUMNS.get(sort_by, Unit.created_at)
    q = q.order_by(sort_col.desc() if sort_order == "desc" else sort_col.asc())

    items, total_pages, total_count = _paginate(q, page)
    return UnitListResponse(items=[serialize_unit(u) for u in items], total_pages=total_pages, total_count=total_count)


@router.get("/{unit_id}/documents", response_model=DocumentListResponse)
def list_unit_documents(
    unit_id: int,
    query: str = Query(""),
    sort_by: str = Query("uploaded_at"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    unit = db.query(Unit).filter_by(id=unit_id, user_id=user_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="unit not found")

    q = (
        db.query(Document)
        .outerjoin(ExtractionResultRecord, Document.id == ExtractionResultRecord.document_id)
        .filter(Document.unit_id == unit_id, Document.user_id == user_id)
    )

    needle = query.strip().lower()
    if needle:
        like = f"%{needle}%"
        q = q.filter(or_(Document.original_filename.ilike(like), ExtractionResultRecord.vendor_name.ilike(like)))

    sort_col = DOCUMENT_SORT_COLUMNS.get(sort_by, Document.uploaded_at)
    q = q.order_by(sort_col.desc() if sort_order == "desc" else sort_col.asc())

    items, total_pages, total_count = _paginate(q, page)
    return DocumentListResponse(
        items=[serialize_document(d) for d in items], total_pages=total_pages, total_count=total_count
    )


@router.post("/{unit_id}/documents", response_model=DocumentOut, status_code=201)
def insert_document(
    unit_id: int,
    body: InsertDocumentRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    unit = db.query(Unit).filter_by(id=unit_id, user_id=user_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="unit not found")

    staged = STAGING.get(body.staging_id)
    if not staged or staged.user_id != user_id:
        raise HTTPException(status_code=404, detail="staged file not found or already used")

    unit_dir = os.path.join(HISTORY_DIR, str(unit_id))
    os.makedirs(unit_dir, exist_ok=True)
    permanent_path = os.path.join(unit_dir, staged.original_filename)
    shutil.move(staged.temp_path, permanent_path)

    document = Document(
        user_id=user_id,
        unit_id=unit_id,
        original_filename=staged.original_filename,
        stored_path=permanent_path,
        status="processed",
    )
    db.add(document)
    db.flush()

    extraction = staged.extraction
    record = ExtractionResultRecord(
        document_id=document.id,
        vendor_name=extraction["vendor_name"],
        document_number=extraction["document_number"],
        document_date=extraction["document_date"],
        subtotal=extraction["subtotal"],
        tax=extraction["tax"],
        total=extraction["total"],
        currency=extraction.get("currency", "USD"),
        method=extraction["method"],
        template_name=extraction["template_name"],
        confidence=extraction["confidence"],
    )
    record.line_items = extraction["line_items"]
    db.add(record)
    db.commit()

    STAGING.pop(body.staging_id, None)

    tech_logger = TechLogger()
    tech_logger.log_event(
        process_type="Insert Document",
        function_name="insert_document",
        status="SUCCESS",
        meta={"file_name": staged.original_filename, "user_id": user_id, "unit_id": unit_id},
    )

    return serialize_document(document)
