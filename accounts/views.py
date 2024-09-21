from rest_framework import status
from rest_framework.authtoken.admin import User
from rest_framework.generics import ListAPIView, get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import UserData, Friendship, FriendRequest
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
        to_user = get_object_or_404(UserData, username=to_user_username)

        existing_friend_request = FriendRequest.objects.filter(from_user=request.user, to_user=to_user)
        if existing_friend_request:
            return Response({'message': 'Friend request already sent.'}, status=status.HTTP_400_BAD_REQUEST)

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

class GetFriendRequestsView(ListAPIView):
    serializer_class = FriendRequestSerializer
    def get_queryset(self):
        current_user = self.request.user
        queryset = FriendRequest.objects.all(to_user=current_user)
        return queryset


