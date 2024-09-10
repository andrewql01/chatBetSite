import uuid
from decimal import Decimal

import polymorphic
from django.contrib.contenttypes.fields import GenericRelation, GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models
from polymorphic.models import PolymorphicModel

from accounts.models import UserData

class SportTypes(models.TextChoices):
    FOOTBALL = 'FOOTBALL', 'Football'
    BASKETBALL = 'BASKETBALL', 'Basketball'
    TENNIS = 'TENNIS', 'Tennis'
    CRICKET = 'CRICKET', 'Cricket'
    BASEBALL = 'BASEBALL', 'Baseball'
    HOCKEY = 'HOCKEY', 'Hockey'

class WinOnlyOutcomes(models.IntegerChoices):
    DRAW = 0, 'Draw'
    HOME_WIN = 1, 'Home Team Win'
    GUEST_WIN = 2, 'Guest Team Win'

class BetTypes(models.TextChoices):
    WIN_ONLY = 'WinOnlyBet'
    OVER_UNDER = 'OverUnderBet'

class BetOutcomes(models.TextChoices):
    WIN = 'WIN', 'Win'
    LOSE = 'LOSE', 'Lose'
    REFUND = 'REFUND', 'Refund'
    IN_PROGRESS = 'IN_PROG', 'In Progress'

class BetSubjects(models.TextChoices):
    CARDS = 'CARDS', 'Cards'
    GOALS = 'GOALS', 'Goals'
    CORNERS = 'CORNERS', 'Corners'
    WINNING_TEAM = 'WINNING_TEAM', 'Winning Team'

class Sport(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(choices=SportTypes.choices, unique=True)
    description = models.TextField(blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name

class League(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, unique=True)
    sport = models.ForeignKey(Sport, on_delete=models.CASCADE, related_name='leagues')
    description = models.TextField(blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return f'{self.name} ({self.sport.name})'

class Team(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, unique=True)
    sport = models.ForeignKey(Sport, on_delete=models.CASCADE, related_name='teams')
    league = models.ForeignKey(League, on_delete=models.CASCADE, related_name='teams', blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name

class Event(models.Model):
    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    home_team = models.ForeignKey(Team, related_name='home_team_events', on_delete=models.CASCADE)
    guest_team = models.ForeignKey(Team, related_name='guest_team_events', on_delete=models.CASCADE)
    date = models.DateTimeField()
    location = models.CharField(max_length=255, blank=True, null=True)
    league = models.ForeignKey(League, on_delete=models.CASCADE, related_name='events', blank=True, null=True)

    def __str__(self):
        return f'{self.name} ({self.league.name})'

class Bet(PolymorphicModel):
    id = models.AutoField(primary_key=True)
    subject = models.CharField(max_length=20, choices=BetSubjects.choices)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='bets')
    bet_type = models.CharField(choices=BetTypes.choices)
    odds = models.DecimalField(max_digits=6, decimal_places=2)
    outcome = models.CharField(choices=BetOutcomes.choices, blank=False, default=BetOutcomes.IN_PROGRESS)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def save(self, *args, **kwargs):
        if self.outcome == BetOutcomes.REFUND:
            self.odds = Decimal('1.0')
        super().save(*args, **kwargs)

    def __str__(self):
        return f'Bet {self.id} on {self.event.name} - {self.bet_type}'

class OverUnderBet(Bet):
    bet_type = BetTypes.OVER_UNDER
    threshold = models.DecimalField(max_digits=5, decimal_places=2)
    direction = models.CharField(max_length=10, choices=[('OVER', 'Over'), ('UNDER', 'Under')])

    def save(self, *args, **kwargs):
        if not self.bet_type:  # Ensure bet_type is set to WIN_ONLY
            self.bet_type = BetTypes.OVER_UNDER
        super().save(*args, **kwargs)

    def __str__(self):
        return f'Over/Under Bet {self.id} on {self.event.name} - {self.direction} {self.threshold}'

class WinOnlyBet(Bet):
    bet_type = BetTypes.WIN_ONLY
    predicted_winner = models.IntegerField(choices=WinOnlyOutcomes.choices, blank=True, null=True)

    def __str__(self):
        outcome = dict(WinOnlyOutcomes.choices).get(self.predicted_winner, "Unknown")
        return f'Win-Only Bet {self.id} on {self.event.name} - {self.event.home_team.name} vs {self.event.guest_team.name} (Predicted: {outcome})'

    def save(self, *args, **kwargs):
        if not self.bet_type:  # Ensure bet_type is set to WIN_ONLY
            self.bet_type = BetTypes.WIN_ONLY
        super().save(*args, **kwargs)

class MultiBet(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(UserData, on_delete=models.CASCADE, related_name='multi_bets')
    bets = models.ManyToManyField(Bet, related_name='multi_bets')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    total_odds = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    total_winnings = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    outcome = models.CharField(max_length=10, choices=BetOutcomes.choices, blank=False, default=BetOutcomes.IN_PROGRESS)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'MultiBet by {self.user.username} - Total Amount: {self.total_amount}'

    def calculate_totals(self):
        """ Calculate total odds, winnings, and result based on included bets. """
        if not self.bets.exists():
            self.total_odds = Decimal('0.00')
            self.total_winnings = Decimal('0.00')
            self.outcome = BetOutcomes.IN_PROGRESS
            return

        odds_product = Decimal('1.00')
        outcomes = []

        for bet in self.bets.all():
            odds_product *= bet.odds
            outcomes.append(bet.outcome)

        self.total_odds = odds_product
        if BetOutcomes.IN_PROGRESS in outcomes:
            self.total_winnings = self.total_amount * odds_product
        else:
            if BetOutcomes.LOSE in outcomes:
                self.outcome = BetOutcomes.LOSE
                self.total_winnings = Decimal('0.00')
            elif self.is_only_refund():
                self.outcome = BetOutcomes.REFUND
                self.total_winnings = Decimal('0.00')
            else:
                self.outcome = BetOutcomes.WIN
                self.total_winnings = self.total_amount * odds_product

    def is_only_refund(self):
        all_refund = all(bet.outcome == BetOutcomes.REFUND for bet in self.bets.all())
        return all_refund

    def save(self, *args, **kwargs):
        self.calculate_totals()  # Calculate totals before saving
        super().save(*args, **kwargs)
