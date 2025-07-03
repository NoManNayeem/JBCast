from rest_framework import serializers
from .models import EmailFile, EmailRecord

# ----------------------------------------
# Email Record Serializer
# Used inside file detail views
# ----------------------------------------
class EmailRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailRecord
        fields = [
            'id', 'name', 'email', 'subject', 'body',
            'cc', 'bcc', 'is_sent', 'send_attempts',
            'last_sent_at', 'error_message'
        ]
        read_only_fields = [
            'id', 'is_sent', 'send_attempts',
            'last_sent_at', 'error_message'
        ]


# ----------------------------------------
# File Upload Serializer
# Used when posting a new file
# ----------------------------------------
class EmailFileUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailFile
        fields = ['id', 'title', 'file', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


# ----------------------------------------
# File List Serializer
# Used for displaying all uploaded files
# ----------------------------------------
class EmailFileListSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailFile
        fields = ['id', 'title', 'uploaded_at']


# ----------------------------------------
# File Detail Serializer
# Used for showing file + nested email records
# ----------------------------------------
class EmailFileDetailSerializer(serializers.ModelSerializer):
    email_records = EmailRecordSerializer(many=True, read_only=True)

    class Meta:
        model = EmailFile
        fields = ['id', 'title', 'uploaded_at', 'email_records']
