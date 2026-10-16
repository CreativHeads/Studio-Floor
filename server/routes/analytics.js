import { Router } from 'express';
import { Booking, StudioRoom, User } from '../models/index.js';
import { money } from '../lib/serialize.js';
import { required, admin } from '../middleware/auth.js';

const r = Router();

r.get('/summary', required, admin, async (_req, res) => {
  const [confirmed, totalBookings, totalUsers, activeStudios, rooms, recent] = await Promise.all([
    Booking.findAll({ where: { status: 'CONFIRMED' }, attributes: ['studio_id', 'total_amount', 'duration_hours'] }),
    Booking.count(),
    User.count(),
    StudioRoom.count({ where: { is_active: true } }),
    StudioRoom.findAll({ attributes: ['id', 'name', 'room_type'] }),
    Booking.findAll({
      include: [{ model: StudioRoom, as: 'studio', attributes: ['name'] }],
      order: [['created_at', 'DESC']],
      limit: 5,
    }),
  ]);

  const totalsByStudio = {};
  let totalRevenue = 0;
  let totalHours = 0;
  for (const b of confirmed) {
    const amount = Number(b.total_amount || 0);
    totalRevenue += amount;
    totalHours += Number(b.duration_hours || 0);
    const sid = b.studio_id;
    if (!totalsByStudio[sid]) totalsByStudio[sid] = { booking_count: 0, revenue: 0 };
    totalsByStudio[sid].booking_count += 1;
    totalsByStudio[sid].revenue += amount;
  }

  const allCounts = {};
  const allBookings = await Booking.findAll({ attributes: ['studio_id'] });
  for (const b of allBookings) {
    allCounts[b.studio_id] = (allCounts[b.studio_id] || 0) + 1;
  }

  res.json({
    kpis: {
      total_revenue: Number(totalRevenue),
      total_hours: totalHours,
      total_bookings: totalBookings,
      total_users: totalUsers,
      active_studios: activeStudios,
    },
    room_stats: rooms.map((room) => ({
      id: room.id,
      name: room.name,
      room_type: room.room_type,
      booking_count: allCounts[room.id] || 0,
      revenue: totalsByStudio[room.id]?.revenue ?? 0,
    })),
    recent_bookings: recent.map((b) => ({
      booking_reference: b.booking_reference,
      customer_name: b.customer_name,
      studio__name: b.studio?.name || null,
      booking_date: b.booking_date,
      total_amount: money(b.total_amount),
      status: b.status,
    })),
  });
});

export default r;
