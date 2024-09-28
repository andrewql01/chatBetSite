from decimal import Decimal
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager


class FriendRequestStatus(models.TextChoices):
    PENDING = 'pending'
    ACCEPTED = 'accepted'
    REJECTED = 'rejected'

class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field is required')
        if not username:
            raise ValueError('The Name field is required')

        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True')

        return self.create_user(email, username, password, **extra_fields)

class UserData(AbstractUser):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=100, unique=True)  # Use name as the login field
    email = models.EmailField(max_length=100, unique=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    real_money_balance = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    bonus_money_balance = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))

    is_admin = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'username'  # Use name as the login field
    REQUIRED_FIELDS = ['email']  # Email is required

    def __str__(self):
        return self.username  # Use name instead of username

    def block_user(self, user_to_block):
        """Block a user."""
        BlockedUser.objects.get_or_create(blocker=self, blocked=user_to_block)

    def unblock_user(self, user_to_unblock):
        """Unblock a user."""
        BlockedUser.objects.filter(blocker=self, blocked=user_to_unblock).delete()

    def is_blocked(self, user):
        """Check if a user is blocked."""
        return BlockedUser.objects.filter(blocker=self, blocked=user).exists()

class BlockedUser(models.Model):
    blocker = models.ForeignKey(UserData, related_name='blocked_users', on_delete=models.CASCADE)
    blocked = models.ForeignKey(UserData, related_name='blocked_by', on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('blocker', 'blocked')

    def __str__(self):
        return f"{self.blocker.username} blocks {self.blocked.username}"


class FriendRequest(models.Model):
    from_user = models.ForeignKey(UserData, related_name='sent_requests', on_delete=models.CASCADE)
    to_user = models.ForeignKey(UserData, related_name='received_requests', on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    status = models.TextField(choices=FriendRequestStatus.choices, default=FriendRequestStatus.PENDING)

    class Meta:
        unique_together = ('from_user', 'to_user')

    def accept(self):
        """Accept the friend request and create a friendship."""
        self.status = FriendRequestStatus.ACCEPTED
        self.save()

        # Create a new friendship
        Friendship.objects.create(user1=self.from_user, user2=self.to_user)

        # Create users chats
        from chat.models import Chat
        chat = Chat.objects.create()
        chat.users.add(self.from_user, self.to_user)
        chat.save()

    def reject(self):
        """Reject the friend request."""
        self.status = FriendRequestStatus.REJECTED
        self.save()

class Friendship(models.Model):
    user1 = models.ForeignKey(UserData, related_name='friends', on_delete=models.CASCADE)
    user2 = models.ForeignKey(UserData, related_name='friend_of', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def remove_friendship(self):
        """Remove the friendship between two users and delete associated friend requests."""
        # Delete any friend requests associated with this friendship
        FriendRequest.objects.filter(
            (models.Q(from_user=self.user1) & models.Q(to_user=self.user2)) |
            (models.Q(from_user=self.user2) & models.Q(to_user=self.user1))
        ).delete()

        # Now delete the friendship record
        self.delete()

    class Meta:
        unique_together = (('user1', 'user2'), ('user2', 'user1'))

class TransactionTypes(models.TextChoices):
    DEPOSIT = 'deposit', 'Deposit'
    WITHDRAWAL = 'withdrawal', 'Withdrawal'
    BET_PLACEMENT = 'bet_placement', 'Bet Placement'
    BET_WIN = 'bet_win', 'Bet Win'
    BONUS_ADDED = 'bonus_added', 'Bonus Added'
    BONUS_CONVERTED = 'bonus_converted', 'Bonus Converted'

class Transaction(models.Model):
    user = models.ForeignKey(UserData, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=20, choices=TransactionTypes.choices)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.username} - {self.transaction_type} - {self.amount}'


