from django.urls import path

from .views import (
    FileUploadView,
    GetCSRFToken,
    GetProfileInfoView,
    LoginView,
    LogoutView,
    RegisterView,
    SearchView,
    SessionView,
    SetProfileInfoView,
    DownloadFileView,
)

urlpatterns = [
    path("csrf/", GetCSRFToken.as_view(), name="api-csrf"),
    path("register/", RegisterView.as_view(), name="api-register"),
    path("login/", LoginView.as_view(), name="api-login"),
    path("logout/", LogoutView.as_view(), name="api-logout"),
    path("session/", SessionView.as_view(), name="api-session"),
    path("upload/", FileUploadView.as_view(), name="api-file-upload"),
    path("profile-data/", GetProfileInfoView.as_view(), name="api-profile-data"),
    path("set-profile-data/", SetProfileInfoView.as_view(), name="api-set-profdata"),
    path("search/", SearchView.as_view(), name="api-search"),
    path(
        "download/<path:file_path>",
        DownloadFileView.as_view(),
        name="api_download_file",
    ),
]
