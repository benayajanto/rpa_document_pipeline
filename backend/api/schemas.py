from __future__ import annotations

import datetime

from pydantic import BaseModel


class SignupRequest(BaseModel):
    email: str
    password: str
    name: str


class LoginRequest(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    name: str


class AuthResponse(BaseModel):
    token: str
    user: UserOut


class LineItemOut(BaseModel):
    description: str
    quantity: float
    unit_price: float
    line_total: float


class ExtractionOut(BaseModel):
    vendor_name: str
    document_number: str
    document_date: str
    subtotal: float | None
    tax: float | None
    total: float | None
    currency: str
    method: str
    template_name: str | None
    confidence: float
    line_items: list[LineItemOut]


class ExtractStagedResponse(BaseModel):
    staging_id: str
    filename: str
    size: int
    extraction: ExtractionOut


class DocumentOut(BaseModel):
    id: int
    unit_id: int
    original_filename: str
    status: str
    uploaded_at: datetime.datetime | None
    extraction: ExtractionOut | None = None


class DocumentListResponse(BaseModel):
    items: list[DocumentOut]
    total_pages: int
    total_count: int


class CreateUnitRequest(BaseModel):
    file_amount: int


class UpdateUnitRequest(BaseModel):
    error_count: int
    success_count: int


class UnitOut(BaseModel):
    id: int
    file_amount: int
    error_count: int
    success_count: int
    status: str
    uploaded_by: str | None
    created_at: datetime.datetime | None


class UnitListResponse(BaseModel):
    items: list[UnitOut]
    total_pages: int
    total_count: int


class InsertDocumentRequest(BaseModel):
    staging_id: str
