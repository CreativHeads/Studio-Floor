from django.utils import timezone
from datetime import timedelta
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from django.conf import settings
import requests
from .models import TimeSlot, Booking
from .serializers import TimeSlotSerializer, BookingSerializer

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().order_by('-created_at')
    serializer_class = BookingSerializer
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'booking_attempt'

    def get_queryset(self):
        user = self.request.user
        from django.db.models import Q
        if user.is_authenticated and (user.role == 'ADMIN' or user.role == 'STAFF'):
            return Booking.objects.all().order_by('-created_at')
        elif user.is_authenticated:
            return Booking.objects.filter(Q(user=user) | Q(customer_email=user.email)).order_by('-created_at')
        email = self.request.query_params.get('email')
        if email:
            return Booking.objects.filter(customer_email=email).order_by('-created_at')
        return Booking.objects.none()

    def create(self, request, *args, **kwargs):
        hold_id = request.data.get('hold_id')
        if hold_id:
            try:
                hold = Booking.objects.get(id=hold_id, status='HOLD')
                # Update hold with final details
                serializer = self.get_serializer(hold, data=request.data, partial=True)
                serializer.is_valid(raise_exception=True)
                serializer.save(status='CONFIRMED', expires_at=None)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Booking.DoesNotExist:
                return Response({'error': 'Hold expired or invalid'}, status=status.HTTP_400_BAD_REQUEST)
                
        # Normal creation fallback
        return super().create(request, *args, **kwargs)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def booked_slots(self, request):
        studio_id = request.query_params.get('studio')
        date = request.query_params.get('date')
        if not studio_id or not date:
            return Response([])
        
        from django.db.models import Q
        now = timezone.now()
        
        # A slot is booked if it's NOT cancelled AND (it's NOT a hold OR it's an unexpired hold)
        bookings = Booking.objects.filter(
            booking_date=date
        ).exclude(status='CANCELLED').exclude(
            Q(status='HOLD') & Q(expires_at__lt=now)
        )
        
        slots = [{"start": b.start_time.strftime('%H:%M'), "end": b.end_time.strftime('%H:%M')} for b in bookings]
        return Response(slots)

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def update_status(self, request, pk=None):
        booking = self.get_object()
        new_status = request.data.get('status')
        if new_status in [s[0] for s in Booking.Status.choices]:
            booking.status = new_status
            booking.save()
            return Response(BookingSerializer(booking).data)
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny], throttle_classes=[ScopedRateThrottle])
    def hold_slot(self, request):
        studio_id = request.data.get('studio')
        booking_date = request.data.get('booking_date')
        start_time = request.data.get('start_time')
        end_time = request.data.get('end_time')
        duration_hours = request.data.get('duration_hours', 1)
        
        if not all([studio_id, booking_date, start_time, end_time]):
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
            
        now = timezone.now()
        from django.db.models import Q
        
        # Check if already booked or actively held
        existing = Booking.objects.filter(
            booking_date=booking_date,
            start_time=start_time
        ).exclude(status='CANCELLED').exclude(
            Q(status='HOLD') & Q(expires_at__lt=now)
        ).first()
        
        if existing:
            return Response({'error': 'Slot is no longer available'}, status=status.HTTP_409_CONFLICT)
            
        # Create a HOLD booking
        hold = Booking.objects.create(
            studio_id=studio_id,
            booking_date=booking_date,
            start_time=start_time,
            end_time=end_time,
            duration_hours=duration_hours,
            status='HOLD',
            total_amount=0,
            customer_name='Guest (Hold)',
            customer_email='hold@pending.com',
            expires_at=now + timedelta(minutes=10)
        )
        
        return Response(BookingSerializer(hold).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def release_hold(self, request, pk=None):
        try:
            hold = Booking.objects.get(id=pk, status='HOLD')
            hold.status = 'CANCELLED'
            hold.save()
            return Response({'status': 'Hold released'})
        except Booking.DoesNotExist:
            return Response({'error': 'Hold not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny], throttle_classes=[ScopedRateThrottle])
    def create_payment_order(self, request, pk=None):
        try:
            booking = Booking.objects.get(pk=pk)
            
            # Security: Only allow payment order creation for bookings in HOLD state
            if booking.status != 'HOLD':
                return Response({'error': 'Cannot initiate payment for a booking that is not on hold.'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Update booking with customer details
            booking.customer_name = request.data.get('customer_name', booking.customer_name)
            booking.customer_email = request.data.get('customer_email', booking.customer_email)
            booking.customer_phone = request.data.get('customer_phone', booking.customer_phone)
            booking.notes = request.data.get('notes', booking.notes)
            if request.user.is_authenticated:
                booking.user = request.user
            booking.save()
            
            # Use Cashfree API v3
            url = "https://sandbox.cashfree.com/pg/orders" if settings.CASHFREE_ENV == 'SANDBOX' else "https://api.cashfree.com/pg/orders"
            
            headers = {
                "accept": "application/json",
                "x-api-version": "2023-08-01",
                "x-client-id": settings.CASHFREE_APP_ID,
                "x-client-secret": settings.CASHFREE_SECRET_KEY,
                "content-type": "application/json"
            }
            
            # Since this is a test, hardcode the ₹100 reservation fee amount
            payload = {
                "order_amount": 100.00,
                "order_currency": "INR",
                "customer_details": {
                    "customer_id": f"cust_{booking.id}",
                    "customer_phone": ''.join(c for c in booking.customer_phone if c.isdigit() or c == '+') if booking.customer_phone else '9999999999',
                    "customer_email": booking.customer_email or 'guest@studiofloor.com',
                    "customer_name": booking.customer_name or 'Guest Creator'
                },
                "order_meta": {
                    "return_url": "http://localhost:3000/?order_id={order_id}"
                }
            }
            
            response = requests.post(url, json=payload, headers=headers)
            data = response.json()
            
            if response.status_code == 200:
                booking.cashfree_order_id = data.get('order_id')
                booking.save()
                return Response({'payment_session_id': data.get('payment_session_id'), 'order_id': data.get('order_id')})
            else:
                error_msg = data.get('message', data.get('error_message', 'Failed to create Cashfree order'))
                return Response({'error': f'Cashfree Error: {error_msg}'}, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny], throttle_classes=[ScopedRateThrottle])
    def verify_payment(self, request, pk=None):
        try:
            booking = Booking.objects.get(pk=pk)
            order_id = request.data.get('order_id')
            
            if not order_id:
                return Response({'error': 'Order ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Security: Only verify payments for bookings that aren't already confirmed
            if booking.status == 'CONFIRMED':
                return Response({'error': 'Booking is already confirmed'}, status=status.HTTP_400_BAD_REQUEST)
                
            url = f"https://sandbox.cashfree.com/pg/orders/{order_id}/payments" if settings.CASHFREE_ENV == 'SANDBOX' else f"https://api.cashfree.com/pg/orders/{order_id}/payments"
            
            headers = {
                "accept": "application/json",
                "x-api-version": "2023-08-01",
                "x-client-id": settings.CASHFREE_APP_ID,
                "x-client-secret": settings.CASHFREE_SECRET_KEY
            }
            
            response = requests.get(url, headers=headers)
            payments = response.json()
            
            # Check if any payment was successful
            is_successful = False
            if isinstance(payments, list):
                for p in payments:
                    if p.get('payment_status') == 'SUCCESS':
                        is_successful = True
                        break
            
            if is_successful or settings.DEBUG: # In DEBUG mode we can optionally auto-verify for testing
                # We'll rely on the actual API response to be safe
                pass
                
            if is_successful:
                booking.status = 'CONFIRMED'
                booking.reservation_fee_paid = True
                booking.save()
                return Response(BookingSerializer(booking).data)
            else:
                return Response({'error': 'Payment not successful yet'}, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TimeSlotViewSet(viewsets.ModelViewSet):
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = TimeSlot.objects.all()
        studio_id = self.request.query_params.get('studio')
        date = self.request.query_params.get('date')
        if studio_id:
            qs = qs.filter(studio_id=studio_id)
        if date:
            qs = qs.filter(date=date)
        return qs
