from django.db import migrations

def make_admin(apps, schema_editor):
    User = apps.get_model('authentication', 'User')
    try:
        user = User.objects.get(email='mohamedsinan9400@gmail.com')
        user.is_staff = True
        user.is_superuser = True
        user.role = 'ADMIN'
        user.save()
    except User.DoesNotExist:
        pass

class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0002_make_mohamedsinan_admin'),
    ]

    operations = [
        migrations.RunPython(make_admin, reverse_code=migrations.RunPython.noop),
    ]
