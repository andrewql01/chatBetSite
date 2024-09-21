from rest_framework import serializers
from .models import UserData, FriendRequest


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserData
        fields = ('id', 'email', 'username', 'password')
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = UserData.objects.create(
            email=validated_data['email'],
            username=validated_data['username'],
        )
        user.set_password(validated_data['password'])
        user.is_active = True
        user.save()
        return user

class FriendRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = FriendRequest
        fields = ['id', 'from_user']
