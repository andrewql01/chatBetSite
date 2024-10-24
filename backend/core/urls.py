from django.urls import include, path
from django.contrib import admin


urlpatterns = [
    path("", include("accounts.urls")),
    path("", include("chat.urls")),
    path("", include("bet.urls")),
    path("", include("scraper.urls")),
    path('admin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls')),
]
