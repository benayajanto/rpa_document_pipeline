from __future__ import annotations

import os

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.api.schemas import DocumentOut
from backend.api.serializers import serialize_document
from backend.auth import get_current_user_id
from backend.database.db import get_db
from backend.database.models import Document

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.get("/{document_id}", response_model=DocumentOut)
def get_document(document_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    document = db.query(Document).filter_by(id=document_id, user_id=user_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="not found")
    return serialize_document(document)


@router.delete("/{document_id}", status_code=204)
def delete_document(document_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    document = db.query(Document).filter_by(id=document_id, user_id=user_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="not found")

    if os.path.exists(document.stored_path):
        os.remove(document.stored_path)

    db.delete(document)
    db.commit()
