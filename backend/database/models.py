from __future__ import annotations

import datetime
import json

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")


class Unit(Base):
    """A batch upload session (a set of files processed and committed together)."""

    __tablename__ = "units"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_amount = Column(Integer, default=0)
    error_count = Column(Integer, default=0)
    success_count = Column(Integer, default=0)
    status = Column(String(32), default="processing")  # processing | complete
    uploaded_by = Column(String(255))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User")
    documents = relationship("Document", back_populates="unit", cascade="all, delete-orphan")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=False)
    original_filename = Column(String(255), nullable=False)
    stored_path = Column(String(512), nullable=False)
    status = Column(String(32), default="processed")  # pending | processed | failed
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="documents")
    unit = relationship("Unit", back_populates="documents")
    result = relationship(
        "ExtractionResultRecord", back_populates="document", uselist=False, cascade="all, delete-orphan"
    )


class ExtractionResultRecord(Base):
    __tablename__ = "extraction_results"

    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False, unique=True)

    vendor_name = Column(String(255))
    document_number = Column(String(128))
    document_date = Column(String(32))
    subtotal = Column(Float, nullable=True)
    tax = Column(Float, nullable=True)
    total = Column(Float, nullable=True)
    currency = Column(String(8), default="USD")
    method = Column(String(32))
    template_name = Column(String(64), nullable=True)
    confidence = Column(Float, default=1.0)
    line_items_json = Column(Text, default="[]")

    document = relationship("Document", back_populates="result")

    @property
    def line_items(self) -> list[dict]:
        return json.loads(self.line_items_json or "[]")

    @line_items.setter
    def line_items(self, items: list[dict]) -> None:
        self.line_items_json = json.dumps(items)

    def to_dict(self) -> dict:
        return {
            "vendor_name": self.vendor_name,
            "document_number": self.document_number,
            "document_date": self.document_date,
            "subtotal": self.subtotal,
            "tax": self.tax,
            "total": self.total,
            "currency": self.currency,
            "method": self.method,
            "template_name": self.template_name,
            "confidence": self.confidence,
            "line_items": self.line_items,
        }
