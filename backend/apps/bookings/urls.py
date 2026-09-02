from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet, TimeSlotViewSet

router = DefaultRouter()
router.register(r'reservations', BookingViewSet)
router.register(r'slots', TimeSlotViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
