import re

from django.conf import settings
from FlagEmbedding import BGEM3FlagModel
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

# --- Configurations ---
pdf_folder_path = settings.PDF_FOLDER_PATH
db_path = settings.QDRANT_DB
collection_name = settings.COLLECTION_NAME

# --- Model ---
model = BGEM3FlagModel(
    "BAAI/bge-m3",
    use_fp16=False,
    query_instruction_for_retrieval="Represent this sentence for searching relevant passages:",
)
tokenizer = model.tokenizer

# --- Qdrant ---
qdrant = QdrantClient(path=db_path)

if not qdrant.collection_exists(collection_name):
    qdrant.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(size=1024, distance=Distance.COSINE),
    )

# --- RegEx ---
RE_HYPHEN_BREAK = re.compile(r"(\w)-\s+(\w)")
RE_WHITESPACE = re.compile(r"[\n\r\t]+")
RE_MULTISPACES = re.compile(r" {2,}")
RE_PUNCTUATION_SPACING = re.compile(r"\s+([,.!?;:)\]\}\"\'“”])(?=\s|$)")
RE_OPENING_BRACKETS = re.compile(r"([\(\[\{])\s+")
RE_SENTENCE_SPLITTER = re.compile(r"(?<=[.!?;])\s+")
