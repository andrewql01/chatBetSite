import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Chat, Message
from accounts.models import UserData
from .serializers import UserSerializer  # Import your serializer

class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        if not self.scope['user'].is_authenticated:
            await self.close()

        self.user = self.scope['user']
        self.room_uuid = self.scope['url_route']['kwargs']['room_uuid']
        self.room_group_name = f'chat_{self.room_uuid}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message')
        typing = data.get('typing')

        if typing:
            # Broadcast that a user is typing
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_typing',
                    'user': await self.serialize_user(self.user),
                    'typing': typing,
                }
            )
        elif message:
            # Save the message in the database
            await self.save_message(self.user, message)

            # Broadcast the message to the group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'user': await self.serialize_user(self.user),
                }
            )

    async def chat_message(self, event):
        message = event['message']
        user = event['user']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'user': user,
        }))

    async def user_typing(self, event):
        typing = event['typing']
        user = event['user']

        # Send typing notification to WebSocket
        await self.send(text_data=json.dumps({
            'typing': typing,
            'user': user,
        }))

    @database_sync_to_async
    def save_message(self, user, message):
        chat = Chat.objects.get(uuid=self.room_uuid)
        Message.objects.create(user=user, chat=chat, text=message)

    async def serialize_user(self, user):
        # Use UserSerializer to serialize the user
        serializer = UserSerializer(user)
        return serializer.data