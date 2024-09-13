import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Bet, MultiBet, MultiBetState
from .serializers import MultiBetSerializer, BetSerializer


class BetConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        self.group_name = 'bets_group'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)
        action = text_data_json['action']

        if action == 'update_odds':
            bet_id = text_data_json['bet_id']
            new_odds = text_data_json['new_odds']
            bet = await self.update_bet_odds(bet_id, new_odds)

        await self.channel_layer.group_send(self.group_name, {
            'type': 'bet_update',
            'bet': BetSerializer(bet).data
        })

        await self.update_multibets_containing_bet(bet)

    async def update_bet_odds(self, bet_id, new_odds):
        try:
            bet = Bet.objects.get(id=bet_id)
            bet.odds = new_odds
            bet.save()
            return bet

        except Bet.DoesNotExist:
            return None

    async def multibet_update(self, bet):
        multibets = MultiBet.objects.filter(bets=bet, state=MultiBetState.PENDING)
        for multibet in multibets:
            user = multibet.user
            multibet.calculate_totals()
            multibet.save()

            await self.channel_layer.group_send(
                f'multibets_group_{user.id}',  # User-specific group
                {
                    'type': 'multibet_update',
                    'multibet': MultiBetSerializer(multibet).data
                }
            )

class MultiBetConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        self.group_name = f'multibets_group_{self.user.id}'  # User-specific group
        await self.channel_layer.group_add(self.group_name, self.channel_name) # adding user to the group
        await self.accept() # accept the connection

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name) # disconnect user session

    async def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)
        action = text_data_json['action']
        if action == 'add_bet_to_multibet':
            bet_id = text_data_json['bet_id']
            multibet_uuid = text_data_json['multibet_uuid']

            multibet = await self.add_bet_to_multibet(multibet_uuid, bet_id)

            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'multibet_update',
                    'multibet': MultiBetSerializer(multibet).data
                }
            )

    async def add_bet_to_multibet(self, multibet_uuid, bet_id):
            try:
                multibet = MultiBet.objects.get(uuid=multibet_uuid, user=self.user)
                bet = Bet.objects.get(pk=bet_id)
                multibet.bets.add(bet)
                multibet.total_odds = multibet.calculate_total_odds()
                multibet.save()
                return multibet

            except MultiBet.DoesNotExist:
                return None

            except Bet.DoesNotExist:
                return None
