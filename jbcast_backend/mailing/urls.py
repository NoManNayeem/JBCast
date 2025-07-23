from django.urls import path
from .views import (
    EmailFileUploadView,
    EmailFileListView,
    EmailFileDetailView,
    EmailFileDeleteView,
    SendAllEmailsView,
    SendSingleEmailView,
)

urlpatterns = [
    # ----------------------------------------
    # File Upload & Management Endpoints
    # ----------------------------------------
    path('upload/', EmailFileUploadView.as_view(), name='email-file-upload'),
    path('files/', EmailFileListView.as_view(), name='email-file-list'),
    path('files/<int:pk>/', EmailFileDetailView.as_view(), name='email-file-detail'),
    path('files/<int:pk>/delete/', EmailFileDeleteView.as_view(), name='email-file-delete'),

    # ----------------------------------------
    # Email Sending Endpoints
    # ----------------------------------------
    path('files/<int:pk>/send/', SendAllEmailsView.as_view(), name='email-file-send-all'),
    path('email/<int:pk>/send/', SendSingleEmailView.as_view(), name='email-record-send'),
]
