import os
import uuid

import pytest
from fastapi.testclient import TestClient

from backend.app import app
from backend.sample_data.generate_sample_pdfs import generate_all

SAMPLE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "sample_data", "generated")

client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def sample_pdfs():
    generate_all()


@pytest.fixture
def auth_token():
    email = f"api-test-{uuid.uuid4().hex}@example.com"
    response = client.post(
        "/api/auth/signup", json={"email": email, "password": "testpass123", "name": "API Test"}
    )
    assert response.status_code == 201
    return response.json()["token"]


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def test_signup_and_login():
    signup = client.post(
        "/api/auth/signup", json={"email": "login-test@example.com", "password": "pw123456", "name": "Login Test"}
    )
    assert signup.status_code == 201
    assert signup.json()["user"]["email"] == "login-test@example.com"

    login = client.post("/api/auth/login", json={"email": "login-test@example.com", "password": "pw123456"})
    assert login.status_code == 200
    assert "token" in login.json()

    bad_login = client.post("/api/auth/login", json={"email": "login-test@example.com", "password": "wrong"})
    assert bad_login.status_code == 401


def test_documents_require_auth():
    response = client.get("/api/units")
    assert response.status_code == 401


def test_full_staged_upload_flow(auth_token):
    with open(os.path.join(SAMPLE_DIR, "northwind_retail_sample.pdf"), "rb") as f:
        extract_response = client.post(
            "/api/extract",
            headers=auth_headers(auth_token),
            files={"file": ("northwind_retail_sample.pdf", f, "application/pdf")},
        )
    assert extract_response.status_code == 201
    staged = extract_response.json()
    assert staged["extraction"]["template_name"] == "northwind_retail"
    assert staged["extraction"]["total"] == 38.5

    unit_response = client.post("/api/units", headers=auth_headers(auth_token), json={"file_amount": 1})
    assert unit_response.status_code == 201
    unit = unit_response.json()
    assert unit["status"] == "processing"

    insert_response = client.post(
        f"/api/units/{unit['id']}/documents",
        headers=auth_headers(auth_token),
        json={"staging_id": staged["staging_id"]},
    )
    assert insert_response.status_code == 201
    document = insert_response.json()
    assert document["unit_id"] == unit["id"]
    assert document["extraction"]["vendor_name"] == "Northwind Retail"

    finalize_response = client.patch(
        f"/api/units/{unit['id']}",
        headers=auth_headers(auth_token),
        json={"error_count": 0, "success_count": 1},
    )
    assert finalize_response.status_code == 200
    assert finalize_response.json()["status"] == "complete"

    units_list = client.get("/api/units", headers=auth_headers(auth_token))
    assert units_list.status_code == 200
    assert units_list.json()["total_count"] == 1

    documents_list = client.get(f"/api/units/{unit['id']}/documents", headers=auth_headers(auth_token))
    assert documents_list.status_code == 200
    assert documents_list.json()["total_count"] == 1

    single_document = client.get(f"/api/documents/{document['id']}", headers=auth_headers(auth_token))
    assert single_document.status_code == 200

    delete_response = client.delete(f"/api/documents/{document['id']}", headers=auth_headers(auth_token))
    assert delete_response.status_code == 204


def test_extract_rejects_non_pdf(auth_token):
    response = client.post(
        "/api/extract",
        headers=auth_headers(auth_token),
        files={"file": ("not-a-pdf.txt", b"hello", "text/plain")},
    )
    assert response.status_code == 400


def test_insert_document_requires_valid_staging_id(auth_token):
    unit_response = client.post("/api/units", headers=auth_headers(auth_token), json={"file_amount": 1})
    unit_id = unit_response.json()["id"]

    response = client.post(
        f"/api/units/{unit_id}/documents",
        headers=auth_headers(auth_token),
        json={"staging_id": "does-not-exist"},
    )
    assert response.status_code == 404
