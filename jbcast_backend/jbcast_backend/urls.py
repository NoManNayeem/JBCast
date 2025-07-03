from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static

from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi




# Custom Admin Titles
admin.site.site_header = "JBCast Admin"
admin.site.site_title = "JBCast Admin Portal"
admin.site.index_title = "Welcome to JBCast – MailBridge Admin"



# Swagger config
schema_view = get_schema_view(
    openapi.Info(
        title="JBCast API",
        default_version='v1',
        description="MailBridge by JB – Bulk Email Service API",
        terms_of_service="https://www.example.com/terms/",
        contact=openapi.Contact(email="support@jbcast.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # Core app API routes (modular)
    path('api/', include('core.urls')),

    
    # Mailing app API routes (modular)
    path('api/', include('mailing.urls')),

    # Swagger Docs
    re_path(r'^swagger(?P<format>\.json|\.yaml)$',
            schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0),
         name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0),
         name='schema-redoc'),
]

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL,
                          document_root=settings.STATIC_ROOT)


