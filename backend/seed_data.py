import os
import sys
import django
from datetime import date, timedelta, time

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.studios.models import StudioRoom, Equipment, AddOnService
from apps.bookings.models import TimeSlot, Booking, BookingAddOn
from apps.audit_logs.models import SecurityAuditLog

User = get_user_model()

def seed():
    print("[+] Seeding StudioPlus database...")

    # 1. Admin & Customer Users
    admin_user, created = User.objects.get_or_create(
        email='admin@studioplus.com',
        defaults={
            'username': 'admin',
            'first_name': 'Sarah',
            'last_name': 'Jenkins',
            'role': User.Role.ADMIN,
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        admin_user.set_password('AdminSecret123!')
        admin_user.save()
        print("  - Created Admin User: admin@studioplus.com / AdminSecret123!")

    customer_user, created = User.objects.get_or_create(
        email='alex@creator.com',
        defaults={
            'username': 'alex_creator',
            'first_name': 'Alex',
            'last_name': 'Rivera',
            'role': User.Role.CUSTOMER,
            'phone_number': '+1 (555) 382-9910'
        }
    )
    if created:
        customer_user.set_password('Customer123!')
        customer_user.save()
        print("  - Created Customer User: alex@creator.com / Customer123!")

    # 2. Studio Rooms
    s1, _ = StudioRoom.objects.get_or_create(
        slug='broadcast-master-suite',
        defaults={
            'name': 'Studio A - Broadcast Presentation Suite',
            'room_type': StudioRoom.RoomType.BROADCAST,
            'tagline': '4K Multi-Camera Live Stream & Keynote Studio',
            'description': 'Designed for high-end corporate webcasts, product launches, video podcasts, and keynote broadcasts. Features acoustic floating floors, customizable DMX LED wall, and triple Shure SM7B setup.',
            'hourly_rate': 120.00,
            'half_day_rate': 420.00,
            'full_day_rate': 780.00,
            'max_capacity': 8,
            'image_url': 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
            'acoustics_rating': 'STC-65 Ultra Isolation Noise Floor',
            'is_active': True
        }
    )

    s2, _ = StudioRoom.objects.get_or_create(
        slug='podcast-lounge-suite',
        defaults={
            'name': 'Studio B - Podcast Master Lounge',
            'room_type': StudioRoom.RoomType.PODCAST,
            'tagline': 'Cozy Sound-Treated Lounge for Intimate Conversations',
            'description': 'Premium warm aesthetic podcast room featuring custom leather seating, Rodecaster Pro II interface, 4x Electro-Voice RE20 microphones, and ambient RGB neon backlighting.',
            'hourly_rate': 85.00,
            'half_day_rate': 300.00,
            'full_day_rate': 550.00,
            'max_capacity': 5,
            'image_url': 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80',
            'acoustics_rating': 'STC-60 Studio Acoustical Foam & Diffusers',
            'is_active': True
        }
    )

    s3, _ = StudioRoom.objects.get_or_create(
        slug='audio-mastering-suite',
        defaults={
            'name': 'Studio C - Audio Mastering & Voiceover Box',
            'room_type': StudioRoom.RoomType.AUDIO_MASTER,
            'tagline': 'Whisper-Quiet Booth for Voiceovers & Sound Design',
            'description': 'Precision calibrated voiceover and audio post-production room. Equipped with Neumann U87 Ai condenser microphone, Genelec 8341A SAM monitors, and Pro Tools Ultimate HD.',
            'hourly_rate': 95.00,
            'half_day_rate': 340.00,
            'full_day_rate': 620.00,
            'max_capacity': 3,
            'image_url': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
            'acoustics_rating': 'NC-15 Absolute Silence Enclosure',
            'is_active': True
        }
    )

    # 3. Equipment
    Equipment.objects.get_or_create(studio=s1, name='Sony FX6 Cinema Camera', category='CAM', model_spec='Full-frame 4K 120fps Cinema Line', quantity=3)
    Equipment.objects.get_or_create(studio=s1, name='Shure SM7B Vocal Mic', category='MIC', model_spec='Cardioid Dynamic Studio Microphone', quantity=4)
    Equipment.objects.get_or_create(studio=s1, name='Aputure 600d Pro Light', category='LIGHT', model_spec='Daylight LED Monolight with Softboxes', quantity=4)
    Equipment.objects.get_or_create(studio=s2, name='Rodecaster Pro II Console', category='AUDIO', model_spec='Integrated Audio Production Studio', quantity=1)
    Equipment.objects.get_or_create(studio=s2, name='Electro-Voice RE20', category='MIC', model_spec='Broadcast Dynamic Mic with Variable-D', quantity=4)

    # 4. Add-on Services
    a1, _ = AddOnService.objects.get_or_create(
        name='Dedicated Sound Engineer',
        defaults={'price': 45.00, 'price_type': 'PER_HOUR', 'description': 'On-site audio technician to manage levels and live mixing.', 'icon_name': 'Headphones'}
    )
    a2, _ = AddOnService.objects.get_or_create(
        name='4K Teleprompter Setup',
        defaults={'price': 55.00, 'price_type': 'FLAT', 'description': '17-inch presidential teleprompter with operator iPad app.', 'icon_name': 'Tv'}
    )
    a3, _ = AddOnService.objects.get_or_create(
        name='Raw Footage Export (SSD Drive)',
        defaults={'price': 35.00, 'price_type': 'FLAT', 'description': 'Instant ISO camera file export to high-speed USB-C drive.', 'icon_name': 'HardDrive'}
    )

    # 5. Time Slots & Bookings
    today = date.today()
    tomorrow = today + timedelta(days=1)

    b1, created = Booking.objects.get_or_create(
        booking_reference='STU-CONF881',
        defaults={
            'user': customer_user,
            'customer_name': 'Alex Rivera (Tech Talks Podcast)',
            'customer_email': 'alex@creator.com',
            'customer_phone': '+1 (555) 382-9910',
            'studio': s2,
            'booking_date': today,
            'start_time': time(10, 0),
            'end_time': time(12, 0),
            'duration_hours': 2,
            'status': Booking.Status.CONFIRMED,
            'total_amount': 215.00,
            'notes': 'Recording Episode #45 with guest CEO via Zoom integration.'
        }
    )
    if created:
        BookingAddOn.objects.create(booking=b1, add_on=a3, price_charged=35.00)

    b2, created = Booking.objects.get_or_create(
        booking_reference='STU-CONF892',
        defaults={
            'user': None,
            'customer_name': 'Elena Rostova (Global Media)',
            'customer_email': 'elena@globalmedia.io',
            'customer_phone': '+1 (555) 912-3344',
            'studio': s1,
            'booking_date': tomorrow,
            'start_time': time(14, 0),
            'end_time': time(17, 0),
            'duration_hours': 3,
            'status': Booking.Status.CONFIRMED,
            'total_amount': 495.00,
            'notes': 'Q3 Investor Keynote Webcast with Teleprompter.'
        }
    )
    if created:
        BookingAddOn.objects.create(booking=b2, add_on=a1, price_charged=135.00)
        BookingAddOn.objects.create(booking=b2, add_on=a2, price_charged=55.00)

    # 6. Audit Logs
    SecurityAuditLog.objects.create(
        event_type=SecurityAuditLog.EventType.LOGIN_SUCCESS,
        user_email='admin@studioplus.com',
        ip_address='192.168.1.45',
        path='/api/auth/login/',
        method='POST',
        status_code=200,
        details='Superadmin authenticated successfully'
    )

    print("[+] Seeding completed successfully!")

if __name__ == '__main__':
    seed()
