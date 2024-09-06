from rest_framework import serializers
from .models import Sport

class SportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sport
        fields = ['name', 'description']

    def create(self, validated_data):
        sport, created = Sport.objects.get_or_create(name=validated_data['name'], defaults=validated_data)
        return sport
