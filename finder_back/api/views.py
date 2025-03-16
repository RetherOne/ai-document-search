from django.contrib.auth import authenticate, login, logout
from .models import CustomUser, UserFile
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from django.middleware.csrf import get_token
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from .serializers import UserFileSerializer 


# Получение CSRF токена
class GetCSRFToken(APIView):
    def get(self, request):
        response = Response({'detail': 'CSRF cookie set'})
        response['X-CSRFToken'] = get_token(request)
        print(response['X-CSRFToken'])
        return response


class RegisterView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email', '').strip()
        # first_name = request.data.get('first_name', '').strip()
        # last_name = request.data.get('last_name', '').strip()

        # Проверяем, что все поля заполнены
        # if not username or not password or not password2 or not email:
        #     return Response({'detail': 'All fields are required!'}, status=status.HTTP_400_BAD_REQUEST)

        # Проверяем, что пароли совпадают
        # if password != password2:
        #     return Response({'detail': 'Passwords do not match!'}, status=status.HTTP_400_BAD_REQUEST)

        # Проверяем, что email корректный
        try:
            validate_email(email)
        except ValidationError:
            return Response({'detail': 'Invalid email format!'}, status=status.HTTP_400_BAD_REQUEST)

        # Проверяем, что пользователь с таким username не существует
        if CustomUser.objects.filter(username=username).exists():
            return Response({'detail': 'User with this username already exists!'}, status=status.HTTP_400_BAD_REQUEST)

        # Проверяем, что email не занят
        if CustomUser.objects.filter(email=email).exists():
            return Response({'detail': 'User with this email already exists!'}, status=status.HTTP_400_BAD_REQUEST)

        # Создаем пользователя
        user = CustomUser.objects.create_user(
            username=username,
            password=password,
            email=email,
            # first_name=first_name,
            # last_name=last_name
        )

        # Автоматически логиним пользователя
        login(request, user)

        return Response({'detail': 'Successfully registered and logged in.'}, status=status.HTTP_201_CREATED)

# Логин (авторизация пользователя)
class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'detail': 'Please provide username and password.'}, status=400)

        user = authenticate(username=username, password=password)
        if user is None:
            return Response({'detail': 'Invalid credentials!'}, status=400)

        login(request, user)
        return Response({'detail': 'Successfully logged in.'})


# Логаут (выход из системы)
class LogoutView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'You\'re not logged in.'}, status=400)

        logout(request)
        return Response({'detail': 'Successfully logged out.'})


# Проверка сессии (кто авторизован)
class SessionView(APIView):

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'isAuthenticated': False})
        return Response({'isAuthenticated': True, 'username': request.user.username})


# Получение информации о пользователе (проверка текущего пользователя)
class WhoAmIView(APIView):
    permission_classes = [IsAuthenticated]  # Только для авторизованных пользователей

    def get(self, request):
        return Response({'username': request.user.username})


class FileUploadView(APIView):
    # permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'detail': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        user_file = UserFile.objects.create(user=request.user, file=file_obj)

        # Используем сериализатор вместо ручного JSON
        return Response(UserFileSerializer(user_file).data, status=status.HTTP_201_CREATED)