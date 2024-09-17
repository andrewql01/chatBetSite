from collections import defaultdict
from tokenize import group

from django.utils.module_loading import import_string
from rest_framework import serializers
from rest_framework.fields import SerializerMethodField
from rest_polymorphic.serializers import PolymorphicSerializer

import bet
from accounts.serializers import UserSerializer
from .models import Sport, League, Team, Event, Bet, MultiBet, WinOnlyBet, OverUnderBet, BetTypes, BetSubjects, \
    MultiBetState


class SportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sport
        fields = ['name', 'description']

    def create(self, validated_data):
        sport, created = Sport.objects.get_or_create(name=validated_data['name'], defaults=validated_data)
        return sport

class LeagueSerializer(serializers.ModelSerializer):
    sport = SportSerializer(read_only=True)

    class Meta:
        model = League
        fields = ['name', 'sport', 'description']

    def create(self, validated_data):
        league, created = League.objects.get_or_create(name=validated_data['name'], defaults=validated_data)
        return league

class TeamSerializer(serializers.ModelSerializer):
    sport = SportSerializer(read_only=True)
    league = LeagueSerializer(read_only=True)

    class Meta:
        model = Team
        fields = ['name', 'sport', 'league', 'description']

    def create(self, validated_data):
        team, created = Team.objects.get_or_create(name=validated_data['name'], defaults=validated_data)
        return team

class BetSerializer(serializers.ModelSerializer):
    event = serializers.PrimaryKeyRelatedField(queryset=Event.objects.all())

    class Meta:
        model = Bet
        fields = ['id', 'subject', 'event', 'bet_type', 'odds', 'outcome', 'created_at', 'updated_at']

class OverUnderBetSerializer(serializers.ModelSerializer):
    class Meta(BetSerializer.Meta):
        model = OverUnderBet
        fields = BetSerializer.Meta.fields + ['threshold', 'direction', 'subject']

class WinOnlyBetSerializer(serializers.ModelSerializer):
    class Meta(BetSerializer.Meta):
        model = WinOnlyBet
        fields = BetSerializer.Meta.fields + ['predicted_winner']

class BetPolymorphicSerializer(PolymorphicSerializer):

    model_serializer_mapping = {
        Bet: BetSerializer,
        OverUnderBet: OverUnderBetSerializer,
        WinOnlyBet: WinOnlyBetSerializer,
    }

class EventSerializer(serializers.ModelSerializer):
    uuid = serializers.UUIDField(read_only=True)
    home_team = TeamSerializer(read_only=True)
    guest_team = TeamSerializer(read_only=True)
    league = LeagueSerializer(read_only=True)
    grouped_bets = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = ['uuid', 'name', 'home_team', 'guest_team', 'date', 'location', 'league', 'grouped_bets']

    def get_grouped_bets(self, obj):
        # Get all bets for the event
        bets = obj.bets.all()

        # Separate bets by type
        win_only_bets = [bet for bet in bets if isinstance(bet, WinOnlyBet)]
        over_under_bets = [bet for bet in bets if isinstance(bet, OverUnderBet)]

        # Group bets by subject for each bet type
        def group_by_subject(bet_list):
            grouped = defaultdict(list)
            for bet in bet_list:
                grouped[bet.subject].append(bet)
            return grouped

        grouped_win_only_bets = group_by_subject(win_only_bets)
        grouped_over_under_bets = group_by_subject(over_under_bets)

        # Prepare the grouped data for each bet type
        def prepare_grouped_data(bet_type, grouped_bets):
            return {
                'subjects' :
                    {
                        subject: BetPolymorphicSerializer(bet_list, many=True).data
                    }
                    for subject, bet_list in grouped_bets.items()
            }

        # Combine the data for both bet types
        grouped_data = {
            BetTypes.WIN_ONLY: prepare_grouped_data('WinOnlyBet', grouped_win_only_bets),
            BetTypes.OVER_UNDER: prepare_grouped_data('OverUnderBet', grouped_over_under_bets)
        }

        return grouped_data

    def create(self, validated_data):
        event, created = Event.objects.get_or_create(name=validated_data['name'], defaults=validated_data)
        return event

class MultiBetSerializer(serializers.ModelSerializer):
    bets = SerializerMethodField()
    user = UserSerializer(read_only=True)

    class Meta:
        model = MultiBet
        fields = ['uuid', 'user', 'bets', 'total_amount', 'total_odds', 'total_winnings', 'outcome', 'created_at', 'state']

    def get_bets(self, obj):
        bet_serializer = BetPolymorphicSerializer(obj.bets.all(), many=True)
        return bet_serializer.data

    def create(self, validated_data):
        request = self.context.get('request')
        multi_bet, created = MultiBet.objects.get_or_create(user=request.user, state=MultiBetState.PENDING)
        print(multi_bet.uuid)
        multi_bet.save()
        return multi_bet

class GroupedBetSerializer(serializers.Serializer):
    subject = serializers.CharField()
    bet_type = serializers.CharField()
    bets = BetPolymorphicSerializer(many=True)

