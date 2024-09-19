from rest_framework import serializers

from accounts.serializers import UserSerializer
from .models import Chat, Message


class ChatSerializer(serializers.ModelSerializer):
    users = UserSerializer(many=True, read_only=True)  # Include related users

    class Meta:
        model = Chat
        fields = ['uuid', 'name', 'category', 'users']

    def create(self, validated_data):
        request = self.context.get('request')  # Get the request from context
        chat = Chat.objects.create(**validated_data)
        chat.users.add(request.user)  # Add the creator to the chat
        chat.save()
        return chat

class ChatUuidSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ['id', 'uuid']

class MessageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)  # Include the user who sent the message
    chat = ChatUuidSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'parent_message', 'chat', 'user', 'text']