import os

from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db.models import F
from django.http import FileResponse
from django.middleware.csrf import get_token
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import CustomUser, Document
from .utils.core import search_query


class GetCSRFToken(APIView):
    def get(self, request):
        response = Response({"detail": "CSRF cookie set"})
        response["X-CSRFToken"] = get_token(request)
        return response


class RegisterView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        email = request.data.get("email", "").strip()
        phone_number = request.data.get("phone")

        try:
            validate_email(email)
        except ValidationError:
            return Response(
                {"detail": "Invalid email format!"}, status=status.HTTP_400_BAD_REQUEST
            )

        if CustomUser.objects.filter(username=username).exists():
            return Response(
                {"detail": "User with this username already exists!"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if CustomUser.objects.filter(email=email).exists():
            return Response(
                {"detail": "User with this email already exists!"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = CustomUser.objects.create_user(
            username=username,
            password=password,
            email=email,
            phone_number=phone_number,
        )

        login(request, user)

        return Response(
            {
                "isAuthenticated": True,
                "username": request.user.username,
                "avatar": request.user.avatar.url if request.user.avatar else None,
            },
            status=status.HTTP_200_OK,
        )


class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        remember_me = request.data.get("remember_me", False)

        if not username or not password:
            return Response(
                {"detail": "Please provide username and password."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(username=username, password=password)
        if user is None:
            return Response(
                {"detail": "Invalid credentials!"}, status=status.HTTP_400_BAD_REQUEST
            )

        login(request, user)
        if not remember_me:
            request.session.set_expiry(0)

        return Response(
            {
                "isAuthenticated": True,
                "username": request.user.username,
                "avatar": request.user.avatar.url if request.user.avatar else None,
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return Response(
                {"detail": "You're not logged in."}, status=status.HTTP_400_BAD_REQUEST
            )

        logout(request)
        return Response({"detail": "Successfully logged out."})


class SessionView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"isAuthenticated": False})
        return Response(
            {
                "isAuthenticated": True,
                "username": request.user.username,
                "avatar": request.user.avatar.url if request.user.avatar else None,
            },
            status=status.HTTP_200_OK,
        )


class FileUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        file_obj = request.FILES.get("file")
        if not file_obj:
            return Response(
                {"detail": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST
            )

        is_public = request.data.get("is_public", "false").lower() == "true"

        filename = file_obj.name.lower()
        if filename.endswith(".pdf"):
            Document.objects.create(
                user=request.user,
                title=file_obj.name,
                pdf_file=file_obj,
                is_public=is_public,
            )
        elif filename.endswith(".docx"):
            Document.objects.create(
                user=request.user,
                title=file_obj.name,
                docx_file=file_obj,
                is_public=is_public,
            )
        else:
            return Response(
                {
                    "detail": "Unsupported file type. Only .pdf and .docx files are allowed."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({"detail": "Success!"}, status=status.HTTP_201_CREATED)


class SetProfileInfoView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        user = request.user

        avatar = request.FILES.get("avatar")
        if avatar:
            user.avatar = avatar
            user.save()

        return Response(
            {
                "avatar": request.user.avatar.url if request.user.avatar else None,
            },
            status=status.HTTP_200_OK,
        )


class GetUserDataView(APIView):
    def get(self, request):
        documents = Document.objects.filter(user=request.user).order_by("title")
        data = []
        for doc in documents:
            data.append(
                {
                    "document_id": doc.id,
                    "document_title": doc.title,
                    "preview_image": (
                        f"{settings.DOMAIN}{doc.preview.url}" if doc.preview else None
                    ),
                    "filepath": doc.pdf_file.url if doc.pdf_file else None,
                }
            )

        return Response(
            {
                "isAuthenticated": True,
                "username": request.user.username,
                "email": request.user.email,
                "phone_number": request.user.phone_number,
                "avatar": request.user.avatar.url if request.user.avatar else None,
                "files": data,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        document_id = request.data.get("document_id")
        if not document_id:
            return Response(
                {"error": "No document_id provided"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            document = Document.objects.get(id=document_id)
        except Document.DoesNotExist:
            return Response(
                {"error": "Document not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if document.user != request.user:
            return Response({"error": "Access denied"}, status=status.HTTP_403)

        document.delete()
        return Response({"status": "deleted"}, status=status.HTTP_200_OK)


class SearchView(APIView):
    def post(self, request):
        query = request.data.get("query", "")
        if not query:
            return Response(
                {"error": "Missing query"}, status=status.HTTP_400_BAD_REQUEST
            )

        results = search_query(query)
        return Response(results, status=status.HTTP_200_OK)


class DownloadFileView(APIView):

    def post(self, request):
        doc_id = request.data.get("document_id")
        try:
            document = Document.objects.get(id=doc_id)
        except Document.DoesNotExist:
            return Response(
                {"error": "Document not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if document.docx_file and document.docx_file.name:
            file_field = document.docx_file
        elif document.pdf_file and document.pdf_file.name:
            file_field = document.pdf_file
        else:
            return Response(
                {"error": "No file available for this document"},
                status=status.HTTP_404_NOT_FOUND,
            )

        file_path = file_field.path
        if not os.path.exists(file_path):
            return Response(
                {"error": "File not found on server"}, status=status.HTTP_404_NOT_FOUND
            )

        if request.user.is_authenticated:
            Document.objects.filter(id=document.id).update(
                downloads_count=F("downloads_count") + 1
            )

        response = FileResponse(open(file_path, "rb"))
        response["Content-Disposition"] = (
            f'attachment; filename="{os.path.basename(file_path)}"'
        )
        return response

    def get(self, request):
        top_docs = Document.objects.order_by("-downloads_count")[:10]

        data = [
            {
                "document_id": doc.id,
                "document_title": doc.title,
                "preview_image": (
                    f"{settings.DOMAIN}{doc.preview.url}" if doc.preview else None
                ),
                "filepath": doc.pdf_file.url if doc.pdf_file else None,
                "downloads_count": doc.downloads_count,
            }
            for doc in top_docs
        ]

        return Response(data)


class DocumentPageView(APIView):

    def get(self, request):
        document_id = request.query_params.get("document_id")

        if not document_id:
            return Response(
                {"error": "document_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            document = Document.objects.get(id=document_id)
        except Document.DoesNotExist:
            return Response({"error": "Document not found"}, status=404)

        if not request.user.is_authenticated:
            return Response(
                {"status": False, "owner_username": document.user.username},
                status=status.HTTP_200_OK,
            )

        if document.user == request.user:
            return Response(
                {"status": "owner", "owner_username": document.user.username},
                status=status.HTTP_200_OK,
            )

        is_saved = document in request.user.saved_documents.all()
        return Response(
            {"status": is_saved, "owner_username": document.user.username},
            status=status.HTTP_200_OK,
        )

    def post(self, request):

        document_id = request.data.get("document_id")
        if not document_id:
            return Response(
                {"error": "document_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            document = Document.objects.get(id=document_id)
        except Document.DoesNotExist:
            return Response({"error": "Document not found"}, status=404)

        if document in request.user.saved_documents.all():
            request.user.saved_documents.remove(document)
            return Response({"status": "removed"}, status=status.HTTP_200_OK)
        else:
            request.user.saved_documents.add(document)
            return Response({"status": "saved"}, status=status.HTTP_200_OK)


class SavedDocView(APIView):
    def get(self, request):
        user = request.user
        saved_docs = user.saved_documents.all()

        data = [
            {
                "id": doc.id,
                "title": doc.title,
                "preview": (
                    f"{settings.DOMAIN}{doc.preview.url}" if doc.preview else None
                ),
                "pdf_file": doc.pdf_file.url if doc.pdf_file else None,
            }
            for doc in saved_docs
        ]
        return Response(data)


class AllDocsView(APIView):

    def get(self, request):
        docs = Document.objects.filter(is_indexed=True).order_by("title")

        data = [
            {
                "document_id": doc.id,
                "document_title": doc.title,
                "preview_image": (
                    f"{settings.DOMAIN}{doc.preview.url}" if doc.preview else None
                ),
                "filepath": doc.pdf_file.url if doc.pdf_file else None,
            }
            for doc in docs
        ]

        return Response(data, status=status.HTTP_200_OK)
