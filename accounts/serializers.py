from rest_framework import serializers
from .models import UserData

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserData
        fields = ('email', 'username', 'password')  # Use 'name' instead of 'username'
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = UserData.objects.create(
            email=validated_data['email'],
            username=validated_data['username'],  # Use 'name' instead of 'username'
        )
        user.set_password(validated_data['password'])
        user.is_active = True
        user.save()
        return user
