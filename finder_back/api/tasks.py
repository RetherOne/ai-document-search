# finder_back/api/tasks.py
from logging import getLogger
from .utils.indexing import process_and_index_file
from .models import Document

logger = getLogger(__name__)


def index_document_task(document_id, document_path):
    logger.info(f"Running background task for Document #{document_id}")
    process_and_index_file(document_path)

    try:
        doc = Document.objects.get(id=document_id)
        doc.is_indexed = True
        doc.save(update_fields=["is_indexed"])
        logger.info(f"Document {document_id} marked as indexed.")
    except Document.DoesNotExist:
        logger.warning(f"Document {document_id} not found to mark as indexed.")


def log_task_result(task):
    if task.success:
        logger.info(f"Task {task.id} completed: {task.result}")
    else:
        logger.error(f"Task {task.id} failed: {task.result}")
