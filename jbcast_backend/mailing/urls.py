from django.urls import path
from .views import (
    EmailFileDeleteView,
    EmailFileUploadView,
    EmailFileListView,
    EmailFileDetailView,
    SendAllEmailsView,
    SendSingleEmailView,
)

urlpatterns = [
    # Upload a new email file
    path('upload/', EmailFileUploadView.as_view(), name='email-file-upload'),

    # List all uploaded files for the user
    path('files/', EmailFileListView.as_view(), name='email-file-list'),

    # Get detail + records of one uploaded file
    path('files/<int:pk>/', EmailFileDetailView.as_view(), name='email-file-detail'),

    # Trigger send all emails for a file
    path('files/<int:pk>/send/', SendAllEmailsView.as_view(), name='email-file-send-all'),

    # Trigger send for a single email record
    path('email/<int:pk>/send/', SendSingleEmailView.as_view(), name='email-record-send'),

    # Delete File
    path('files/<int:pk>/delete/', EmailFileDeleteView.as_view(), name='email-file-delete'),

]
