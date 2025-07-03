from rest_framework import generics, permissions, status, views
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import EmailFile, EmailRecord
from .serializers import (
    EmailFileUploadSerializer,
    EmailFileListSerializer,
    EmailFileDetailSerializer,
)

from .tasks import process_uploaded_file, send_emails_for_file, send_email_record


# ----------------------------------------
# Upload Email File (CSV/XLSX)
# Starts async background parse task
# ----------------------------------------
class EmailFileUploadView(generics.CreateAPIView):
    serializer_class = EmailFileUploadSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        file_instance = serializer.save(user=self.request.user)
        # process_uploaded_file.delay(file_instance.id)
        process_uploaded_file(file_instance.id)

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ----------------------------------------
# List Uploaded Files (for current user)
# ----------------------------------------
class EmailFileListView(generics.ListAPIView):
    serializer_class = EmailFileListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return EmailFile.objects.none()
        return EmailFile.objects.filter(user=self.request.user).order_by('-uploaded_at')


# ----------------------------------------
# Retrieve EmailFile with nested records
# ----------------------------------------
class EmailFileDetailView(generics.RetrieveAPIView):
    serializer_class = EmailFileDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return EmailFile.objects.none()
        return EmailFile.objects.filter(user=self.request.user)


# ----------------------------------------
# Trigger: Send all emails for a file
# ----------------------------------------
class SendAllEmailsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        email_file = get_object_or_404(EmailFile, id=pk, user=request.user)
        send_emails_for_file.delay(email_file.id)
        return Response({"message": "Email sending initiated."}, status=status.HTTP_202_ACCEPTED)


# ----------------------------------------
# Trigger: Send individual email record
# ----------------------------------------
class SendSingleEmailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        email_record = get_object_or_404(EmailRecord, id=pk, file__user=request.user)

        if email_record.is_sent:
            return Response({"detail": "Email already sent."}, status=status.HTTP_400_BAD_REQUEST)

        send_email_record.delay(email_record.id)
        return Response({"message": f"Email sending queued for {email_record.email}."}, status=status.HTTP_202_ACCEPTED)


# views.py
from rest_framework import generics, permissions
from .models import EmailFile
from .serializers import EmailFileDetailSerializer

class EmailFileDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return EmailFile.objects.filter(user=self.request.user)
