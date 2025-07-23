from rest_framework import serializers
from .models import EmailFile, EmailRecord


class EmailRecordSerializer(serializers.ModelSerializer):
    """
    Serializer for individual email records associated with an uploaded file.
    """
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


class EmailFileUploadSerializer(serializers.ModelSerializer):
    """
    Serializer used when uploading a new email file.
    """
    class Meta:
        model = EmailFile
        fields = ['id', 'title', 'file', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

    def validate_file(self, file):
        allowed_types = ['.csv', '.xls', '.xlsx']
        if not any(str(file.name).lower().endswith(ext) for ext in allowed_types):
            raise serializers.ValidationError("Only .csv, .xls, and .xlsx files are allowed.")
        return file


class EmailFileListSerializer(serializers.ModelSerializer):
    """
    Serializer for listing uploaded files.
    """
    class Meta:
        model = EmailFile
        fields = ['id', 'title', 'uploaded_at']


class EmailFileDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for showing file detail along with nested email records.
    """
    email_records = EmailRecordSerializer(many=True, read_only=True)

    class Meta:
        model = EmailFile
        fields = ['id', 'title', 'uploaded_at', 'email_records']
