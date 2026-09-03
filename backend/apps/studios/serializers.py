from rest_framework import serializers
from .models import StudioRoom

class StudioRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudioRoom
        fields = '__all__'

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if instance.image:
            try:
                ret['image'] = instance.image.url
            except ValueError:
                ret['image'] = None
        else:
            ret['image'] = None
        return ret
