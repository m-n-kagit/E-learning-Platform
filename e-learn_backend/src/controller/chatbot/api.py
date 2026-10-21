"""FastAPI endpoints for PDF indexing and course-content Q&A."""

from __future__ import annotations

import asyncio
import logging

from fastapi import FastAPI, HTTPException
from pydantic import AnyHttpUrl, BaseModel, Field

try:  # Package import
    from .rag import RAGError, answer_question
    from .vector_store import DEFAULT_COLLECTION, store_pdf
except ImportError:  # Run with uvicorn api:app from this directory
    from rag import RAGError, answer_question
    from vector_store import DEFAULT_COLLECTION, store_pdf


logger = logging.getLogger(__name__)
app = FastAPI(title="E-learning Chatbot API", version="1.0.0")


class IndexRequest(BaseModel):
    source_url: AnyHttpUrl
    collection_name: str = Field(default=DEFAULT_COLLECTION, min_length=1, max_length=128)


class IndexResponse(BaseModel):
    message: str
    chunks_stored: int
    collection_name: str


class QuestionRequest(BaseModel):
    question: str = Field(min_length=1, max_length=4000)
    collection_name: str = Field(default=DEFAULT_COLLECTION, min_length=1, max_length=128)
    limit: int = Field(default=4, ge=1, le=20)


class AnswerResponse(BaseModel):
    answer: str


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/chatbot/index", response_model=IndexResponse)
async def index_pdf(request: IndexRequest) -> IndexResponse:
    """Download a Cloudinary PDF, chunk it, embed it, and store it in Qdrant."""
    try:
        count = await asyncio.to_thread(
            store_pdf,
            str(request.source_url),
            collection_name=request.collection_name,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("PDF indexing failed")
        raise HTTPException(
            status_code=502,
            detail="Could not download or index the PDF. Check the source URL and Qdrant connection.",
        ) from exc

    return IndexResponse(
        message="PDF indexed successfully.",
        chunks_stored=count,
        collection_name=request.collection_name,
    )


@app.post("/chatbot/ask", response_model=AnswerResponse)
async def ask_question(request: QuestionRequest) -> AnswerResponse:
    """Return an answer grounded in documents stored in the Qdrant collection."""
    question = request.question.strip()
    if not question:
        raise HTTPException(status_code=422, detail="question must not be blank.")

    try:
        answer = await asyncio.to_thread(
            answer_question,
            question,
            collection_name=request.collection_name,
            limit=request.limit,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except RAGError as exc:
        logger.exception("RAG request failed")
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Unexpected chatbot error")
        raise HTTPException(status_code=500, detail="The chatbot request failed.") from exc

    return AnswerResponse(answer=answer)
