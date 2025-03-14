from django.contrib.auth import authenticate, login, logout
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.middleware.csrf import get_token

# Получение CSRF токена
class GetCSRFToken(APIView):
    def get(self, request):
        response = Response({'detail': 'CSRF cookie set'})
        response['X-CSRFToken'] = get_token(request)
        print(response['X-CSRFToken'])
        return response


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
