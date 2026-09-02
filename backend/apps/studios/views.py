from rest_framework import viewsets, permissions
from .models import StudioRoom
from .serializers import StudioRoomSerializer

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
