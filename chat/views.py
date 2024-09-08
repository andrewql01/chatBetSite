from django.shortcuts import render
from rest_framework import status
from rest_framework.authtoken.admin import User
from rest_framework.decorators import permission_classes
from rest_framework.generics import ListAPIView, CreateAPIView, get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ReadOnlyModelViewSet

from chat.models import Chat, Message
from chat.serializers import ChatSerializer, MessageSerializer


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
        chat_id = self.request.query_params.get('chat_uuid')

        if chat_id:
            return Message.objects.filter(chat__uuid=chat_id).order_by('created_at')
        return Message.objects.none()

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