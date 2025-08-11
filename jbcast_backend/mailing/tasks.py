import os
import pandas as pd
from email.mime.image import MIMEImage
from celery import shared_task
from celery.utils.log import get_task_logger
from django.conf import settings
from django.utils import timezone
from django.core.mail import EmailMultiAlternatives, get_connection
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from .models import EmailFile, EmailRecord, SMTPAccount
import time

logger = get_task_logger(__name__)


def attach_inline_images(msg, image_names, image_dir):
    """
    Attach images to the email as inline attachments using Content-ID.
    """
    for image_name in image_names:
        image_path = os.path.join(image_dir, image_name)
        if os.path.exists(image_path):
            try:
                with open(image_path, 'rb') as img_file:
                    mime_img = MIMEImage(img_file.read())
                    mime_img.add_header('Content-ID', f'<{image_name}>')
                    mime_img.add_header("Content-Disposition", "inline", filename=image_name)
                    msg.attach(mime_img)
            except Exception as e:
                logger.error(f"Failed to attach image {image_name}: {str(e)}")
        else:
            logger.warning(f"Image not found: {image_path}")


@shared_task(bind=True)
def process_uploaded_file(self, email_file_id):
    logger.info(f"[TASK STARTED] Processing file: {email_file_id}")
    try:
        email_file = EmailFile.objects.get(id=email_file_id)
        file_path = email_file.file.path

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Uploaded file not found at path: {file_path}")

        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
        elif file_path.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(file_path)
        else:
            raise ValueError("Unsupported file format. Only CSV, XLS, and XLSX are allowed.")

        if df.empty:
            logger.warning(f"Uploaded file {file_path} is empty.")
            return f"No rows to process for file ID {email_file_id}."

        # Extract common subject/body from first row
        first_row = df.iloc[0]
        default_subject = str(first_row.get('Subject', '')).strip()
        default_body = str(first_row.get('Body', '')).strip()

        created_count = 0
        for _, row in df.iterrows():
            email = str(row.get('Email', '')).strip()
            if not email:
                continue

            EmailRecord.objects.create(
                file=email_file,
                name=str(row.get('Name', '')).strip(),
                email=email,
                subject=default_subject,
                body=default_body,
                cc='',
                bcc='',
                is_sent=False
            )
            created_count += 1

        logger.info(f"[TASK COMPLETED] Created {created_count} records for file ID {email_file_id}")
        return f"Processed file ID {email_file_id} with {created_count} records."

    except EmailFile.DoesNotExist:
        logger.error(f"EmailFile with ID {email_file_id} does not exist.")
        return f"EmailFile with ID {email_file_id} not found."

    except Exception as e:
        logger.exception(f"Exception during file processing: {str(e)}")
        return f"Error processing file ID {email_file_id}: {str(e)}"


@shared_task(bind=True, max_retries=3)
def send_emails_for_file(self, email_file_id):
    try:
        file = EmailFile.objects.get(id=email_file_id)
        smtp = SMTPAccount.objects.get(user=file.user)

        if smtp.last_reset.date() < timezone.now().date():
            smtp.emails_sent_today = 0
            smtp.rate_limited = False
            smtp.last_reset = timezone.now()
            smtp.save()

        if smtp.rate_limited:
            return f"SMTP account for {file.user.email} is rate-limited."

        unsent_emails = file.email_records.filter(is_sent=False)
        image_names = ["JB-Connect-Ltd.jpg"]
        image_dir = os.path.join(settings.BASE_DIR, "templates", "emails")

        for record in unsent_emails:
            if smtp.emails_sent_today >= 500:
                smtp.rate_limited = True
                smtp.save()
                break
            
            connection = None
            try:
                connection = get_connection(
                    host=smtp.email_host,
                    port=smtp.email_port,
                    username=smtp.email_host_user,
                    password=smtp.email_host_password,
                    use_tls=smtp.use_tls
                )
                connection.open()
                subject = record.subject or "No Subject"
                from_email = smtp.email_host_user
                to_email = [record.email]
                cc_list = record.cc.split(',') if record.cc else []
                bcc_list = record.bcc.split(',') if record.bcc else []

                context = {'name': record.name, 'body': record.body or ''}
                html_content = render_to_string("emails/default_email.html", context)
                plain_content = strip_tags(html_content)

                msg = EmailMultiAlternatives(
                    subject=subject,
                    body=plain_content,
                    from_email=from_email,
                    to=to_email,
                    cc=cc_list,
                    bcc=bcc_list,
                    connection=connection
                )
                msg.attach_alternative(html_content, "text/html")
                attach_inline_images(msg, image_names, image_dir)
                msg.send()

                time.sleep(2)

                record.is_sent = True
                record.send_attempts += 1
                record.last_sent_at = timezone.now()
                record.error_message = ''
                record.save()

                smtp.emails_sent_today += 1
                smtp.save()

            except Exception as e:
                error_msg = str(e)[:500]
                logger.error(f"Failed to send email to {record.email}: {error_msg}")
                if "quota" in error_msg.lower() or "limit" in error_msg.lower():
                    smtp.rate_limited = True
                    smtp.save()

                record.send_attempts += 1
                record.last_sent_at = timezone.now()
                record.error_message = error_msg
                record.save()
            finally:
                if connection:
                    connection.close()

        return f"Email sending task completed for file ID {file.id}"

    except Exception as e:
        logger.exception(f"Fatal error sending emails: {str(e)}")
        return f"Fatal error sending emails: {str(e)}"


@shared_task(bind=True)
def send_email_record(self, record_id):
    try:
        record = EmailRecord.objects.get(id=record_id)

        if record.is_sent:
            return f"Email {record.email} already sent."

        smtp = SMTPAccount.objects.last()

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

        context = {'name': record.name, 'body': record.body or ''}
        html_content = render_to_string("emails/default_email.html", context)
        plain_content = strip_tags(html_content)

        msg = EmailMultiAlternatives(
            subject=record.subject or "No Subject",
            body=plain_content,
            from_email=smtp.email_host_user,
            to=[record.email],
            cc=record.cc.split(',') if record.cc else [],
            bcc=record.bcc.split(',') if record.bcc else [],
            connection=connection
        )
        msg.attach_alternative(html_content, "text/html")
        attach_inline_images(msg, ["JB-Connect-Ltd.jpg"], os.path.join(settings.BASE_DIR, "templates", "emails"))
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
        error_msg = str(e)[:500]
        logger.error(f"Error sending single email: {error_msg}")
        if 'record' in locals():
            record.send_attempts += 1
            record.last_sent_at = timezone.now()
            record.error_message = error_msg
            record.save()
            return f"Error sending email to {record.email}: {error_msg}"
        return f"Fatal error sending email: {error_msg}"
