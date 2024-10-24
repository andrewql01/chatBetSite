from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from accounts.views import RegisterView, CurrentUserView, GetUsersView, SendFriendRequestView, AcceptFriendRequestView, \
    RejectFriendRequestView, GetFriendRequestsView, GetFriendsView, DeleteFriendView

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/users/register/', RegisterView.as_view(), name='register'),
    path('api/users/current/', CurrentUserView.as_view(), name='current_user'),
    path('api/users/get-all-users/', GetUsersView.as_view(), name='get_all_users'),
    path('api/users/friendships/send-request/', SendFriendRequestView.as_view(), name='send_friend_request'),
    path('api/users/friendships/accept-request/', AcceptFriendRequestView.as_view(), name='accept_friend_request'),
    path('api/users/friendships/reject-request/', RejectFriendRequestView.as_view(), name='reject_friend_request'),
    path('api/users/friendships/get-friend-requests/', GetFriendRequestsView.as_view(), name='get_friend_requests'),
    path('api/users/friendships/get-friends/', GetFriendsView.as_view(), name='get_friends'),
    path('api/users/friendships/delete-friend/', DeleteFriendView.as_view(), name='delete_friend'),
]