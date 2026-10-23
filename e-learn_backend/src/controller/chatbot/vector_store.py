"""Read a PDF, split it into chunks, embed them, and store them in Qdrant."""

from __future__ import annotations

import argparse
import os
from pathlib import Path
from uuid import uuid4

from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from qdrant_client import QdrantClient, models
from langchain_qdrant import FastEmbedSparse, QdrantVectorStore, RetrievalMode
try:  # Package import (python -m src.controller.chatbot.store_vector)
    from .embeddings import get_embedding_model
    from .reader import read_pdf
except ImportError:  # Direct script execution from this directory
    from embeddings import get_embedding_model
    from reader import read_pdf



DEFAULT_COLLECTION = "e-learning_documents"
DEFAULT_CHUNK_SIZE = 1000
DEFAULT_CHUNK_OVERLAP = 150
DENSE_VECTOR_NAME = "dense"
SPARSE_VECTOR_NAME = "sparse"


def create_qdrant_client() -> QdrantClient:
    """Build a Qdrant client from QDRANT_URL and QDRANT_API_KEY."""
    module_dir = Path(__file__).resolve().parent
    chatbot_env = module_dir / ".env"
    backend_env = module_dir.parents[3] / ".env"
    env_path = chatbot_env if chatbot_env.exists() else backend_env
    load_dotenv(env_path if env_path.exists() else None)

    url = os.getenv("QDRANT_URL")
    api_key = os.getenv("QDRANT_API_KEY")
    if not url:
        raise ValueError("Set QDRANT_URL in the environment or e-learn_backend/.env.")
    if not api_key:
        raise ValueError("Set QDRANT_API_KEY in the environment or e-learn_backend/.env.")
    return QdrantClient(url=url, api_key=api_key)


def create_hybrid_vector_store(
    client: QdrantClient,
    collection_name: str = DEFAULT_COLLECTION,
) -> QdrantVectorStore:
    """Create or connect to a Qdrant dense+sparse hybrid vector store."""
    embedding_model = get_embedding_model()
    vector_size = len(embedding_model.embed_query("dimension check"))

    if not client.collection_exists(collection_name):
        client.create_collection(
            collection_name=collection_name,
            vectors_config={
                DENSE_VECTOR_NAME: models.VectorParams(
                    size=vector_size,
                    distance=models.Distance.COSINE,
                )
            },
            sparse_vectors_config={
                SPARSE_VECTOR_NAME: models.SparseVectorParams(
                    index=models.SparseIndexParams(on_disk=False)
                )
            },
        )

    return QdrantVectorStore(
        client=client,
        collection_name=collection_name,
        embedding=embedding_model,
        sparse_embedding=FastEmbedSparse(model_name="Qdrant/bm25"),
        retrieval_mode=RetrievalMode.HYBRID,
        vector_name=DENSE_VECTOR_NAME,
        sparse_vector_name=SPARSE_VECTOR_NAME,
        distance=models.Distance.COSINE,
    )


def store_pdf(
    source: str | Path,
    *,
    collection_name: str = DEFAULT_COLLECTION,
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    chunk_overlap: int = DEFAULT_CHUNK_OVERLAP,
    client: QdrantClient | None = None,
) -> int:
    """Store chunks from a local or remote PDF in Qdrant and return their count."""
    if chunk_size <= 0:
        raise ValueError("chunk_size must be greater than zero.")
    if chunk_overlap < 0 or chunk_overlap >= chunk_size:
        raise ValueError("chunk_overlap must be non-negative and smaller than chunk_size.")

    text = read_pdf(source)
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        add_start_index=True,
    )
    documents = splitter.create_documents([text])
    chunks = [document.page_content for document in documents]
    if not chunks:
        raise ValueError(f"No text chunks were produced from PDF: {source}")

    qdrant = client or create_qdrant_client()

    source_name = str(source)
    for index, document in enumerate(documents):
        document.metadata.update(
            {
                "source": source_name,
                "chunk_index": index,
                "start_index": document.metadata.get("start_index", 0),
            }
        )

    vector_store = create_hybrid_vector_store(qdrant, collection_name)
    vector_store.add_documents(documents, ids=[str(uuid4()) for _ in documents])
    return len(documents)


def has_source(
    source: str,
    *,
    collection_name: str = DEFAULT_COLLECTION,
    client: QdrantClient | None = None,
) -> bool:
    """Return whether this exact document URL already has chunks in Qdrant."""
    qdrant = client or create_qdrant_client()
    if not qdrant.collection_exists(collection_name):
        return False
    points, _ = qdrant.scroll(
        collection_name=collection_name,
        scroll_filter=models.Filter(
            must=[models.FieldCondition(key="metadata.source", match=models.MatchValue(value=source))]
        ),
        limit=1,
        with_payload=False,
        with_vectors=False,
    )
    return bool(points)


def search_similar(
    query: str,
    *,
    collection_name: str = DEFAULT_COLLECTION,
    limit: int = 4,
    client: QdrantClient | None = None,
) -> list[Document]:
    """Search Qdrant by text; QdrantVectorStore embeds the query internally."""
    if not query.strip():
        raise ValueError("query must not be empty.")
    if limit <= 0:
        raise ValueError("limit must be greater than zero.")

    vector_store = create_hybrid_vector_store(client or create_qdrant_client(), collection_name)
    return vector_store.similarity_search(query, k=limit)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pdf", help="Local PDF path or HTTP(S) PDF URL")
    parser.add_argument("--collection", default=DEFAULT_COLLECTION)
    parser.add_argument("--chunk-size", type=int, default=DEFAULT_CHUNK_SIZE)
    parser.add_argument("--chunk-overlap", type=int, default=DEFAULT_CHUNK_OVERLAP)
    args = parser.parse_args()

    count = store_pdf(
        args.pdf,
        collection_name=args.collection,
        chunk_size=args.chunk_size,
        chunk_overlap=args.chunk_overlap,
    )
    print(f"Stored {count} chunks in Qdrant collection '{args.collection}'.")



if __name__ == "__main__":
    main()
