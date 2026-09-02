import uuid
from django.db import models
from django.conf import settings
from apps.studios.models import StudioRoom

class TimeSlot(models.Model):
    studio = models.ForeignKey(StudioRoom, related_name='time_slots', on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)
    is_blackout = models.BooleanField(default=False)

    class Meta:
        unique_together = ('studio', 'date', 'start_time')

    def __str__(self):
        return f"{self.studio.name} - {self.date} [{self.start_time}-{self.end_time}]"

class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending Confirmation'
        HOLD = 'HOLD', 'Cart Hold'
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    booking_reference = models.CharField(max_length=20, unique=True, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='bookings', on_delete=models.SET_NULL, null=True, blank=True)
    customer_name = models.CharField(max_length=150)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=30, blank=True)
    studio = models.ForeignKey(StudioRoom, related_name='bookings', on_delete=models.CASCADE)
    booking_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    duration_hours = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.CONFIRMED)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True)
    reservation_fee_paid = models.BooleanField(default=False)
    cashfree_order_id = models.CharField(max_length=100, blank=True, null=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.booking_reference:
            self.booking_reference = f"STU-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Ref: {self.booking_reference} - {self.customer_name} ({self.studio.name})"
