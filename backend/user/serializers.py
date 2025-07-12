from rest_framework import serializers
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name','phone_number','is_active','is_staff','is_superuser']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(style={'input_type': 'password'}, write_only=True)
    class Meta:
        model = CustomUser
        fields = ['username','email','first_name','last_name','phone_number','is_active','is_staff','password']

        def create(self, validated_data):
            user = CustomUser.objects.create_user(**validated_data)
            return user