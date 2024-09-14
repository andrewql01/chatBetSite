import factory
from django.utils import timezone
from decimal import Decimal

from factory import fuzzy

from .models import Sport, League, Team, Event, Bet, OverUnderBet, WinOnlyBet, BetOutcomes, \
    BetSubjects, BetTypes, SportTypes, WinOnlyOutcomes

class SportFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Sport
        django_get_or_create = ('name',)

    name = factory.Iterator(SportTypes.values)
    description = factory.Faker('sentence')


class LeagueFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = League
        django_get_or_create = ('name',)

    name = factory.Faker('word')
    sport = factory.SubFactory(SportFactory)
    description = factory.Faker('sentence')


class TeamFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Team
        django_get_or_create = ('name',)

    name = factory.Faker('word')
    sport = factory.SubFactory(SportFactory)
    league = factory.SubFactory(LeagueFactory)
    description = factory.Faker('sentence')


class EventFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Event
        django_get_or_create = ('home_team', 'guest_team', 'date')

    name = factory.Faker('word')
    home_team = factory.SubFactory(TeamFactory)
    guest_team = factory.SubFactory(TeamFactory)
    date = factory.LazyFunction(timezone.now)
    location = factory.Faker('address')
    league = factory.SubFactory(LeagueFactory)


class BetFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Bet
        django_get_or_create = ('event', 'odds')

    event = factory.SubFactory(EventFactory)
    odds = fuzzy.FuzzyDecimal(low=1, high=5, precision=2)
    subject = factory.Iterator(BetSubjects.values)


class OverUnderBetFactory(BetFactory):
    class Meta:
        model = OverUnderBet

    threshold = fuzzy.FuzzyDecimal(low=1, high=5, precision=1)
    direction = fuzzy.FuzzyChoice(choices=['OVER', 'UNDER'])


class WinOnlyBetFactory(BetFactory):
    class Meta:
        model = WinOnlyBet

    predicted_winner = factory.Iterator(WinOnlyOutcomes.values)
