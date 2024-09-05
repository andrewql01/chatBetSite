from django.contrib.auth.models import User
from django.db import models


def set_deleted_message():
    return Message.objects.get_or_create(content="This message has been deleted.")[0]


class Chat(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    users = models.ManyToManyField(User)

    def __str__(self):
        return self.name

class Message(models.Model):
    id = models.IntegerField(primary_key=True)
    parent_message = models.ForeignKey('self', null=True, blank=True,
                                       on_delete=models.SET(set_deleted_message))
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField(max_length=200)

    def __str__(self):
        return self.text
