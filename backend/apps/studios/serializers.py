from rest_framework import serializers
from .models import StudioRoom, Blog

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

class BlogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blog
        fields = '__all__'
        read_only_fields = ('slug', 'created_at', 'updated_at')
