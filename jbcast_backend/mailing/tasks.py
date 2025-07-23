import pandas as pd
from celery import shared_task
from celery.utils.log import get_task_logger
from django.conf import settings
from django.core.mail import EmailMultiAlternatives, get_connection
from django.template.loader import render_to_string
from django.utils import timezone

from .models import EmailFile, EmailRecord, SMTPAccount

logger = get_task_logger(__name__)
from django.utils.html import strip_tags





import os
from email.mime.image import MIMEImage

def attach_inline_images(msg, image_names, image_dir):
    """
    Attach images to the email as inline attachments using Content-ID.
    """
    for image_name in image_names:
        image_path = os.path.join(image_dir, image_name)
        if os.path.exists(image_path):
            with open(image_path, 'rb') as img_file:
                mime_img = MIMEImage(img_file.read())
                mime_img.add_header('Content-ID', f'<{image_name}>')
                mime_img.add_header("Content-Disposition", "inline", filename=image_name)
                msg.attach(mime_img)


# @shared_task
def process_uploaded_file(email_file_id):
    print(f"[CELERY TASK STARTED] Processing file: {email_file_id}")
    try:
        email_file = EmailFile.objects.get(id=email_file_id)
        file_path = email_file.file.path
        print(f"[CELERY ] file name: {file_path}")

        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
        elif file_path.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(file_path)
        else:
            raise ValueError("Unsupported file format")
        
        print(f"[CELERY ] dataframe: {df}")

        for _, row in df.iterrows():
            name = row.get('Name') or ''
            email = row.get('Email') or ''
            subject = row.get('Subject') or ''
            body = row.get('Body') or ''
            if not email:
                continue

            EmailRecord.objects.create(
                file=email_file,
                name=name,
                email=email,
                subject=subject,
                body=body,
                cc='',
                bcc='',
                is_sent=False
            )

        return f"Processed file ID {email_file_id} with {len(df)} rows."

    except EmailFile.DoesNotExist:
        return f"EmailFile with ID {email_file_id} not found."

    except Exception as e:
        return f"Error processing file ID {email_file_id}: {str(e)}"


@shared_task(bind=True, max_retries=3)
def send_emails_for_file(self, email_file_id):
    try:
        file = EmailFile.objects.get(id=email_file_id)
        smtp = SMTPAccount.objects.get(user=file.user)
        # Reset daily quota if new day
        if smtp.last_reset.date() < timezone.now().date():
            smtp.emails_sent_today = 0
            smtp.rate_limited = False
            smtp.last_reset = timezone.now()
            smtp.save()
        if smtp.rate_limited:
            return f"SMTP account for {file.user.email} is rate-limited."
        connection = get_connection(
            host=smtp.email_host,
            port=smtp.email_port,
            username=smtp.email_host_user,
            password=smtp.email_host_password,
            use_tls=smtp.use_tls
        )
        unsent_emails = file.email_records.filter(is_sent=False)
        for record in unsent_emails:
            if smtp.emails_sent_today >= 500:
                smtp.rate_limited = True
                smtp.save()
                break
            try:
                subject = record.subject or "No Subject"
                from_email = smtp.email_host_user
                to_email = [record.email]
                cc_list = record.cc.split(',') if record.cc else []
                bcc_list = record.bcc.split(',') if record.bcc else []
                context = {
                    'name': record.name,
                    'body': record.body or '',
                }
                html_content = render_to_string("emails/default_email.html", context)
                plain_content = strip_tags(html_content)
                msg = EmailMultiAlternatives(
                    subject, plain_content, from_email, to_email, cc=cc_list, bcc=bcc_list, connection=connection
                )
                msg.attach_alternative(html_content, "text/html")
                # Attach inline images
                image_names = ["jbc-logo.png"]
                image_dir = os.path.join(settings.BASE_DIR, "templates", "emails")
                attach_inline_images(msg, image_names, image_dir)
                msg.send()
                record.is_sent = True
                record.send_attempts += 1
                record.last_sent_at = timezone.now()
                record.error_message = ''
                record.save()
                smtp.emails_sent_today += 1
                smtp.save()
                # logger.info(f"✅ Email '{subject}' successfully sent to {to_email}")
            except Exception as e:
                error_str = str(e)[:500]
                if "quota" in error_str.lower() or "limit" in error_str.lower():
                    smtp.rate_limited = True
                    smtp.save()
                record.send_attempts += 1
                record.last_sent_at = timezone.now()
                record.error_message = error_str
                record.save()
                # logger.error(f"❌ Failed to send email '{subject}' to {to_email}: {error_str}")
        return f"Processed email sending for file ID {file.id}"
    except Exception as e:
        # logger.error(f"❌ Fatal error sending emails: {str(e)}")
        return f"Fatal error sending emails: {str(e)}"


@shared_task
def send_email_record(record_id):
    try:
        record = EmailRecord.objects.get(id=record_id)

        if record.is_sent:
            return f"Email {record.email} already sent."

        smtp = SMTPAccount.objects.get(user=record.file.user)

        # Reset quota if needed
        if smtp.last_reset.date() < timezone.now().date():
            smtp.emails_sent_today = 0
            smtp.rate_limited = False
            smtp.last_reset = timezone.now()
            smtp.save()

        if smtp.rate_limited or smtp.emails_sent_today >= 500:
            smtp.rate_limited = True
            smtp.save()
            return f"Gmail quota reached for {record.file.user.email}"

        connection = get_connection(
            host=smtp.email_host,
            port=smtp.email_port,
            username=smtp.email_host_user,
            password=smtp.email_host_password,
            use_tls=smtp.use_tls
        )

        context = {
            'name': record.name,
            'body': record.body or '',
        }

        html_content = render_to_string("emails/default_email.html", context)

        msg = EmailMultiAlternatives(
            subject=record.subject or "No Subject",
            body=record.body or '',
            from_email=smtp.email_host_user,
            to=[record.email],
            cc=record.cc.split(',') if record.cc else [],
            bcc=record.bcc.split(',') if record.bcc else [],
            connection=connection
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send()

        record.is_sent = True
        record.send_attempts += 1
        record.last_sent_at = timezone.now()
        record.error_message = ''
        record.save()

        smtp.emails_sent_today += 1
        smtp.save()

        return f"Email sent to {record.email}"

    except Exception as e:
        error_str = str(e)[:500]
        if 'record' in locals():
            record.send_attempts += 1
            record.last_sent_at = timezone.now()
            record.error_message = error_str
            record.save()
            return f"Error sending email to {record.email}: {error_str}"
        return f"Fatal error sending email: {error_str}"
