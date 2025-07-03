from django.db import models
from django.contrib.auth.models import User
from django.conf import settings


class EmailFile(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='uploaded_files'
    )
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='uploads/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.user.username})"


class EmailRecord(models.Model):
    file = models.ForeignKey(
        EmailFile,
        on_delete=models.CASCADE,
        related_name='email_records'
    )
    name = models.CharField(max_length=255)
    email = models.EmailField()
    subject = models.CharField(max_length=255, blank=True, null=True)
    body = models.TextField(blank=True, null=True)
    cc = models.TextField(blank=True, null=True)
    bcc = models.TextField(blank=True, null=True)
    is_sent = models.BooleanField(default=False)

    # Tracking info
    send_attempts = models.PositiveIntegerField(default=0)
    last_sent_at = models.DateTimeField(blank=True, null=True)
    error_message = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} <{self.email}>"


class SMTPAccount(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    email_host = models.CharField(max_length=255)
    email_port = models.PositiveIntegerField(default=587)
    email_host_user = models.EmailField()
    email_host_password = models.CharField(max_length=255)
    use_tls = models.BooleanField(default=True)

    # Quota tracking
    emails_sent_today = models.PositiveIntegerField(default=0)
    last_reset = models.DateTimeField(auto_now_add=True)
    rate_limited = models.BooleanField(default=False)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s SMTP Account"
