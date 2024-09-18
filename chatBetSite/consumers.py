import json
from channels.generic.websocket import AsyncWebsocketConsumer
from chat.models import Chat, Message
from chat.serializers import UserSerializer, MessageSerializer
from channels.db import database_sync_to_async
from bet.models import MultiBet, Bet, MultiBetState
from bet.serializers import MultiBetSerializer, BetSerializer


class UnifiedConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.groups_joined = set()  # Initialize here
        self.current_room = None

    async def connect(self):
        if not self.scope['user'].is_authenticated:
            await self.close()
            return

        self.user = self.scope['user']
        await self.accept()

    async def disconnect(self, close_code):
        # Leave the current group if the user was in one
        if self.current_room:
            group_name = f'chat_{self.current_room}'
            if group_name in self.groups_joined:
                await self.channel_layer.group_discard(group_name, self.channel_name)
                self.groups_joined.discard(group_name)
        self.current_room = None    # Clear the current room tracking

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')
        # Route the message to the appropriate handler
        if action == 'join_chat':
            await self.handle_join_chat(data)
        elif action == 'leave_chat':
            await self.handle_leave_chat(data)
        elif action == 'chat_message':
            await self.handle_chat_message(data)
        elif action == 'user_typing':
            await self.handle_user_typing(data)
        elif action == 'join_multibet':
            await self.handle_join_multibet(data)
        elif action == 'multibet_update':
            await self.handle_multibet_update(data)
        elif action == 'bet_update':
            await self.handle_bet_update(data)
        elif action == 'multibet_remove_bet':
            await self.handle_multibet_remove_bet(data)
        elif action == 'multibet_submit':
            await self.handle_multibet_submit(data)
        else:
            print(f"Unhandled action: {action}")

    async def handle_join_chat(self, data):
        """Handle joining a chat room."""
        room_uuid = data.get('room_uuid')
        if room_uuid:
            # Join the new room
            new_group_name = f'chat_{room_uuid}'
            if new_group_name not in self.groups_joined:
                await self.channel_layer.group_add(new_group_name, self.channel_name)
                self.groups_joined.add(new_group_name)
                self.current_room = room_uuid  # Update the current room

    async def handle_leave_chat(self, data):
        """Handle leaving a chat room."""
        room_uuid = data.get('room_uuid')
        if room_uuid:
            group_name = f'chat_{room_uuid}'
            await self.channel_layer.group_discard(group_name, self.channel_name)
            self.groups_joined.discard(group_name)
        self.current_room = room_uuid

    async def handle_chat_message(self, data):
        """Handle sending a chat message."""
        message = data.get('message')
        room_uuid = data.get('room_uuid')

        if message and room_uuid:
            group_name = f'chat_{room_uuid}'
            saved_message = await self.save_message(self.user, room_uuid, message)
            await self.channel_layer.group_send(
                group_name,
                {
                    'type': 'chat_message',
                    'message': await self.serialize_message(saved_message),
                }
            )

    async def handle_user_typing(self, data):
        """Handle user typing status."""
        room_uuid = data.get('room_uuid')
        typing = data.get('typing')

        if room_uuid and typing is not None:
            group_name = f'chat_{room_uuid}'
            await self.channel_layer.group_send(
                group_name,
                {
                    'type': 'user_typing',
                    'user': await self.serialize_user(self.user),
                    'typing': typing,
                }
            )

    async def handle_join_multibet(self, data):
        """Handle joining a multibet group."""
        multibet_uuid = data.get('multibet_uuid')
        if multibet_uuid:
            group_name = f'multibet_{multibet_uuid}'
            if group_name not in self.groups_joined:
                await self.channel_layer.group_add(group_name, self.channel_name)
                self.groups_joined.add(group_name)

    async def handle_multibet_update(self, data):
        """Handle multibet updates."""
        multibet_uuid = data.get('multibet_uuid')
        bet_id = data.get('bet_id')

        if multibet_uuid and bet_id:
            multibet = await self.add_bet_to_multibet(multibet_uuid, bet_id)
            group_name = f'multibet_{multibet_uuid}'
            await self.channel_layer.group_send(
                group_name,
                {
                    'type': 'multibet_update',
                    'multibet': await self.serialize_multibet(multibet),
                }
            )

    async def handle_multibet_remove_bet(self, data):
        """Handle removing bet from the multibet."""
        multibet_uuid = data.get('multibet_uuid')
        bet_id = data.get('bet_id')

        if multibet_uuid and bet_id:
            multibet = await self.remove_bet_from_multibet(multibet_uuid, bet_id)
            group_name = f'multibet_{multibet_uuid}'
            await self.channel_layer.group_send(
                group_name,
                {
                    'type': 'multibet_update',
                    'multibet': await self.serialize_multibet(multibet),
                }
            )

    async def handle_multibet_submit(self, data):
        """Handle multibet submit."""
        multibet_uuid = data.get('multibet_uuid')

        if multibet_uuid:
            multibet = await self.submit_multibet(multibet_uuid)
            group_name = f'multibet_{multibet_uuid}'
            await self.channel_layer.group_send(
                group_name,
                {
                    'type': 'multibet_submit',
                    'multibet': await self.serialize_multibet(multibet),
                }
            )

    async def handle_bet_update(self, data):
        """Handle bet updates."""
        bet_id = data.get('bet_id')
        new_odds = data.get('new_odds')

        if bet_id and new_odds is not None:
            bet = await self.update_bet_odds(bet_id, new_odds)
            group_name = 'bets_group'
            await self.channel_layer.group_send(
                group_name,
                {
                    'type': 'bet_update',
                    'bet': await self.serialize_bet(bet),
                }
            )

    @database_sync_to_async
    def save_message(self, user, chat_uuid, message):
        chat = Chat.objects.get(uuid=chat_uuid)
        return Message.objects.create(user=user, chat=chat, text=message)

    @database_sync_to_async
    def add_bet_to_multibet(self, multibet_uuid, new_bet_id):
        multibet = MultiBet.objects.get(uuid=multibet_uuid)
        new_bet = Bet.objects.get(id=new_bet_id)

        # Remove existing bet with the same subject and event
        for bet in multibet.bets.all():
            if bet.subject == new_bet.subject and bet.event == new_bet.event:
                multibet.bets.remove(bet)
                break

        # Add the new bet
        multibet.bets.add(new_bet)
        multibet.save()
        return multibet

    @database_sync_to_async
    def remove_bet_from_multibet(self, multibet_uuid, bet_id):
        multibet = MultiBet.objects.get(uuid=multibet_uuid)
        bet = Bet.objects.get(id=bet_id)
        multibet.bets.remove(bet)
        multibet.save()
        return multibet

    @database_sync_to_async
    def submit_multibet(self, multibet_uuid):
        multibet = MultiBet.objects.get(uuid=multibet_uuid)
        multibet.state = MultiBetState.SUBMITTED
        multibet.save()
        return multibet

    @database_sync_to_async
    def update_bet_odds(self, bet_id, new_odds):
        bet = Bet.objects.get(id=bet_id)
        bet.odds = new_odds
        bet.save()
        return bet

    @database_sync_to_async
    def serialize_user(self, user):
        return UserSerializer(user).data

    @database_sync_to_async
    def serialize_message(self, message):
        return MessageSerializer(message).data

    @database_sync_to_async
    def serialize_bet(self, bet):
        return BetSerializer(bet).data

    @database_sync_to_async
    def serialize_multibet(self, multibet):
        return MultiBetSerializer(multibet).data

    # Event Handlers for Sending Messages Back
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({'action': 'chat_message', 'message': event['message']}))

    async def user_typing(self, event):
        await self.send(text_data=json.dumps({'action': 'user_typing', 'user': event['user'], 'typing': event['typing']}))

    async def multibet_update(self, event):
        await self.send(text_data=json.dumps({'action': 'multibet_update', 'multibet': event['multibet']}))

    async def multibet_remove_bet(self, event):
        await self.send(text_data=json.dumps({'action': 'multibet_remove_bet', 'multibet': event['multibet']}))

    async def multibet_submit(self, event):
        await self.send(text_data=json.dumps({'action': 'multibet_submit', 'multibet': event['multibet']}))

    async def bet_update(self, event):
        await self.send(text_data=json.dumps({'action': 'bet_update', 'bet': event['bet']}))
