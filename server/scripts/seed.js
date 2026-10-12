import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { sequelize } from '../db.js';
import { User, StudioRoom, SiteSettings } from '../models/index.js';

const DEMO_ROOMS = [
  {
    name: 'Studio A - Broadcast Presentation Suite',
    slug: 'broadcast-master-suite',
    room_type: 'BROADCAST',
    tagline: '4K Multi-Camera Live Stream & Keynote Studio',
    description: 'Designed for high-end corporate webcasts, product launches, video podcasts, and keynote broadcasts. Features acoustic floating floors, customizable DMX LED wall, and triple Shure SM7B setup.',
    hourly_rate: 120.00,
    half_day_rate: 420.00,
    full_day_rate: 780.00,
    max_capacity: 1,
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
    acoustics_rating: 'STC-65 Ultra Isolation Noise Floor',
    is_active: true,
  },
  {
    name: 'Studio B - Podcast Master Lounge',
    slug: 'podcast-lounge-suite',
    room_type: 'PODCAST',
    tagline: 'Cozy Sound-Treated Lounge for Intimate Conversations',
    description: 'Premium warm aesthetic podcast room featuring custom leather seating, Rodecaster Pro II interface, 4x Electro-Voice RE20 microphones, and ambient RGB neon backlighting.',
    hourly_rate: 85.00,
    half_day_rate: 300.00,
    full_day_rate: 550.00,
    max_capacity: 2,
    image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80',
    acoustics_rating: 'STC-60 Studio Acoustical Foam & Diffusers',
    is_active: true,
  },
  {
    name: 'Studio C - Audio Mastering & Voiceover Box',
    slug: 'audio-mastering-suite',
    room_type: 'AUDIO_MASTER',
    tagline: 'Whisper-Quiet Booth for Voiceovers & Sound Design',
    description: 'Precision calibrated voiceover and audio post-production room. Equipped with Neumann U87 Ai condenser microphone, Genelec 8341A SAM monitors, and Pro Tools Ultimate HD.',
    hourly_rate: 95.00,
    half_day_rate: 340.00,
    full_day_rate: 620.00,
    max_capacity: 4,
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    acoustics_rating: 'NC-15 Absolute Silence Enclosure',
    is_active: true,
  },
];

export async function seedIfEmpty() {
  const userCount = await User.count();
  if (userCount > 0) return false;

  await User.create({
    email: 'admin@studioplus.com',
    username: 'admin',
    first_name: 'Sarah',
    last_name: 'Jenkins',
    role: 'ADMIN',
    password: await bcrypt.hash('AdminSecret123!', 10),
  });

  await User.create({
    email: 'alex@creator.com',
    username: 'alex_creator',
    first_name: 'Alex',
    last_name: 'Rivera',
    role: 'CUSTOMER',
    phone_number: '+1 (555) 382-9910',
    password: await bcrypt.hash('Customer123!', 10),
  });

  if ((await StudioRoom.count()) === 0) {
    await StudioRoom.bulkCreate(DEMO_ROOMS);
  }

  await SiteSettings.findOrCreate({ where: { id: 1 }, defaults: { mode: 'NORMAL' } });
  console.log('Seeded admin@studioplus.com / AdminSecret123! and demo studios');
  return true;
}

const isDirect = process.argv[1] && /seed\.js$/i.test(process.argv[1]);
if (isDirect) {
  await sequelize.sync();
  await seedIfEmpty();
  await sequelize.close();
}
