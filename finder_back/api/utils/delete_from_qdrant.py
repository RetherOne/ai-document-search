from django.conf import settings
from qdrant_client import QdrantClient
from qdrant_client.http.models import FieldCondition, Filter, MatchValue


def delete_qd(document_id: int):
    qdrant = QdrantClient(host="localhost", port=6333)

    qdrant.delete(
        collection_name=settings.COLLECTION_NAME,
        points_selector=Filter(
            must=[
                FieldCondition(key="document_id", match=MatchValue(value=document_id))
            ]
        ),
    )
