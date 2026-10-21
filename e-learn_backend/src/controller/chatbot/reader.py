"""Utilities for extracting text from PDF files and URLs."""

from __future__ import annotations

from io import BytesIO
from pathlib import Path
from typing import Union

import requests
from pypdf import PdfReader


PdfSource = Union[str, Path] 


def read_pdf(source: PdfSource, *, timeout: int = 30) -> str:
    """Extract and return text from a local PDF file or an HTTP(S) PDF URL.

    Example:
        text = read_pdf("lesson.pdf")
        # or: text = read_pdf("https://example.com/lesson.pdf")

    Raises:
        ValueError: If the URL is not HTTP(S), or the PDF contains no extractable text.
        requests.RequestException: If downloading a URL fails.
        OSError: If a local file cannot be read.
        pypdf.errors.PdfReadError: If the input is not a readable PDF.
    """
    source_string = str(source)

    if source_string.lower().startswith(("http://", "https://")):
        response = requests.get(source_string, timeout=timeout)
        response.raise_for_status()
        pdf = PdfReader(BytesIO(response.content))
    else:
        pdf = PdfReader(str(Path(source)))

    text = "\n".join(page.extract_text() or "" for page in pdf.pages).strip()
    if not text:
        raise ValueError(f"No extractable text found in PDF: {source_string}")

    return text
