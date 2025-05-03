import hashlib
import os
import uuid

import pymupdf as pdf
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models


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
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.file and not self.preview:
            self.generate_preview()

    def delete(self, *args, **kwargs):

        if self.file and os.path.isfile(self.file.path):
            os.remove(self.file.path)
        if self.preview and os.path.isfile(self.preview.path):
            os.remove(self.preview.path)

        super().delete(*args, **kwargs)

    def generate_preview(self):

        pdf_path = self.file.path

        output_folder = os.path.join(settings.MEDIA_ROOT, f"public_files/previews")
        os.makedirs(output_folder, exist_ok=True)

        doc = pdf.open(pdf_path)
        page = doc.load_page(0)
        pix = page.get_pixmap()

        # ['filename', '.pdf']
        filename = os.path.splitext(os.path.basename(self.file.name))[0]

        image_path = os.path.join(output_folder, f"{filename}.jpg")
        pix.save(image_path)
        doc.close()

        self.preview.name = f"public_files/previews/{filename}.jpg"
        self.save(update_fields=["preview"])
