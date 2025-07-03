import os
from dotenv import load_dotenv
from celery import Celery

# Load environment variables
load_dotenv()

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jbcast_backend.settings')

app = Celery('jbcast_backend')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
