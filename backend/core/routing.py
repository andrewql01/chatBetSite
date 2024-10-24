from django.urls import re_path
from .consumers import UnifiedConsumer

websocket_urlpatterns = [
    re_path(r'ws/app/$', UnifiedConsumer.as_asgi()),
]
