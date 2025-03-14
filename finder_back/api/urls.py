from django.urls import path
from .views import GetCSRFToken, LoginView, LogoutView, SessionView, WhoAmIView

urlpatterns = [
    path('csrf/', GetCSRFToken.as_view(), name='api-csrf'),
    path('login/', LoginView.as_view(), name='api-login'),
    path('logout/', LogoutView.as_view(), name='api-logout'),
    path('session/', SessionView.as_view(), name='api-session'),
    path('whoami/', WhoAmIView.as_view(), name='api-whoami'),
]
