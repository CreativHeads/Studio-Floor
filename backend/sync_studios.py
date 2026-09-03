import os
import django
import requests
import re

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.studios.models import StudioRoom

def run():
    print("Fetching production studios...")
    try:
        response = requests.get('https://studio-floor-backend.onrender.com/api/studios/rooms/')
        response.raise_for_status()
        data = response.json()
        
        print(f"Found {len(data)} studios. Syncing to local database...")
        StudioRoom.objects.all().delete()
        
        for item in data:
            print(f"Syncing: {item.get('name', 'Unknown')}")
            
            # The API returns 'image' as a full Cloudinary URL.
            # django-cloudinary-storage expects the relative path like 'image/upload/v.../filename.jpg'
            # Or we can just extract the path after the cloud name.
            image_url = item.get('image')
            image_path = ''
            if image_url:
                # Example: https://res.cloudinary.com/dxyz/image/upload/v12345/studios/xyz.jpg
                match = re.search(r'upload/(v\d+/studios/[^/]+)', image_url)
                if match:
                    image_path = match.group(1)
                else:
                    match = re.search(r'upload/(.+)', image_url)
                    if match:
                        image_path = match.group(1)
                        
            StudioRoom.objects.create(
                id=item.get('id'),
                name=item.get('name', ''),
                slug=f"room-{item.get('id')}",
                hourly_rate=25.00,
                half_day_rate=100.00,
                full_day_rate=180.00,
                max_capacity=item.get('max_capacity', item.get('capacity', 4)),
                image=image_path,
                is_active=item.get('is_active', True)
            )
            
        print("Successfully synced all studios!")
    except Exception as e:
        print(f"Error syncing studios: {e}")

if __name__ == '__main__':
    run()
