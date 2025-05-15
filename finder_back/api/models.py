import hashlib
import os
import uuid

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


def user_doc_directory_path(instance, filename):
    user_hash = hashlib.sha256(str(instance.user.id).encode()).hexdigest()[:14]

    return f"users/{user_hash}/{uuid.uuid4().hex[:14]}_{filename}"


class UserFile(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    file = models.FileField(upload_to=user_doc_directory_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)


class ProcessedFile(models.Model):
    filename = models.CharField(unique=True, max_length=255, primary_key=True)
    last_modified = models.DateTimeField()


def upload_to_documents(instance, filename):
    file_hash = hashlib.sha256(str(filename).encode()).hexdigest()[:14]
    return f"public_files/pdfs/{file_hash}_{filename}"


def upload_to_previews(instance, filename):
    file_hash = hashlib.sha256(str(filename).encode()).hexdigest()[:14]
    return f"public_files/previews/{file_hash}_{filename}"


class Document(models.Model):
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to=upload_to_documents)
    preview = models.ImageField(upload_to=upload_to_previews, blank=True, null=True)
    is_public = models.BooleanField(default=True)
    is_indexed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        if self.file and not self.preview:
            generate_preview(self)

    def delete(self, *args, **kwargs):
        if self.file and os.path.isfile(self.file.path):
            os.remove(self.file.path)
        if self.preview and os.path.isfile(self.preview.path):
            os.remove(self.preview.path)
        delete_qd(self)
        super().delete(*args, **kwargs)
