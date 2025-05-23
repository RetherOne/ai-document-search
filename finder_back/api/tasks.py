from logging import getLogger
from api.models import Document
from api.models import DocumentsInProgress

logger = getLogger(__name__)


def index_document_task(document_id, document_path):
    from .utils.core import process_and_index_file

    logger.info(f"Running background task for Document #{document_id}")

    process_and_index_file(document_id, document_path)

    try:
        doc = Document.objects.get(id=document_id)
        doc.is_indexed = True
        doc.save(update_fields=["is_indexed"])

        DocumentsInProgress.objects.filter(
            document_id=document_id, task_type="index"
        ).update(is_completed=True)

        logger.info(f"Document {document_id} marked as indexed.")
    except Document.DoesNotExist:
        logger.warning(f"Document {document_id} not found to mark as indexed.")


def convert_docx_to_pdf_task(document_id):
    from api.utils.convert import docx_to_pdf

    document = Document.objects.get(id=document_id)

    if document.docx_file and not document.pdf_file:
        try:
            pdf_relative_path = docx_to_pdf(document.docx_file.path)
            document.pdf_file.name = pdf_relative_path
            document.save(update_fields=["pdf_file"])
            DocumentsInProgress.objects.filter(
                document_id=document_id, task_type="convert"
            ).update(is_completed=True)
            logger.info(f"Document {document_id} converted to PDF.")

        except Exception as e:
            print(f"[convert_docx_to_pdf_task] Convert error: {e}")
        logger.info(f"Document {document_id} converted.")
