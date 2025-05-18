import os
from collections import defaultdict
from hashlib import md5
from logging import getLogger
from pathlib import Path
from re import compile
from statistics import mode

import pymupdf as pdf
from django.conf import settings
from FlagEmbedding import BGEM3FlagModel
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams

from api.models import Document

logger = getLogger(__name__)

model = BGEM3FlagModel(
    "BAAI/bge-m3",
    use_fp16=False,
    query_instruction_for_retrieval="Represent this sentence for searching relevant passages:",
)
tokenizer = model.tokenizer


qdrant = QdrantClient(host="localhost", port=6333)

collection_name = settings.COLLECTION_NAME

if not qdrant.collection_exists(collection_name):
    qdrant.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(size=1024, distance=Distance.COSINE),
    )

# --- RegEx ---
RE_HYPHEN_BREAK = compile(r"(\w)-\s+(\w)")
RE_WHITESPACE = compile(r"[\n\r\t]+")
RE_MULTISPACES = compile(r" {2,}")
RE_PUNCTUATION_SPACING = compile(r"\s+([,.!?;:)\]\}\"\'“”])(?=\s|$)")
RE_OPENING_BRACKETS = compile(r"([\(\[\{])\s+")
RE_SENTENCE_SPLITTER = compile(r"(?<=[.!?;])\s+")


def _is_title(line: str, size: int, font: str, font_size_body_text: int):
    if (
        size > font_size_body_text
        or (size >= font_size_body_text and "Bold" in font and line.istitle())
        or (size == font_size_body_text and "Bold" in font and line.isupper())
    ):
        return True
    return False


def _split_into_sentences(text: str):
    return RE_SENTENCE_SPLITTER.split(text)


def _count_tokens(text: str) -> int:
    return len(tokenizer.encode(text, add_special_tokens=False))


def _create_chunks(sentences, max_tokens: int = 256, overlap_sentences: int = 1):
    chunks = []
    i = 0
    n = len(sentences)

    while i < n:
        current_chunk = []
        current_token_count = 0
        j = i

        # Добавляем предложения в чанк, пока не превысим лимит токенов
        while j < n:
            sentence = sentences[j]
            token_count = _count_tokens(sentence)

            if current_token_count + token_count > max_tokens:
                break

            current_chunk.append(sentence)
            current_token_count += token_count
            j += 1

        if current_chunk:
            chunks.append(" ".join(current_chunk))

        # Сдвигаем указатель с перекрытием
        if j == i:
            # Если даже одно предложение не влезает — пропускаем его
            j += 1
        i = max(i + 1, j - overlap_sentences)

    return chunks


def _text_into_chunks(lines) -> str:
    # Объединяем строки в один текст
    text = " ".join(lines)

    # Убираем переносы по дефису
    text = RE_HYPHEN_BREAK.sub(r"\1\2", text)

    # Убираем служебные символы и множественные пробелы
    text = RE_WHITESPACE.sub(" ", text)
    text = RE_MULTISPACES.sub(" ", text)

    # Убираем пробелы перед знаками препинания и скобками/кавычками
    text = RE_PUNCTUATION_SPACING.sub(r"\1", text)

    # Убираем пробелы после открывающих скобок
    text = RE_OPENING_BRACKETS.sub(r"\1", text)

    sentences = _split_into_sentences(text.strip())

    chunks = _create_chunks(sentences)

    return chunks


def _extract_titles_and_text(path: str) -> dict:
    doc = pdf.open(path)
    headings = []
    body = []
    font_sizes = []
    font_size_body_text = None

    for page in doc:
        blocks = page.get_text("dict")["blocks"]
        for block in blocks:
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    font_sizes.append(span["size"])

    font_size_body_text = mode(font_sizes)
    for page in doc:
        blocks = page.get_text("dict")["blocks"]
        for block in blocks:
            for line in block.get("lines", []):
                line_text = ""
                line_size = 0
                for span in line.get("spans", []):
                    line_text += span["text"].strip()
                    line_size = span["size"]
                if not line_text:
                    continue

                if _is_title(line_text, line_size, span["font"], font_size_body_text):
                    headings.append(line_text)
                else:
                    body.append(line_text)

    seen = set()
    unique_headings = []

    for line in headings:
        if line not in seen and len(line.split()) > 1:
            unique_headings.append(line)
            seen.add(line)

    body = _text_into_chunks(body)

    return unique_headings + body


def embedding(path, logger):
    all_chunks = _extract_titles_and_text(path)
    embeddings = model.encode(all_chunks, return_dense=True, max_length=512)[
        "dense_vecs"
    ]
    return all_chunks, embeddings


def _generate_chunk_id(text):
    text_hash = md5(text.encode("utf-8")).hexdigest()
    return text_hash


def _already_indexed(qdrant, collection, point_id):
    res = qdrant.retrieve(collection_name=collection, ids=[point_id])
    return len(res) > 0


def indexing(chunks, embeddings, document_id, document_path, logger):
    points = []
    for text, vector in zip(chunks, embeddings):

        uid = _generate_chunk_id(text)
        if _already_indexed(qdrant, collection_name, uid):
            continue
        point = PointStruct(
            id=uid,
            vector=vector,
            payload={
                "document_id": document_id,
                "filepath": document_path,
                "text": text,
            },
        )
        points.append(point)

    if points:
        qdrant.upsert(collection_name=collection_name, points=points)
    return True


def process_and_index_file(document_id, document_path):
    logger.info(f"Start embedding: {document_id}")
    chunks, embeddings = embedding(document_path, logger)

    logger.info(f"Start indexing: {document_id}")
    qdrant = indexing(chunks, embeddings, document_id, document_path, logger)

    logger.info(f"Successfully processed {document_id}, Qdrant:{qdrant}")


def get_document_meta(filepath):
    if filepath.startswith(settings.MEDIA_ROOT):
        relative_path = Path(os.path.relpath(filepath, settings.MEDIA_ROOT)).as_posix()
    else:
        relative_path = filepath
    document = Document.objects.get(pdf_file=relative_path)
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
    query_vector = model.encode_queries(query, return_dense=True)["dense_vecs"]

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

        # Построение корректной ссылки на файл
        if filepath.startswith(settings.MEDIA_ROOT):
            relative_path = Path(
                os.path.relpath(filepath, settings.MEDIA_ROOT)
            ).as_posix()
            document_url = f"{settings.MEDIA_URL}{relative_path}"
        else:
            document_url = filepath  # или любой другой способ генерации URL
        print(document_url)
        response.append(
            {
                "document_title": meta["title"],
                "preview_image": meta["preview_image"],
                "representative_text": best_chunk["text"],
                "score": best_chunk["score"],
                "filepath": document_url,  # здесь будет ссылка, включающая MEDIA_URL
            }
        )

    response.sort(key=lambda x: x["score"], reverse=True)

    return response
