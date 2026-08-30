from __future__ import annotations

import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from backend.api.routes_auth import router as auth_router
from backend.api.routes_documents import router as documents_router
from backend.api.routes_extract import router as extract_router
from backend.api.routes_units import router as units_router
from backend.database.db import init_db

app = FastAPI(title="Invoice Extractor API")

cors_origins = os.environ.get("CORS_ORIGIN", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

app.include_router(auth_router)
app.include_router(extract_router)
app.include_router(units_router)
app.include_router(documents_router)


@app.get("/api/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.app:app", host="127.0.0.1", port=int(os.environ.get("PORT", 5000)), reload=True)
