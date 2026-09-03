from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudioRoomViewSet, BlogViewSet

router = DefaultRouter()
router.register(r'rooms', StudioRoomViewSet)
router.register(r'blogs', BlogViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
