from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudioRoomViewSet, BlogViewSet, SiteSettingsView

router = DefaultRouter()
router.register(r'rooms', StudioRoomViewSet)
router.register(r'blogs', BlogViewSet)

urlpatterns = [
    path('settings/', SiteSettingsView.as_view(), name='site-settings'),
    path('', include(router.urls)),
]
