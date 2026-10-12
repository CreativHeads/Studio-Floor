import nodemailer from 'nodemailer';

function transporter() {
  if (!process.env.EMAIL_HOST_USER || !process.env.EMAIL_HOST_PASSWORD) return null;
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
    port: Number(process.env.EMAIL_PORT || 2525),
    secure: false,
    auth: {
      user: process.env.EMAIL_HOST_USER,
      pass: process.env.EMAIL_HOST_PASSWORD,
    },
  });
}

function adminInbox() {
  const from = process.env.DEFAULT_FROM_EMAIL || 'Studio Floor <booking@studiofloor.com>';
  const match = from.match(/<(.+?)>/);
  return match ? match[1] : from;
}

export function sendBookingConfirmationEmail(booking, studioName) {
  const transport = transporter();
  if (!transport) return;

  const dateLabel = booking.booking_date;
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #059669;">New Booking Received!</h2>
          <p>A new studio session has been confirmed. Here are the details:</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #e5e5e7;">
            <h3 style="margin-top: 0; color: #111; font-size: 15px;">Creator Info</h3>
            <p style="margin-bottom: 5px;"><strong>Name:</strong> ${booking.customer_name || ''}</p>
            <p style="margin-bottom: 5px;"><strong>Phone:</strong> ${booking.customer_phone || ''}</p>
            <p style="margin-bottom: 0;"><strong>Notes:</strong> ${booking.notes || 'None'}</p>
          </div>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #e5e5e7;">
            <h3 style="margin-top: 0; color: #111; font-size: 15px;">Session Details</h3>
            <p style="margin-bottom: 5px;"><strong>Reference:</strong> ${booking.booking_reference}</p>
            <p style="margin-bottom: 5px;"><strong>Date:</strong> ${dateLabel}</p>
            <p style="margin-bottom: 5px;"><strong>Time:</strong> ${booking.start_time} - ${booking.end_time}</p>
            <p style="margin-bottom: 0;"><strong>Studio:</strong> ${studioName || 'Studio Suite'}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  transport
    .sendMail({
      from: process.env.DEFAULT_FROM_EMAIL || 'Studio Floor <booking@studiofloor.com>',
      to: adminInbox(),
      subject: `🔔 NEW BOOKING ALERT: ${booking.booking_reference}`,
      html,
    })
    .catch((err) => console.error('Failed to send admin alert email:', err.message));
}
