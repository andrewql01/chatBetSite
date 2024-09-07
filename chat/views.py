from django.shortcuts import render
from rest_framework.decorators import permission_classes
from rest_framework.generics import ListAPIView, CreateAPIView
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
