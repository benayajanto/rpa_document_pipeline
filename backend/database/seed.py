"""Creates the tables (if needed) and inserts a demo user with sample history
so the dashboard isn't empty on first run.

    python -m backend.database.seed
"""

from __future__ import annotations

from werkzeug.security import generate_password_hash

from backend.database.db import SessionLocal, init_db
from backend.database.models import Document, ExtractionResultRecord, Unit, User

DEMO_EMAIL = "demo@example.com"
DEMO_PASSWORD = "demo1234"


def seed() -> None:
    init_db()
    session = SessionLocal()

    if session.query(User).filter_by(email=DEMO_EMAIL).first():
        print(f"demo user already exists ({DEMO_EMAIL})")
        return

    user = User(
        email=DEMO_EMAIL,
        password_hash=generate_password_hash(DEMO_PASSWORD),
        name="Demo User",
    )
    session.add(user)
    session.flush()

    sample_history = [
        {
            "original_filename": "northwind_retail_sample.pdf",
            "vendor_name": "Northwind Retail",
            "document_number": "NW-2026-00123",
            "document_date": "2026-01-15",
            "subtotal": 35.0,
            "tax": 3.5,
            "total": 38.5,
            "method": "rule_based",
            "template_name": "northwind_retail",
            "line_items": [
                {"description": "Widget A", "quantity": 2, "unit_price": 10.0, "line_total": 20.0},
                {"description": "Widget B", "quantity": 1, "unit_price": 15.0, "line_total": 15.0},
            ],
        },
        {
            "original_filename": "acme_distribution_sample.pdf",
            "vendor_name": "Acme Distribution Co.",
            "document_number": "ACME-98765",
            "document_date": "2026-01-15",
            "subtotal": 80.0,
            "tax": 8.8,
            "total": 88.8,
            "method": "rule_based",
            "template_name": "acme_distribution",
            "line_items": [
                {"description": "Steel Bolts", "quantity": 100, "unit_price": 0.5, "line_total": 50.0},
                {"description": "Steel Nuts", "quantity": 100, "unit_price": 0.3, "line_total": 30.0},
            ],
        },
    ]

    unit = Unit(
        user_id=user.id,
        file_amount=len(sample_history),
        error_count=0,
        success_count=len(sample_history),
        status="complete",
        uploaded_by=user.name,
    )
    session.add(unit)
    session.flush()

    for entry in sample_history:
        document = Document(
            user_id=user.id,
            unit_id=unit.id,
            original_filename=entry["original_filename"],
            stored_path=f"seed/{entry['original_filename']}",
            status="processed",
        )
        session.add(document)
        session.flush()

        result = ExtractionResultRecord(
            document_id=document.id,
            vendor_name=entry["vendor_name"],
            document_number=entry["document_number"],
            document_date=entry["document_date"],
            subtotal=entry["subtotal"],
            tax=entry["tax"],
            total=entry["total"],
            method=entry["method"],
            template_name=entry["template_name"],
            confidence=1.0,
        )
        result.line_items = entry["line_items"]
        session.add(result)

    session.commit()
    print(f"seeded demo user {DEMO_EMAIL} / {DEMO_PASSWORD} with {len(sample_history)} sample documents")


if __name__ == "__main__":
    seed()
