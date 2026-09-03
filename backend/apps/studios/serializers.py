from rest_framework import serializers
from .models import StudioRoom

class StudioRoomSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = StudioRoom
        fields = '__all__'

    def get_image(self, obj):
        if obj.image:
            # Cloudinary storage returns absolute URLs, but DRF might mess it up.
            # This explicitly returns the raw Cloudinary URL.
            try:
                return obj.image.url
            except ValueError:
                return None
        return None
