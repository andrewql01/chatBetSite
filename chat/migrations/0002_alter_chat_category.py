# Generated by Django 5.1 on 2024-09-07 15:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='chat',
            name='category',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]