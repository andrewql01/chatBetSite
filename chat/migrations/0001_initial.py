# Generated by Django 5.1 on 2024-09-06 08:42

import chat.models
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Chat',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('category', models.CharField(max_length=100)),
                ('users', models.ManyToManyField(related_name='chats', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('text', models.TextField(max_length=200)),
                ('chat', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='chat.chat')),
                ('parent_message', models.ForeignKey(blank=True, null=True, on_delete=models.SET(chat.models.set_deleted_message), to='chat.message')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]