from django.db.models import Q
from rest_framework import status
from rest_framework.authtoken.admin import User
from rest_framework.generics import ListAPIView, get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import UserData, Friendship, FriendRequest, FriendRequestStatus
from accounts.serializers import UserSerializer, FriendRequestSerializer


class RegisterView(APIView):

    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class CurrentUserView(APIView):

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class GetUsersView(ListAPIView):
    serializer_class = UserSerializer

    def get_queryset(self):
        current_user = self.request.user
        queryset = UserData.objects.all().exclude(id=current_user.id)
        return queryset

class SendFriendRequestView(APIView):
    def post(self, request):
        to_user_username = request.data['to_user_username']
        if self.request.user.username == to_user_username:
            return Response({'message': 'You cannot add yourself!'}, status=status.HTTP_403_FORBIDDEN)

        to_user = UserData.objects.filter(username=to_user_username).first()

        if not to_user:
            return Response({'message': 'User could not be found!'}, status=status.HTTP_404_NOT_FOUND)

        # Check if the target user has blocked the current user
        if to_user.is_blocked(request.user):
            return Response({'message': 'You cannot send a friend request to a blocked user.'},
                            status=status.HTTP_403_FORBIDDEN)

        existing_friend_request = FriendRequest.objects.filter(from_user=request.user, to_user=to_user)
        if existing_friend_request:
            return Response({'message': 'Friend request already sent.'}, status=status.HTTP_400_BAD_REQUEST)

        if FriendRequest.objects.filter(from_user__username=to_user_username,
                                                        to_user__username=request.user.username).exists():
            return Response({'message': 'The user already sent a request to you!'}, status=status.HTTP_404_NOT_FOUND)


        new_friend_request = FriendRequest.objects.create(from_user=request.user, to_user=to_user)
        new_friend_request.save()
        return Response({'message': 'Friend request sent successfully.'}, status=status.HTTP_201_CREATED)

class AcceptFriendRequestView(APIView):
    def post(self, request):
        friend_request_id = request.data['friend_request_id']
        friend_request = get_object_or_404(FriendRequest, id=friend_request_id)

        friend_request.accept()
        return Response({'message': 'Friend request accepted.'}, status=status.HTTP_202_ACCEPTED)

class RejectFriendRequestView(APIView):
    def post(self, request):
        friend_request_id = request.data['friend_request_id']
        friend_request = get_object_or_404(FriendRequest, id=friend_request_id)

        friend_request.reject()
        return Response({'message': 'Friend request rejected.'}, status=status.HTTP_202_ACCEPTED)


class DeleteFriendView(APIView):
    def post(self, request):

        friend_username = request.data.get('friend_username')
        # Check if the current user is trying to delete themselves
        if request.user.username == friend_username:
            return Response({'message': 'You cannot unfriend yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        # Get the friend user object
        friend = get_object_or_404(UserData, username=friend_username)

        # Try to find the friendship where the current user is user1 or user2
        friendship = Friendship.objects.filter(
            (Q(user1=request.user) & Q(user2=friend)) |
            (Q(user1=friend) & Q(user2=request.user))
        ).first()

        if not friendship:
            return Response({'message': 'Friendship does not exist.'}, status=status.HTTP_404_NOT_FOUND)

        # Delete the friendship
        friendship.remove_friendship()

        return Response({'message': 'Friendship deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


class GetFriendRequestsView(ListAPIView):
    serializer_class = FriendRequestSerializer
    def get_queryset(self):
        current_user = self.request.user
        queryset = FriendRequest.objects.filter(to_user=current_user, status=FriendRequestStatus.PENDING)
        return queryset

class GetFriendsView(ListAPIView):
    serializer_class = UserSerializer
    def get_queryset(self):
        current_user = self.request.user
        # Get all friendships where the user is either user1 or user2
        friendships_user1 = Friendship.objects.filter(user1=current_user).values_list('user2', flat=True)
        friendships_user2 = Friendship.objects.filter(user2=current_user).values_list('user1', flat=True)
        all_friendships = friendships_user1.union(friendships_user2)
        # Retrieve full user details for the friends
        friends_queryset = User.objects.filter(id__in=all_friendships)
        return friends_queryset

