import os

from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.http import FileResponse, Http404
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
        print(response["X-CSRFToken"])
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
            {"detail": "Successfully registered and logged in."},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

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
        return Response({"detail": "Successfully logged in."})


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
        # print("!!!Avatar: ", request.user.avatar.url if request.user.avatar else None)
        if not request.user.is_authenticated:
            return Response({"isAuthenticated": False})
        return Response(
            {
                "isAuthenticated": True,
                "username": request.user.username,
                "avatar": request.user.avatar.url if request.user.avatar else None,
            }
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

        document = Document.objects.create(
            user=request.user,
            title=file_obj.name,
            file=file_obj,
            is_public=is_public,
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

        return Response({"detail": "Avatar updated"}, status=status.HTTP_200_OK)


class GetProfileInfoView(APIView):
    def get(self, request):
        user = request.user
        return Response(
            {"ava": user.avatar.url if user.avatar else None},
            status=status.HTTP_200_OK,
        )


class SearchView(APIView):
    def post(self, request):
        query = request.data.get("query", "")
        print(query)
        if not query:
            return Response(
                {"error": "Missing query"}, status=status.HTTP_400_BAD_REQUEST
            )

        results = search_query(query)
        return Response(results, status=status.HTTP_200_OK)


class DownloadFileView(APIView):
    def get(self, request, file_path):
        full_path = os.path.join(settings.MEDIA_ROOT, file_path)
        print("HERE:", full_path)
        if not os.path.exists(full_path):
            raise Http404("File not found")

        response = FileResponse(open(full_path, "rb"))
        response["Content-Disposition"] = (
            f'attachment; filename="{os.path.basename(full_path)}"'
        )
        return response
