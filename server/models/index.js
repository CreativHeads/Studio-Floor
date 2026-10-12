import { DataTypes as T } from 'sequelize';
import { sequelize } from '../db.js';

export const User = sequelize.define(
  'User',
  {
    email: { type: T.STRING, unique: true, allowNull: false },
    username: T.STRING,
    first_name: T.STRING,
    last_name: T.STRING,
    password: T.STRING,
    role: { type: T.STRING, defaultValue: 'CUSTOMER' },
    phone_number: T.STRING,
    avatar_url: T.STRING(500),
  },
  { tableName: 'users', underscored: true, createdAt: 'created_at', updatedAt: false }
);

export const StudioRoom = sequelize.define(
  'StudioRoom',
  {
    name: T.STRING,
    slug: { type: T.STRING, unique: true },
    room_type: { type: T.STRING, defaultValue: 'PODCAST' },
    tagline: T.STRING,
    description: T.TEXT,
    hourly_rate: T.DECIMAL(8, 2),
    half_day_rate: T.DECIMAL(8, 2),
    full_day_rate: T.DECIMAL(8, 2),
    max_capacity: { type: T.INTEGER, defaultValue: 4 },
    image: T.STRING(500),
    acoustics_rating: { type: T.STRING, defaultValue: 'STC-60 Sound Isolation' },
    is_active: { type: T.BOOLEAN, defaultValue: true },
  },
  { tableName: 'studio_rooms', underscored: true, createdAt: 'created_at', updatedAt: false }
);

export const TimeSlot = sequelize.define(
  'TimeSlot',
  {
    date: T.DATEONLY,
    start_time: T.STRING,
    end_time: T.STRING,
    is_available: { type: T.BOOLEAN, defaultValue: true },
    is_blackout: { type: T.BOOLEAN, defaultValue: false },
  },
  { tableName: 'time_slots', underscored: true, timestamps: false }
);

export const Booking = sequelize.define(
  'Booking',
  {
    booking_reference: { type: T.STRING(20), unique: true },
    customer_name: T.STRING,
    customer_email: T.STRING,
    customer_phone: T.STRING,
    booking_date: T.DATEONLY,
    start_time: T.STRING,
    end_time: T.STRING,
    duration_hours: { type: T.INTEGER, defaultValue: 1 },
    status: { type: T.STRING, defaultValue: 'CONFIRMED' },
    total_amount: T.DECIMAL(10, 2),
    notes: T.TEXT,
    reservation_fee_paid: { type: T.BOOLEAN, defaultValue: false },
    cashfree_order_id: T.STRING,
    expires_at: T.DATE,
  },
  { tableName: 'bookings', underscored: true, createdAt: 'created_at', updatedAt: false }
);

export const Blog = sequelize.define(
  'Blog',
  {
    title: T.STRING,
    slug: { type: T.STRING, unique: true },
    content: T.TEXT,
    image: T.STRING(500),
    image_url: T.STRING(500),
    tags: T.STRING,
    published: { type: T.BOOLEAN, defaultValue: false },
  },
  { tableName: 'blogs', underscored: true, createdAt: 'created_at', updatedAt: 'updated_at' }
);

export const SiteSettings = sequelize.define(
  'SiteSettings',
  {
    mode: { type: T.STRING, defaultValue: 'NORMAL' },
  },
  { tableName: 'site_settings', underscored: true, createdAt: false, updatedAt: 'updated_at' }
);

StudioRoom.hasMany(TimeSlot, { foreignKey: 'studio_id' });
TimeSlot.belongsTo(StudioRoom, { foreignKey: 'studio_id', as: 'studio' });

StudioRoom.hasMany(Booking, { foreignKey: 'studio_id' });
Booking.belongsTo(StudioRoom, { foreignKey: 'studio_id', as: 'studio' });

User.hasMany(Booking, { foreignKey: 'user_id' });
Booking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Booking.beforeCreate((booking) => {
  if (!booking.booking_reference) {
    booking.booking_reference = `STU-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
  }
});
