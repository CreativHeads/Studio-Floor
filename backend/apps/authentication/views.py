from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
import secrets
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer, CustomTokenObtainPairSerializer
from .firebase_auth import verify_firebase_token

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth_attempt'

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth_attempt'

class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class UserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-created_at')
    permission_classes = (permissions.IsAdminUser,)
    serializer_class = UserSerializer

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.IsAdminUser,)
    serializer_class = UserSerializer

class FirebaseLoginView(APIView):
    permission_classes = (permissions.AllowAny,)
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth_attempt'

    def post(self, request):
        id_token = request.data.get('id_token')
        full_name = request.data.get('full_name')
        
        if not id_token:
            return Response({'error': 'Missing id_token'}, status=status.HTTP_400_BAD_REQUEST)

        decoded_token = verify_firebase_token(id_token)
        if not decoded_token:
            return Response({'error': 'Invalid or expired Firebase token'}, status=status.HTTP_401_UNAUTHORIZED)
            
        phone_number = decoded_token.get('phone_number')
        if not phone_number:
            return Response({'error': 'No phone number found in token'}, status=status.HTTP_400_BAD_REQUEST)

        # Find or create user
        user = User.objects.filter(phone_number=phone_number).first()
        
        if not user:
            # We must create one
            name_parts = (full_name or 'Creator User').strip().split(' ')
            first_name = name_parts[0] or 'Creator'
            last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
            
            # Generate a secure dummy email and unique username
            clean_phone = ''.join(filter(str.isdigit, phone_number))
            email = f"{clean_phone}@studiofloor.com"
            username = clean_phone
            
            # Generate a secure random password since they login with OTP
            password = secrets.token_urlsafe(16)
            
            user = User(
                first_name=first_name,
                last_name=last_name,
                username=username,
                email=email,
                phone_number=phone_number,
                role=User.Role.CUSTOMER
            )
            user.set_password(password)
            user.save()
            
        # Generate JWT Tokens
        refresh = RefreshToken.for_user(user)
        user_serializer = UserSerializer(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': user_serializer.data
        })

from django.conf import settings

class DevLoginView(APIView):
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        if not settings.DEBUG:
            return Response({'error': 'Dev login is not allowed in production.'}, status=status.HTTP_403_FORBIDDEN)
            
        phone_number = request.data.get('phone_number')
        full_name = request.data.get('full_name')
        
        if not phone_number:
            return Response({'error': 'Missing phone number'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Find or create user
        user = User.objects.filter(phone_number=phone_number).first()
        
        if not user:
            name_parts = (full_name or 'Dev User').strip().split(' ')
            first_name = name_parts[0] or 'Dev'
            last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
            
            clean_phone = ''.join(filter(str.isdigit, phone_number))
            email = f"{clean_phone}@studiofloor.com"
            username = clean_phone
            password = secrets.token_urlsafe(16)
            
            user = User(
                first_name=first_name,
                last_name=last_name,
                username=username,
                email=email,
                phone_number=phone_number,
                role=User.Role.CUSTOMER
            )
            user.set_password(password)
            user.save()
            
        refresh = RefreshToken.for_user(user)
        user_serializer = UserSerializer(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': user_serializer.data
        })
