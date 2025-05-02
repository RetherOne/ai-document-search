import hashlib
import uuid

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
