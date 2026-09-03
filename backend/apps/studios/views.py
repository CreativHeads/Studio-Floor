from rest_framework import viewsets, permissions
from .models import StudioRoom, Blog
from .serializers import StudioRoomSerializer, BlogSerializer

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
