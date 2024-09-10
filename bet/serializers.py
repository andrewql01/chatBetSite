from django.utils.module_loading import import_string
from rest_framework import serializers
from rest_framework.fields import SerializerMethodField
from rest_polymorphic.serializers import PolymorphicSerializer

import bet
from accounts.serializers import UserSerializer
from .models import Sport, League, Team, Event, Bet, MultiBet, WinOnlyBet, OverUnderBet, BetTypes


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
        fields = ['id', 'event', 'bet_type', 'odds', 'outcome', 'created_at', 'updated_at']


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
    home_team = TeamSerializer(read_only=True)
    guest_team = TeamSerializer(read_only=True)
    league = LeagueSerializer(read_only=True)
    bets = SerializerMethodField()

    class Meta:
        model = Event
        fields = ['name', 'home_team', 'bets', 'guest_team', 'date', 'location', 'league']

    def get_bets(self, obj):
        bet_serializer = BetPolymorphicSerializer(obj.bets.all(), many=True)
        return bet_serializer.data

    def create(self, validated_data):
        event, created = Event.objects.get_or_create(name=validated_data['name'], defaults=validated_data)
        return event


class MultiBetSerializer(serializers.ModelSerializer):
    bets = SerializerMethodField()
    user = UserSerializer(read_only=True)

    class Meta:
        model = MultiBet
        fields = ['user', 'bets', 'total_amount', 'total_odds', 'total_winnings', 'outcome', 'created_at']

    def get_bets(self, obj):
        bet_serializer = BetPolymorphicSerializer(obj.bets.all(), many=True)
        return bet_serializer.data

    def create(self, validated_data):
        multi_bet, created = MultiBet.objects.create(defaults=validated_data)
        return multi_bet


