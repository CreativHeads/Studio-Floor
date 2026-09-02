from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudioRoomViewSet

router = DefaultRouter()
router.register(r'rooms', StudioRoomViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
