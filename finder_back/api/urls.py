from django.conf import settings
from django.conf.urls.static import static
from django.urls import path

from .views import (
    FileUploadView,
    GetCSRFToken,
    GetProfileInfoView,
    LoginView,
    LogoutView,
    RegisterView,
    SessionView,
    SetProfileInfoView,
    WhoAmIView,
)

urlpatterns = [
    path("csrf/", GetCSRFToken.as_view(), name="api-csrf"),
    path("register/", RegisterView.as_view(), name="api-register"),
    path("login/", LoginView.as_view(), name="api-login"),
    path("logout/", LogoutView.as_view(), name="api-logout"),
    path("session/", SessionView.as_view(), name="api-session"),
    path("whoami/", WhoAmIView.as_view(), name="api-whoami"),
    path("upload/", FileUploadView.as_view(), name="api-file-upload"),
    path("profile-data/", GetProfileInfoView.as_view(), name="api-profile-data"),
    path(
        "set-profile-data/", SetProfileInfoView.as_view(), name="api-set-profile-data"
    ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
