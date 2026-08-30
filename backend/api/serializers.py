from __future__ import annotations

from backend.api.schemas import DocumentOut, ExtractionOut, UnitOut
from backend.database.models import Document, Unit


def serialize_extraction(document: Document) -> ExtractionOut | None:
    if not document.result:
        return None
    return ExtractionOut(**document.result.to_dict())


def serialize_document(document: Document) -> DocumentOut:
    return DocumentOut(
        id=document.id,
        unit_id=document.unit_id,
        original_filename=document.original_filename,
        status=document.status,
        uploaded_at=document.uploaded_at,
        extraction=serialize_extraction(document),
    )


def serialize_unit(unit: Unit) -> UnitOut:
    return UnitOut(
        id=unit.id,
        file_amount=unit.file_amount,
        error_count=unit.error_count,
        success_count=unit.success_count,
        status=unit.status,
        uploaded_by=unit.uploaded_by,
        created_at=unit.created_at,
    )
