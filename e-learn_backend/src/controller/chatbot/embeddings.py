"""Create text embeddings with the project's configured Hugging Face model."""

from __future__ import annotations

from functools import lru_cache
from typing import Sequence

from langchain_huggingface import HuggingFaceEmbeddings


MODEL_NAME = "BAAI/bge-small-en-v1.5"


@lru_cache(maxsize=1)
def get_embedding_model() -> HuggingFaceEmbeddings:
    """Return a cached embedding model instance (loaded once per process)."""
    return HuggingFaceEmbeddings(
        model_name=MODEL_NAME,
        model_kwargs={"device": "cpu"},  # Set to "cuda" when a supported GPU is available.
        encode_kwargs={"normalize_embeddings": True},
    )


def embed_texts(texts: Sequence[str]) -> list[list[float]]:
    """Embed a sequence of text chunks and return one vector per input text.

    Example:
        vectors = embed_texts(["First lesson chunk", "Second lesson chunk"])
    """
    if isinstance(texts, str):
        raise TypeError("Pass a sequence of strings, e.g. [text], not a single string.")
    if not texts:
        return []
    if any(not isinstance(text, str) or not text.strip() for text in texts):
        raise ValueError("Every text must be a non-empty string.")

    return get_embedding_model().embed_documents(list(texts))


def embed_text(text: str) -> list[float]: #to embed
    """Embed a single text, returning its vector."""
    if not isinstance(text, str) or not text.strip():
        raise ValueError("text must be a non-empty string.")
    return get_embedding_model().embed_query(text)
