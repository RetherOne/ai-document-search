from django.urls import path

from .views import (
    FileUploadView,
    GetCSRFToken,
    LoginView,
    LogoutView,
    RegisterView,
    SessionView,
    WhoAmIView,
)

urlpatterns = [
    path("csrf/", GetCSRFToken.as_view(), name="api-csrf"),
    path("register/", RegisterView.as_view(), name="api-register"),
    path("login/", LoginView.as_view(), name="api-login"),
    path("logout/", LogoutView.as_view(), name="api-logout"),
    path("session/", SessionView.as_view(), name="api-session"),
    path("whoami/", WhoAmIView.as_view(), name="api-whoami"),
    path("upload/", FileUploadView.as_view(), name="file-upload"),
]
