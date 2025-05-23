import hashlib
import os
import uuid

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractUser
from django.db import models

from .utils.delete_from_qdrant import delete_qd
from .utils.preview import generate_preview


def user_avatar_directory_path(instance, filename):
    user_hash = hashlib.sha256(str(instance.id).encode()).hexdigest()[:14]

    return f"users/{user_hash}/avatar/{uuid.uuid4().hex[:14]}_{filename}"


class CustomUser(AbstractUser):
    phone_number = models.CharField(max_length=13, unique=True)
    avatar = models.ImageField(upload_to=user_avatar_directory_path)
    saved_documents = models.ManyToManyField(
        "Document", related_name="saved_by_users", blank=True
    )


class ProcessedFile(models.Model):
    filename = models.CharField(unique=True, max_length=255, primary_key=True)
    last_modified = models.DateTimeField()


def upload_to_pdfs(instance, filename):
    file_hash = hashlib.sha256(str(filename).encode()).hexdigest()[:14]
    return f"public_files/pdfs/{file_hash}_{filename}"


def upload_to_words(instance, filename):
    file_hash = hashlib.sha256(str(filename).encode()).hexdigest()[:14]
    return f"public_files/words/{file_hash}_{filename}"


def upload_to_previews(instance, filename):
    file_hash = hashlib.sha256(str(filename).encode()).hexdigest()[:14]
    return f"public_files/previews/{file_hash}_{filename}"


def get_default_superuser_id():
    User = get_user_model()
    return User.objects.filter(is_superuser=True).first().id


class Document(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        default=get_default_superuser_id,
    )
    title = models.CharField(max_length=255, blank=True)
    pdf_file = models.FileField(upload_to=upload_to_pdfs, null=True)
    docx_file = models.FileField(upload_to=upload_to_words, blank=True, null=True)
    preview = models.ImageField(upload_to=upload_to_previews, blank=True, null=True)
    downloads_count = models.PositiveIntegerField(default=0)
    is_public = models.BooleanField(default=True)
    is_indexed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.title:
            filename = None
            if self.pdf_file:
                filename = os.path.basename(self.pdf_file.name)
            elif self.docx_file:
                filename = os.path.basename(self.docx_file.name)
            if filename:
                self.title = os.path.splitext(filename)[0]

        super().save(*args, **kwargs)

        if self.pdf_file and not self.preview:
            generate_preview(self)

    def delete(self, *args, **kwargs):
        if self.pdf_file and os.path.isfile(self.pdf_file.path):
            os.remove(self.pdf_file.path)
        if self.docx_file and os.path.isfile(self.docx_file.path):
            os.remove(self.docx_file.path)
        if self.preview and os.path.isfile(self.preview.path):
            os.remove(self.preview.path)
        delete_qd(self.id)
        super().delete(*args, **kwargs)


class DocumentsInProgress(models.Model):
    TASK_CHOICES = [
        ("index", "Indexing"),
        ("convert", "Convert DOCX to PDF"),
    ]

    document = models.ForeignKey("Document", on_delete=models.CASCADE)
    task_type = models.CharField(max_length=20, choices=TASK_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    is_completed = models.BooleanField(default=False)

    class Meta:
        unique_together = ("document", "task_type")
