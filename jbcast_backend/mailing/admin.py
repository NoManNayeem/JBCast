from django.contrib import admin
from .models import EmailFile, EmailRecord, SMTPAccount


@admin.register(EmailRecord)
class EmailRecordAdmin(admin.ModelAdmin):
    list_display = (
        'email', 'name', 'subject', 'is_sent',
        'send_attempts', 'last_sent_at', 'file'
    )
    list_filter = ('is_sent', 'file', 'last_sent_at', 'created_at')
    search_fields = ('email', 'name', 'subject', 'file__title')
    readonly_fields = ('created_at', 'updated_at', 'last_sent_at', 'send_attempts', 'error_message')


class EmailRecordInline(admin.TabularInline):
    model = EmailRecord
    extra = 0
    readonly_fields = ('name', 'email', 'subject', 'is_sent', 'send_attempts', 'last_sent_at')


@admin.register(EmailFile)
class EmailFileAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'uploaded_at')
    list_filter = ('uploaded_at',)
    search_fields = ('title', 'user__username', 'user__email')
    inlines = [EmailRecordInline]


@admin.register(SMTPAccount)
class SMTPAccountAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'email_host', 'email_port',
        'emails_sent_today', 'rate_limited', 'last_reset'
    )
    readonly_fields = ('last_reset', 'updated_at')
    search_fields = ('user__username', 'email_host_user', 'email_host')
    list_filter = ('rate_limited',)
