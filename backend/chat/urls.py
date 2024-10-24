from django.urls import path

from chat.views import UserChatsView, ChatCreateView, MessageViewSet, AddUserToChatView, OlderMessageViewSet, \
    GetChatDetailsView, GetChatBetweenUsersView

urlpatterns = [
    path('api/users/chats/', UserChatsView.as_view(), name='user_chats'),
    path('api/users/create-chat/', ChatCreateView.as_view(), name='create-chat'),
    path('api/users/add-chat-user/', AddUserToChatView.as_view(), name='add_chat_user'),
    path('api/chats/older-messages/', OlderMessageViewSet.as_view(), name='get_older_messages'),
    path('api/chats/messages/', MessageViewSet.as_view(), name='get_messages'),
    path('api/chats/details/', GetChatDetailsView.as_view(), name='get_chat_details'),
    path('api/chats/between-users/', GetChatBetweenUsersView.as_view(), name='get_chat_between_users'),
]