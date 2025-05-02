import hashlib
import os
import re
from datetime import datetime
from statistics import mode

import pymupdf as pdf
from api.models import ProcessedFile
from django.utils import timezone
from qdrant_client.models import PointStruct

from .init import collection_name, model, pdf_folder_path, qdrant, tokenizer

# --- RegEx ---
RE_HYPHEN_BREAK = re.compile(r"(\w)-\s+(\w)")
RE_WHITESPACE = re.compile(r"[\n\r\t]+")
RE_MULTISPACES = re.compile(r" {2,}")
RE_PUNCTUATION_SPACING = re.compile(r"\s+([,.!?;:)\]\}\"\'“”])(?=\s|$)")
RE_OPENING_BRACKETS = re.compile(r"([\(\[\{])\s+")


def _was_already_processed(filename: str, last_modified_str: str) -> bool:
    try:
        last_modified = datetime.strptime(last_modified_str, "%Y-%m-%d %H:%M:%S")
        file = ProcessedFile.objects.get(
            filename=hashlib.sha256(filename.encode()).hexdigest()[:14]
        )
        last_modified = timezone.make_aware(
            last_modified, timezone.get_default_timezone()
        )
        return file.last_modified == last_modified
    except ProcessedFile.DoesNotExist:
        return False


def _mark_file_processed(filename: str, last_modified_str: str):
    last_modified = datetime.strptime(last_modified_str, "%Y-%m-%d %H:%M:%S")
    ProcessedFile.objects.update_or_create(
        filename=hashlib.sha256(filename.encode()).hexdigest()[:14],
        defaults={"last_modified": last_modified},
    )


def _is_title(line: str, size: int, font: str, font_size_body_text: int):
    if (
        size > font_size_body_text
        or (size >= font_size_body_text and "Bold" in font and line.istitle())
        or (size == font_size_body_text and "Bold" in font and line.isupper())
    ):
        return True
    return False


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
        if line not in seen:
            unique_headings.append(line)
            seen.add(line)

    return {"titles": unique_headings, "text": body}


def _generate_id_from_text(text: str) -> str:
    return hashlib.md5(text.encode("utf-8")).hexdigest()


def _already_indexed(qdrant, collection, point_id):
    res = qdrant.retrieve(collection_name=collection, ids=[point_id])
    return len(res) > 0


def _index_document(qdrant, collection, texts):
    embeddings = model.encode(texts, return_dense=True, max_length=512)["dense_vecs"]
    points = []
    for text, vector in zip(texts, embeddings):

        uid = _generate_id_from_text(text)
        if _already_indexed(qdrant, collection, uid):
            continue
        point = PointStruct(id=uid, vector=vector, payload={"text": text})
        points.append(point)

    if points:
        qdrant.upsert(collection_name=collection, points=points)


def _split_into_sentences(text: str):
    return re.split(r"(?<=[.!?;])\s+", text)


def _count_tokens(text: str) -> int:
    return len(tokenizer.encode(text, add_special_tokens=False))


def _create_chunks(sentences, max_tokens: int = 256, overlap_sentences: int = 1):
    chunks = []
    i = 0
    n = len(sentences)

    while i < n:
        current_chunk = []
        current_token_count = 0

        for j in range(i, n):
            tokens = _count_tokens(sentences[j])
            if current_token_count + tokens > max_tokens:
                break
            current_chunk.append(sentences[j])
            current_token_count += tokens

        if current_chunk:
            chunks.append(" ".join(current_chunk))

        # Сдвигаем указатель с перекрытием
        i = j - overlap_sentences if j - overlap_sentences > i else i + 1

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


def search_query(query: str):
    query_vector = model.encode_queries([query], return_dense=True)["dense_vecs"][0]
    results = qdrant.search(
        collection_name=collection_name,
        query_vector=query_vector,
        limit=5,
    )

    return [
        {
            "id": result.id,
            "score": result.score,
            "payload": result.payload,
        }
        for result in results
    ]


def main_check_pdf_files():
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RESET = "\033[0m"

    pdf_files = [f for f in os.listdir(pdf_folder_path) if f.lower().endswith(".pdf")]

    for filename in os.listdir(pdf_folder_path):
        file_path = os.path.join(pdf_folder_path, filename)
        last_modified = datetime.fromtimestamp(os.path.getmtime(file_path)).strftime(
            "%Y-%m-%d %H:%M:%S"
        )

        if _was_already_processed(filename, last_modified):
            print(f"{GREEN} [✓] Skipped (already indexed): {filename}{RESET}")
            continue

        print(f"{YELLOW} [+] Processing: {filename}{RESET}")
        titles_and_text = _extract_titles_and_text(file_path)
        titles = titles_and_text.get("titles", [])
        body_chunks = _text_into_chunks(titles_and_text.get("text", []))

        all_chunks = titles + body_chunks
        _index_document(qdrant, collection_name, all_chunks)
        _mark_file_processed(filename, last_modified)
        print(f"{GREEN} [✓] Success! {filename}{RESET}")
    print(f"Continuing to start the server...")


main_check_pdf_files()
