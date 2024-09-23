from django.urls import include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from accounts.views import RegisterView, CurrentUserView, GetUsersView, SendFriendRequestView, AcceptFriendRequestView, \
    GetFriendRequestsView, GetFriendsView
from bet.views import GetEventsView, InitializeMultiBetView
from chat.views import UserChatsView, ChatCreateView, MessageViewSet, AddUserToChatView, OlderMessageViewSet

"""
URL configuration for chatBetSite project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/users/current/', CurrentUserView.as_view(), name='current_user'),
    path('api/users/chats/', UserChatsView.as_view(), name='user_chats'),
    path('api/users/create-chat/', ChatCreateView.as_view(), name='create-chat'),
    path('api/users/get-all-users/', GetUsersView.as_view(), name='get_all_users'),
    path('api/users/add-chat-user/', AddUserToChatView.as_view(), name='add_chat_user'),
    path('api/chats/older-messages/', OlderMessageViewSet.as_view(), name='get_older_messages'),
    path('api/chats/messages/', MessageViewSet.as_view(), name='get_messages'),
    path('api/bets/get-events/', GetEventsView.as_view(), name='get_events'),
    path('api/bets/init-multibet/', InitializeMultiBetView.as_view(), name='initialize_multibet'),
    path('api/users/friendships/send-request', SendFriendRequestView.as_view(), name='send_friend_request'),
    path('api/users/friendships/accept-request', AcceptFriendRequestView.as_view(), name='accept_friend_request'),
    path('api/users/friendships/reject-request', AcceptFriendRequestView.as_view(), name='reject_friend_request'),
    path('api/users/friendships/get-friend-requests', GetFriendRequestsView.as_view(), name='get_friend_requests'),
    path('api/users/friendships/get-friends', GetFriendsView.as_view(), name='get_friends'),
]
