from django.urls import re_path
from chat.consumers import ChatConsumer  # Assuming chat is the name of your chat app
from bet.consumers import BetConsumer, MultiBetConsumer  # Assuming bets is the name of your bets app

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<room_uuid>[0-9a-f-]+)/$', ChatConsumer.as_asgi()),  # Chat routing
    re_path(r'ws/bet/$', BetConsumer.as_asgi()),  # Bets routing
    re_path(r'ws/multibet/(?P<multibet_uuid>[0-9a-f-]+)/$', MultiBetConsumer.as_asgi()),  # MultiBet routing
]