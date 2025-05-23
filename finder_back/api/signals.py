from logging import getLogger

from django.db.models.signals import post_save
from django.dispatch import receiver
from django_q.tasks import async_task

from api.models import DocumentsInProgress

from .models import Document

logger = getLogger(__name__)


@receiver(post_save, sender=Document)
def schedule_indexing(sender, instance, created, **kwargs):
    # INDEX TASK
    if instance.is_public and instance.pdf_file and not instance.is_indexed:
        if not DocumentsInProgress.objects.filter(
            document=instance, task_type="index", is_completed=False
        ).exists():
            DocumentsInProgress.objects.create(document=instance, task_type="index")
            async_task(
                "api.tasks.index_document_task", instance.id, instance.pdf_file.path
            )

    # CONVERT TASK
    if instance.docx_file and not instance.pdf_file:
        if not DocumentsInProgress.objects.filter(
            document=instance, task_type="convert", is_completed=False
        ).exists():
            DocumentsInProgress.objects.create(document=instance, task_type="convert")
            async_task("api.tasks.convert_docx_to_pdf_task", instance.id)
