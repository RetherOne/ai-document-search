import logging
from .core_utils import embedding, indexing

logger = logging.getLogger(__name__)


def process_and_index_file(document_path):
    try:
        logger.info(f"Start embedding: {document_path}")
        chunks, embeddings = embedding(document_path, logger)

        logger.info(f"Start indexing: {document_path}")
        qdrant = indexing(chunks, embeddings, document_path, logger)

        logger.info(f"Successfully processed {document_path}")
    except Exception as e:
        logger.exception(f"Failed to process {document_path}: {e}")
