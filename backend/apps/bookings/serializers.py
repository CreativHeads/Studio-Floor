from rest_framework import serializers
from .models import TimeSlot, Booking
from apps.studios.serializers import StudioRoomSerializer
from apps.studios.models import StudioRoom

class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    studio_details = StudioRoomSerializer(source='studio', read_only=True)

    class Meta:
        model = Booking
        fields = (
            'id', 'booking_reference', 'user', 'customer_name', 'customer_email',
            'customer_phone', 'studio', 'studio_details', 'booking_date',
            'start_time', 'end_time', 'duration_hours', 'status', 'total_amount',
            'reservation_fee_paid', 'notes', 'created_at'
        )
        read_only_fields = ('id', 'booking_reference', 'created_at')

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            validated_data['user'] = request.user

        booking = Booking.objects.create(**validated_data)
        return booking
