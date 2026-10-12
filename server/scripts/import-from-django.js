/**
 * Import a Django dumpdata JSON file into the Node/Sequelize tables.
 *
 *   cd backend
 *   python manage.py dumpdata studios bookings authentication --indent 2 > ../dump.json
 *   cd ../server
 *   node scripts/import-from-django.js ../dump.json
 *
 * Django password hashes (pbkdf2) are copied as-is. Those users must reset
 * their password or use Firebase/phone login. Firebase users are unaffected.
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from '../db.js';
import { User, StudioRoom, TimeSlot, Booking, Blog, SiteSettings } from '../models/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dumpPath = process.argv[2] || path.join(__dirname, '../../dump.json');

if (!fs.existsSync(dumpPath)) {
  console.error(`dump.json not found at ${dumpPath}`);
  process.exit(1);
}

const rows = JSON.parse(fs.readFileSync(dumpPath, 'utf8'));
const byModel = (name) => rows.filter((r) => r.model === name);

await sequelize.sync();

function pick(fields, keys) {
  const out = {};
  for (const key of keys) {
    if (fields[key] !== undefined) out[key] = fields[key];
  }
  return out;
}

const users = byModel('authentication.user');
for (const item of users) {
  const f = item.fields;
  await User.upsert({
    id: item.pk,
    email: f.email,
    username: f.username,
    first_name: f.first_name,
    last_name: f.last_name,
    password: f.password,
    role: f.role || (f.is_superuser ? 'ADMIN' : 'CUSTOMER'),
    phone_number: f.phone_number || null,
    avatar_url: f.avatar_url || null,
    created_at: f.created_at || f.date_joined || new Date(),
  });
}
console.log(`Imported ${users.length} users`);

const rooms = byModel('studios.studioroom');
for (const item of rooms) {
  const f = item.fields;
  await StudioRoom.upsert({
    id: item.pk,
    ...pick(f, [
      'name', 'slug', 'room_type', 'tagline', 'description',
      'hourly_rate', 'half_day_rate', 'full_day_rate', 'max_capacity',
      'acoustics_rating', 'is_active',
    ]),
    image: f.image || f.image_url || null,
    created_at: f.created_at || new Date(),
  });
}
console.log(`Imported ${rooms.length} rooms`);

const blogs = byModel('studios.blog');
for (const item of blogs) {
  const f = item.fields;
  await Blog.upsert({
    id: item.pk,
    title: f.title,
    slug: f.slug,
    content: f.content,
    image: f.image || null,
    image_url: f.image_url || null,
    tags: f.tags || '',
    published: Boolean(f.published),
    created_at: f.created_at || new Date(),
    updated_at: f.updated_at || new Date(),
  });
}
console.log(`Imported ${blogs.length} blogs`);

const settings = byModel('studios.sitesettings');
for (const item of settings) {
  await SiteSettings.upsert({
    id: item.pk,
    mode: item.fields.mode || 'NORMAL',
    updated_at: item.fields.updated_at || new Date(),
  });
}

const slots = byModel('bookings.timeslot');
for (const item of slots) {
  const f = item.fields;
  await TimeSlot.upsert({
    id: item.pk,
    studio_id: f.studio,
    date: f.date,
    start_time: f.start_time,
    end_time: f.end_time,
    is_available: f.is_available !== false,
    is_blackout: Boolean(f.is_blackout),
  });
}
console.log(`Imported ${slots.length} time slots`);

const bookings = byModel('bookings.booking');
for (const item of bookings) {
  const f = item.fields;
  await Booking.upsert({
    id: item.pk,
    booking_reference: f.booking_reference,
    user_id: f.user,
    customer_name: f.customer_name,
    customer_email: f.customer_email,
    customer_phone: f.customer_phone,
    studio_id: f.studio,
    booking_date: f.booking_date,
    start_time: f.start_time,
    end_time: f.end_time,
    duration_hours: f.duration_hours,
    status: f.status,
    total_amount: f.total_amount,
    notes: f.notes,
    reservation_fee_paid: Boolean(f.reservation_fee_paid),
    cashfree_order_id: f.cashfree_order_id || null,
    expires_at: f.expires_at || null,
    created_at: f.created_at || new Date(),
  });
}
console.log(`Imported ${bookings.length} bookings`);

await sequelize.close();
console.log('Django dump import complete');
