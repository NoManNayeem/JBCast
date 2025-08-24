from rest_framework import serializers
from .models import EmailFile, EmailRecord


class EmailRecordSerializer(serializers.ModelSerializer):
    """
    Serializer for individual email records associated with an uploaded file.
    - `attachments`: read-only list derived from the model's `attachments_urls`
    - `attachments_urls`: raw comma-separated URLs string (read-only)
    """
    attachments = serializers.SerializerMethodField(read_only=True)
    attachments_urls = serializers.CharField(read_only=True, allow_blank=True, allow_null=True)

    class Meta:
        model = EmailRecord
        fields = [
            'id', 'name', 'email', 'subject', 'body',
            'cc', 'bcc', 'is_sent', 'send_attempts',
            'last_sent_at', 'error_message',
            # New
            'attachments_urls', 'attachments',
        ]
        read_only_fields = [
            'id', 'is_sent', 'send_attempts',
            'last_sent_at', 'error_message',
            'attachments_urls', 'attachments',
        ]

    def get_attachments(self, obj):
        """Returns a clean list of http(s) URLs parsed from attachments_urls."""
        return obj.attachments_list


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
    Serializer for listing uploaded files, including sent/total counts.
    (These are expected to be annotated in the queryset.)
    """
    total_count = serializers.IntegerField(read_only=True)
    sent_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = EmailFile
        fields = ['id', 'title', 'uploaded_at', 'sent_count', 'total_count']


class EmailFileDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for showing file detail along with nested email records and counts.
    """
    email_records = EmailRecordSerializer(many=True, read_only=True)
    sent_count = serializers.SerializerMethodField()
    total_count = serializers.SerializerMethodField()

    class Meta:
        model = EmailFile
        fields = ['id', 'title', 'uploaded_at', 'sent_count', 'total_count', 'email_records']

    def get_total_count(self, obj):
        # Use annotation if present; otherwise compute
        return getattr(obj, 'total_count', obj.email_records.count())

    def get_sent_count(self, obj):
        # Use annotation if present; otherwise compute
        ann = getattr(obj, 'sent_count', None)
        if ann is not None:
            return ann
        return obj.email_records.filter(is_sent=True).count()
