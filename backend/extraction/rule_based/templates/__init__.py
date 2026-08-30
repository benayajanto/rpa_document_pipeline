from backend.extraction.rule_based.templates.northwind_retail import NorthwindRetailTemplate
from backend.extraction.rule_based.templates.acme_distribution import AcmeDistributionTemplate
from backend.extraction.rule_based.templates.generic_invoice import GenericInvoiceTemplate

ALL_TEMPLATES = [
    NorthwindRetailTemplate(),
    AcmeDistributionTemplate(),
    GenericInvoiceTemplate(),
]
