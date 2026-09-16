from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import StudioRoom, Blog, SiteSettings
from .serializers import StudioRoomSerializer, BlogSerializer, SiteSettingsSerializer

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and (request.user.role == 'ADMIN' or request.user.is_staff)

class StudioRoomViewSet(viewsets.ModelViewSet):
    queryset = StudioRoom.objects.all()
    serializer_class = StudioRoomSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'id'

class BlogViewSet(viewsets.ModelViewSet):
    queryset = Blog.objects.all().order_by('-created_at')
    serializer_class = BlogSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'id'

    def get_queryset(self):
        qs = super().get_queryset()
        if not (self.request.user and self.request.user.is_authenticated and (self.request.user.role == 'ADMIN' or self.request.user.is_staff)):
            qs = qs.filter(published=True)
        return qs

class SiteSettingsView(APIView):
    def get(self, request):
        settings = SiteSettings.get_settings()
        serializer = SiteSettingsSerializer(settings)
        return Response(serializer.data)

    def put(self, request):
        if not (request.user and request.user.is_authenticated and (request.user.role == 'ADMIN' or request.user.is_staff)):
            return Response({'error': 'Unauthorized'}, status=403)
        settings = SiteSettings.get_settings()
        serializer = SiteSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
