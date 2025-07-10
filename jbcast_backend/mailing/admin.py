from django.contrib import admin
from .models import EmailFile, EmailRecord, SMTPAccount

admin.site.register(EmailFile)
admin.site.register(EmailRecord)
admin.site.register(SMTPAccount)
