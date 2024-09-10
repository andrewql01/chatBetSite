import random
from django.core.management.base import BaseCommand
from django.utils import timezone
from decimal import Decimal
from bet.factories import SportFactory, LeagueFactory, TeamFactory, EventFactory, OverUnderBetFactory, WinOnlyBetFactory
from bet.models import WinOnlyOutcomes, OverUnderSubjects, BetTypes, OverUnderBet, WinOnlyBet, Event, Bet


class Command(BaseCommand):
    help = 'Create events and bets with random configurations'

    def add_arguments(self, parser):
        parser.add_argument('--num-events', type=int, default=10, help='Number of events to create')
        parser.add_argument('--num-bets-per-event', type=int, default=5, help='Number of bets to create per event')

    def handle(self, *args, **options):
        num_events = options['num_events']
        num_bets_per_event = options['num_bets_per_event']

        # Create sports, leagues, and teams
        sport = SportFactory.create(name='Football')
        league = LeagueFactory.create(name='Premier League', sport=sport)
        teams = [TeamFactory.create(sport=sport, league=league) for _ in range(4)]

        for _ in range(num_events):
            event = EventFactory.create(home_team=random.choice(teams), guest_team=random.choice(teams), date=timezone.now())
            self.stdout.write(f'Created event: {event}')

            # Create exactly 3 WinOnlyBet instances for each event
            for outcome in WinOnlyOutcomes:
                win_only_bet = WinOnlyBetFactory.create(
                    event=event,
                    predicted_winner=outcome
                )
                self.stdout.write(f'Created WinOnlyBet: {win_only_bet}')

            # Create other bets if needed
            for _ in range(num_bets_per_event):
                # Create OverUnderBet with random thresholds, directions, and subjects
                over_under_bet = OverUnderBetFactory.create(
                    event=event,
                )
                self.stdout.write(f'Created OverUnderBet: {over_under_bet}')

        self.stdout.write(self.style.SUCCESS('Successfully created events and bets with random configurations.'))
