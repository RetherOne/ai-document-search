from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    doc_list = models.CharField(default="none")


def user_directory_path(instance, filename):
    """Файлы сохраняются в `media/user_<id>/<filename>`"""
    return f"user_{instance.user.id}/{filename}"

class UserFile(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)  # Привязываем файл к пользователю
    file = models.FileField(upload_to=user_directory_path)  # Файл сохраняется в `media/`
    uploaded_at = models.DateTimeField(auto_now_add=True)  # Дата загрузки

    def __str__(self):
        return f"{self.user.username}"
