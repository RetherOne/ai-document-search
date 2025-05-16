# finder_back/api/signals.py
from logging import getLogger

from django.db.models.signals import post_save
from django.dispatch import receiver
from django_q.tasks import async_task

from .models import Document

logger = getLogger(__name__)


@receiver(post_save, sender=Document)
def schedule_indexing(sender, instance, created, **kwargs):
    if created and instance.is_public:
        logger.info(f"Scheduling indexing for Document {instance.id}")
        async_task(
            "api.tasks.index_document_task",
            instance.id,
            instance.file.path,
        )
