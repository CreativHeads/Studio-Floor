from rest_framework import serializers
from .models import StudioRoom

class StudioRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudioRoom
        fields = '__all__'
