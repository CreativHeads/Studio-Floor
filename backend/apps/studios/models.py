from django.db import models

class StudioRoom(models.Model):
    class RoomType(models.TextChoices):
        PODCAST = 'PODCAST', 'Podcast Studio'
        BROADCAST = 'BROADCAST', 'Broadcast Presentation Suite'
        MULTI_CAM = 'MULTI_CAM', 'Multi-Camera Video Stage'
        AUDIO_MASTER = 'AUDIO_MASTER', 'Audio Mastering & Voiceover'

    name = models.CharField(max_length=150)
    slug = models.SlugField(unique=True)
    room_type = models.CharField(max_length=50, choices=RoomType.choices, default=RoomType.PODCAST)
    tagline = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2)
    half_day_rate = models.DecimalField(max_digits=8, decimal_places=2)
    full_day_rate = models.DecimalField(max_digits=8, decimal_places=2)
    max_capacity = models.PositiveIntegerField(default=4)
    image = models.ImageField(upload_to='studios/', blank=True, null=True)
    acoustics_rating = models.CharField(max_length=100, default='STC-60 Sound Isolation')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} (${self.hourly_rate}/hr)"
