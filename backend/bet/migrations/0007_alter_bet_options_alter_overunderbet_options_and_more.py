# Generated by Django 5.1 on 2024-09-10 10:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bet', '0006_alter_bet_options_alter_overunderbet_options_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='bet',
            options={},
        ),
        migrations.AlterModelOptions(
            name='overunderbet',
            options={},
        ),
        migrations.AlterModelOptions(
            name='winonlybet',
            options={},
        ),
        migrations.RemoveField(
            model_name='bet',
            name='polymorphic_ctype',
        ),
        migrations.AlterField(
            model_name='bet',
            name='bet_type',
            field=models.CharField(choices=[('WinOnlyBet', 'Win Only'), ('OverUnderBet', 'Over Under')]),
        ),
    ]
