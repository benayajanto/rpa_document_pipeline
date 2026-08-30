import os

import pytest

from backend.extraction.pipeline import run_extraction
from backend.sample_data.generate_sample_pdfs import generate_all

SAMPLE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "sample_data", "generated")


@pytest.fixture(scope="module", autouse=True)
def sample_pdfs():
    generate_all()


def test_pipeline_extracts_northwind_sample():
    result = run_extraction(os.path.join(SAMPLE_DIR, "northwind_retail_sample.pdf"))
    assert result.template_name == "northwind_retail"
    assert result.total == 38.5


def test_pipeline_extracts_acme_sample():
    result = run_extraction(os.path.join(SAMPLE_DIR, "acme_distribution_sample.pdf"))
    assert result.template_name == "acme_distribution"
    assert result.total == 88.8


def test_pipeline_falls_back_to_generic():
    result = run_extraction(os.path.join(SAMPLE_DIR, "generic_invoice_sample.pdf"))
    assert result.template_name == "generic_invoice"
    assert result.total == 128.4
