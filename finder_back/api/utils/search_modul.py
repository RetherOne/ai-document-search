import os
from collections import defaultdict
from pathlib import Path

from api.models import Document
from django.conf import settings
from FlagEmbedding import BGEM3FlagModel
from qdrant_client import QdrantClient

model = BGEM3FlagModel(
    "BAAI/bge-m3",
    use_fp16=False,
    query_instruction_for_retrieval="Represent this sentence for searching relevant passages:",
)


qdrant = QdrantClient(host="localhost", port=6333)
collection_name = settings.COLLECTION_NAME


def get_document_meta(filepath):
    if filepath.startswith(settings.MEDIA_ROOT):
        relative_path = Path(os.path.relpath(filepath, settings.MEDIA_ROOT)).as_posix()
    else:
        relative_path = filepath
    document = Document.objects.get(file=relative_path)
    try:
        return {
            "title": document.title,
            "preview_image": (
                f"{settings.DOMAIN}{document.preview.url}" if document.preview else None
            ),
        }
    except Document.DoesNotExist:
        return {
            "title": os.path.splitext(os.path.basename(filepath))[0],
            "preview_image": None,
        }


def search_query(query):
    query_vector = model.encode_queries([query], return_dense=True)["dense_vecs"][0]
    results = qdrant.search(
        collection_name=collection_name,
        query_vector=query_vector,
        limit=10,
    )

    grouped = defaultdict(list)

    for result in results:
        filepath = result.payload.get("filepath")
        if filepath:
            grouped[filepath].append(
                {
                    "text": result.payload.get("text", ""),
                    "score": result.score,
                }
            )

    response = []
    for filepath, chunks in grouped.items():
        best_chunk = max(chunks, key=lambda x: x["score"])
        meta = get_document_meta(filepath)

        response.append(
            {
                "document_title": meta["title"],
                "preview_image": meta["preview_image"],
                "representative_text": best_chunk["text"],
                "score": best_chunk["score"],
                "filepath": filepath,
            }
        )

    response.sort(key=lambda x: x["score"], reverse=True)

    return response
