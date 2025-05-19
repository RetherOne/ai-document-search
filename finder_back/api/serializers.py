from rest_framework import serializers

from api.models import Document


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ["id", "title", "preview", "pdf_file"]
