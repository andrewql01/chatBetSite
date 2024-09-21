# Generated by Django 5.1 on 2024-09-18 08:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bet', '0018_remove_bet_description'),
    ]

    operations = [
        migrations.AddField(
            model_name='event',
            name='isLive',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='event',
            name='score',
            field=models.TextField(blank=True, default='0:0', null=True),
        ),
    ]