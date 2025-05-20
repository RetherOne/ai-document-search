from django.urls import path

from .views import (
    AllDocsView,
    DocumentPageView,
    DownloadView,
    FileUploadView,
    GetCSRFToken,
    UsersDocView,
    LoginView,
    LogoutView,
    RegisterView,
    SavedDocView,
    SearchView,
    SessionView,
    SetProfileInfoView,
)

urlpatterns = [
    path("csrf/", GetCSRFToken.as_view(), name="api-csrf"),
    path("register/", RegisterView.as_view(), name="api-register"),
    path("login/", LoginView.as_view(), name="api-login"),
    path("logout/", LogoutView.as_view(), name="api-logout"),
    path("session/", SessionView.as_view(), name="api-session"),
    path("upload/", FileUploadView.as_view(), name="api-file-upload"),
    path("get-user-data/", UsersDocView.as_view(), name="api-get-user-docs"),
    path("doc-page/", DocumentPageView.as_view(), name="api-doc-page"),
    path("saved-docs/", SavedDocView.as_view(), name="api-saved-docs"),
    path("all-docs/", AllDocsView.as_view(), name="api-all-docs"),
    path("set-profile-data/", SetProfileInfoView.as_view(), name="api-set-profdata"),
    path("search/", SearchView.as_view(), name="api-search"),
    path(
        "download/",
        DownloadView.as_view(),
        name="api_download_file",
    ),
]
