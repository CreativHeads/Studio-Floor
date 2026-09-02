from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum, Count
from apps.bookings.models import Booking
from apps.studios.models import StudioRoom
from django.contrib.auth import get_user_model

User = get_user_model()

class DashboardAnalyticsView(APIView):
    permission_classes = [permissions.AllowAny] # Allow viewing dashboard stats for live demo

    def get(self, request):
        total_revenue = Booking.objects.filter(status='CONFIRMED').aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        total_hours = Booking.objects.filter(status='CONFIRMED').aggregate(Sum('duration_hours'))['duration_hours__sum'] or 0
        total_bookings = Booking.objects.count()
        total_users = User.objects.count()
        
        # Room metrics
        room_stats = StudioRoom.objects.annotate(
            booking_count=Count('bookings'),
            revenue=Sum('bookings__total_amount')
        ).values('id', 'name', 'room_type', 'booking_count', 'revenue')

        recent_bookings = Booking.objects.select_related('studio').order_by('-created_at')[:5].values(
            'booking_reference', 'customer_name', 'studio__name', 'booking_date', 'total_amount', 'status'
        )

        return Response({
            'kpis': {
                'total_revenue': float(total_revenue),
                'total_hours': total_hours,
                'total_bookings': total_bookings,
                'total_users': total_users,
                'active_studios': StudioRoom.objects.filter(is_active=True).count()
            },
            'room_stats': list(room_stats),
            'recent_bookings': list(recent_bookings)
        })
