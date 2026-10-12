export function money(value) {
  if (value == null || value === '') return '0.00';
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(2) : String(value);
}

export function formatTime(value) {
  if (value == null || value === '') return value;
  if (typeof value === 'string') {
    if (/^\d{2}:\d{2}$/.test(value)) return `${value}:00`;
    return value.length >= 8 ? value.slice(0, 8) : value;
  }
  if (value instanceof Date) {
    const h = String(value.getUTCHours()).padStart(2, '0');
    const m = String(value.getUTCMinutes()).padStart(2, '0');
    const s = String(value.getUTCSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }
  return String(value);
}

export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function parseBool(value, fallback) {
  if (value === true || value === 'true' || value === '1' || value === 1) return true;
  if (value === false || value === 'false' || value === '0' || value === 0) return false;
  return fallback;
}

export function hourOf(timeStr) {
  if (timeStr == null) return 0;
  const s = typeof timeStr === 'string' ? timeStr : formatTime(timeStr);
  return parseInt(String(s).slice(0, 2), 10) || 0;
}

export function serializeUser(user) {
  if (!user) return null;
  const row = user.toJSON ? user.toJSON() : user;
  return {
    id: row.id,
    email: row.email,
    username: row.username || '',
    first_name: row.first_name || '',
    last_name: row.last_name || '',
    role: row.role || 'CUSTOMER',
    phone_number: row.phone_number || null,
    avatar_url: row.avatar_url || null,
    created_at: row.created_at,
  };
}

export function serializeRoom(room) {
  if (!room) return null;
  const row = room.toJSON ? room.toJSON() : room;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    room_type: row.room_type,
    tagline: row.tagline || '',
    description: row.description || '',
    hourly_rate: money(row.hourly_rate),
    half_day_rate: money(row.half_day_rate),
    full_day_rate: money(row.full_day_rate),
    max_capacity: row.max_capacity,
    image: row.image || null,
    acoustics_rating: row.acoustics_rating,
    is_active: Boolean(row.is_active),
    created_at: row.created_at,
  };
}

export function serializeBlog(blog) {
  const row = blog.toJSON ? blog.toJSON() : blog;
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    image: row.image || null,
    image_url: row.image_url || null,
    tags: row.tags || '',
    published: Boolean(row.published),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function serializeSettings(settings) {
  const row = settings.toJSON ? settings.toJSON() : settings;
  return {
    mode: row.mode || 'NORMAL',
    updated_at: row.updated_at,
  };
}

export function serializeSlot(slot) {
  const row = slot.toJSON ? slot.toJSON() : slot;
  return {
    id: row.id,
    studio: row.studio_id,
    date: row.date,
    start_time: formatTime(row.start_time),
    end_time: formatTime(row.end_time),
    is_available: Boolean(row.is_available),
    is_blackout: Boolean(row.is_blackout),
  };
}

export function serializeBooking(booking) {
  const row = booking.toJSON ? booking.toJSON() : booking;
  const studio = row.studio || null;
  return {
    id: row.id,
    booking_reference: row.booking_reference,
    user: row.user_id ?? null,
    customer_name: row.customer_name,
    customer_email: row.customer_email,
    customer_phone: row.customer_phone || '',
    studio: row.studio_id,
    studio_details: studio ? serializeRoom(studio) : null,
    booking_date: row.booking_date,
    start_time: formatTime(row.start_time),
    end_time: formatTime(row.end_time),
    duration_hours: row.duration_hours,
    status: row.status,
    total_amount: money(row.total_amount),
    reservation_fee_paid: Boolean(row.reservation_fee_paid),
    notes: row.notes || '',
    created_at: row.created_at,
  };
}

export async function uniqueSlug(Model, base, excludeId = null) {
  let slug = slugify(base) || 'item';
  const original = slug;
  let n = 1;
  while (true) {
    const existing = await Model.findOne({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${original}-${n++}`;
  }
}
