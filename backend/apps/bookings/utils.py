from django.core.mail import send_mail
from django.conf import settings
from django.utils.html import strip_tags
import logging

logger = logging.getLogger(__name__)

def send_booking_confirmation_email(booking):
    """
    Sends an alert email to the admin when a new booking is confirmed.
    """
    # ---------------------------------------------
    # Send Alert Email to Admin
    # ---------------------------------------------
    admin_subject = f"🔔 NEW BOOKING ALERT: {booking.booking_reference}"
    admin_html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #059669;">New Booking Received!</h2>
                
                <p>A new studio session has been confirmed. Here are the details:</p>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #e5e5e7;">
                    <h3 style="margin-top: 0; color: #111; font-size: 15px;">Creator Info</h3>
                    <p style="margin-bottom: 5px;"><strong>Name:</strong> {booking.customer_name}</p>
                    <p style="margin-bottom: 5px;"><strong>Phone:</strong> {booking.customer_phone}</p>
                    <p style="margin-bottom: 0;"><strong>Notes:</strong> {booking.notes or 'None'}</p>
                </div>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #e5e5e7;">
                    <h3 style="margin-top: 0; color: #111; font-size: 15px;">Session Details</h3>
                    <p style="margin-bottom: 5px;"><strong>Reference:</strong> {booking.booking_reference}</p>
                    <p style="margin-bottom: 5px;"><strong>Date:</strong> {booking.booking_date.strftime('%B %d, %Y')}</p>
                    <p style="margin-bottom: 5px;"><strong>Time:</strong> {booking.start_time.strftime('%I:%M %p')} - {booking.end_time.strftime('%I:%M %p')}</p>
                    <p style="margin-bottom: 0;"><strong>Studio:</strong> {booking.studio.name if booking.studio else 'Studio Suite'}</p>
                </div>
                
                <p style="margin-top: 20px;"><a href="https://www.studiofloor.in/" style="display:inline-block; padding: 10px 20px; background-color: #111; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 12px;">View Admin Dashboard</a></p>
            </div>
        </body>
    </html>
    """
    
    try:
        import re
        admin_email = settings.DEFAULT_FROM_EMAIL
        match = re.search(r'<(.+?)>', admin_email)
        if match:
            admin_email = match.group(1)
            
        send_mail(
            subject=admin_subject,
            message=strip_tags(admin_html),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[admin_email],
            html_message=admin_html,
            fail_silently=False,
        )
        logger.info(f"Admin alert email sent to {admin_email} for booking {booking.booking_reference}")
    except Exception as e:
        logger.error(f"Failed to send admin alert email: {str(e)}")
