# Generated by Django 5.1 on 2024-09-10 08:58

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bet', '0004_bet_content_type_bet_object_id'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='bet',
            name='content_type',
        ),
        migrations.RemoveField(
            model_name='bet',
            name='object_id',
        ),
    ]