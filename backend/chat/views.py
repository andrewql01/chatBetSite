from django.shortcuts import render
from rest_framework import status
from rest_framework.authtoken.admin import User
from rest_framework.decorators import permission_classes
from rest_framework.generics import ListAPIView, CreateAPIView, get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ReadOnlyModelViewSet
from django.db.models import Count

from accounts import models
from chat.models import Chat, Message
from chat.serializers import ChatSerializer, MessageSerializer, ChatDetailsSerializer


class UserChatsView(ListAPIView):
    serializer_class = ChatSerializer

    def get_queryset(self):
        user = self.request.user
        return Chat.objects.filter(users=user)

class ChatCreateView(CreateAPIView):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer

    def get_serializer_context(self):
        # Pass the request context to the serializer
        return {'request': self.request}


class MessageViewSet(ListAPIView):
    serializer_class = MessageSerializer

    def get_queryset(self):
        chat_uuid = self.request.query_params.get('chat_uuid')

        if chat_uuid:
            return Message.objects.filter(chat__uuid=chat_uuid).order_by('-created_at')[:10]
        return Message.objects.none()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class OlderMessageViewSet(ListAPIView):
    serializer_class = MessageSerializer

    def get_queryset(self):
        chat_uuid = self.request.query_params.get('chat_uuid')
        before_message_id = self.request.query_params.get('before_message_id')

        if chat_uuid and before_message_id:
            try:
                before_message_id = int(before_message_id)
            except ValueError:
                return Message.objects.none()  # Return empty queryset if before_message_id is not a valid integer

            try:
                chat = Chat.objects.get(uuid=chat_uuid)
            except Chat.DoesNotExist:
                return Message.objects.none()  # Return empty queryset if chat with given UUID does not exist

            # Filter messages based on chat and before_message_id
            queryset = Message.objects.filter(
                chat=chat,  # Use the chat instance instead of chat_uuid
                id__lt=before_message_id
            ).order_by('-created_at')[:10]  # Ensure that messages are ordered by creation time

            return queryset
        else:
            return Message.objects.none()  # Return an empty queryset if parameters are not provided

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class AddUserToChatView(APIView):
    # handle when user is already added ect
    def put(self, request, *args, **kwargs):
        chat_id = request.data.get('chatId')
        user_id = request.data.get('userId')
        # Validate the data
        if not chat_id or not user_id:
            return Response({'error': 'Chat ID and User ID are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Get chat and user objects
        chat = get_object_or_404(Chat, uuid=chat_id)
        user = get_object_or_404(User, id=user_id)

        # Add user to chat
        if user not in chat.users.all():
            chat.users.add(user)
            return Response({'message': 'User added to chat successfully.'}, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'User is already in this chat.'}, status=status.HTTP_400_BAD_REQUEST)

class GetChatDetailsView(APIView):
    def get(self, request, *args, **kwargs):
        chat_uuid = self.request.query_params.get('chat_uuid')

        chat = get_object_or_404(Chat, uuid=chat_uuid)
        serializer = ChatDetailsSerializer(chat)
        return Response(serializer.data)

class GetChatBetweenUsersView(APIView):
    def get(self, request, *args, **kwargs):

        other_user_username = request.query_params.get('other_user_username')

        # Get the User objects for the specified usernames
        user1 = get_object_or_404(User, username=self.request.user.username)
        user2 = get_object_or_404(User, username=other_user_username)

        # Query for Chat objects containing exactly user1 and user2
        chat = Chat.objects.annotate(user_count=Count('users')).filter(
            users__in=[user1, user2]
        ).filter(user_count=2).distinct().first()

        serializer = ChatDetailsSerializer(chat)
        return Response(serializer.data)
