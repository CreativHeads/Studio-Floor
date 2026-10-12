import { Router } from 'express';
import { Op } from 'sequelize';
import rateLimit from 'express-rate-limit';
import { sequelize } from '../db.js';
import { Booking, TimeSlot, StudioRoom, User } from '../models/index.js';
import { optional, required, admin, isAdminUser } from '../middleware/auth.js';
import {
  serializeBooking, serializeSlot, hourOf,
} from '../lib/serialize.js';
import { sendBookingConfirmationEmail } from '../lib/email.js';

const r = Router();
const STATUSES = ['PENDING', 'HOLD', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

const bookingLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

function cashfreeBase() {
  return process.env.CASHFREE_ENV === 'PRODUCTION'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';
}

function cashfreeHeaders() {
  return {
    accept: 'application/json',
    'content-type': 'application/json',
    'x-api-version': '2023-08-01',
    'x-client-id': process.env.CASHFREE_APP_ID,
    'x-client-secret': process.env.CASHFREE_SECRET_KEY,
  };
}

function bookingInclude() {
  return [{ model: StudioRoom, as: 'studio' }];
}

function activeBookingWhere(date) {
  const now = new Date();
  return {
    booking_date: date,
    status: { [Op.ne]: 'CANCELLED' },
    [Op.or]: [
      { status: { [Op.ne]: 'HOLD' } },
      { expires_at: { [Op.gte]: now } },
      { expires_at: null },
    ],
  };
}

function overlaps(reqStart, reqEnd, booking) {
  const bStart = hourOf(booking.start_time);
  const bEnd = hourOf(booking.end_time);
  return reqStart < bEnd + 1 && reqEnd > bStart;
}

async function listForRequest(req) {
  const order = [['created_at', 'DESC']];
  const include = bookingInclude();
  if (isAdminUser(req.user)) {
    return Booking.findAll({ include, order });
  }
  if (req.user?.id) {
    const dbUser = await User.findByPk(req.user.id);
    const or = [{ user_id: req.user.id }];
    if (dbUser?.email) or.push({ customer_email: dbUser.email });
    return Booking.findAll({ include, order, where: { [Op.or]: or } });
  }
  const email = req.query.email;
  if (email) return Booking.findAll({ include, order, where: { customer_email: email } });
  return [];
}

r.get('/reservations', optional, async (req, res) => {
  const rows = await listForRequest(req);
  res.json(rows.map(serializeBooking));
});

r.post('/reservations', optional, bookingLimit, async (req, res) => {
  const holdId = req.body?.hold_id;
  if (holdId) {
    const hold = await Booking.findOne({
      where: { id: holdId, status: 'HOLD' },
      include: bookingInclude(),
    });
    if (!hold) return res.status(400).json({ error: 'Hold expired or invalid' });
    const fields = [
      'customer_name', 'customer_email', 'customer_phone', 'studio',
      'booking_date', 'start_time', 'end_time', 'duration_hours', 'total_amount', 'notes',
    ];
    for (const key of fields) {
      if (req.body[key] !== undefined) {
        hold[key === 'studio' ? 'studio_id' : key] = req.body[key];
      }
    }
    if (req.user?.id) hold.user_id = req.user.id;
    hold.status = 'CONFIRMED';
    hold.expires_at = null;
    await hold.save();
    await hold.reload({ include: bookingInclude() });
    sendBookingConfirmationEmail(hold, hold.studio?.name);
    return res.status(201).json(serializeBooking(hold));
  }

  if (!req.body?.studio || !req.body?.booking_date) {
    return res.status(400).json({ studio: ['This field is required.'] });
  }
  const booking = await Booking.create({
    studio_id: req.body.studio,
    user_id: req.user?.id || null,
    customer_name: req.body.customer_name || 'Guest',
    customer_email: req.body.customer_email || '',
    customer_phone: req.body.customer_phone || '',
    booking_date: req.body.booking_date,
    start_time: req.body.start_time,
    end_time: req.body.end_time,
    duration_hours: req.body.duration_hours || 1,
    status: req.body.status || 'CONFIRMED',
    total_amount: req.body.total_amount || 0,
    notes: req.body.notes || '',
  });
  await booking.reload({ include: bookingInclude() });
  res.status(201).json(serializeBooking(booking));
});

r.get('/reservations/booked_slots', async (req, res) => {
  const studioId = req.query.studio;
  const date = req.query.date;
  const currentHoldId = req.query.hold_id;
  if (!studioId || !date) return res.json([]);

  const bookings = await Booking.findAll({ where: activeBookingWhere(date) });
  const blocked = {};
  for (const b of bookings) {
    const startHour = hourOf(b.start_time);
    const endHour = hourOf(b.end_time);
    const blockEnd = endHour + 1;
    for (let h = startHour; h < blockEnd && h <= 23; h += 1) {
      const current = blocked[h];
      if (current !== 'CONFIRMED' && current !== 'COMPLETED') {
        blocked[h] = currentHoldId && String(b.id) === String(currentHoldId) ? 'MY_HOLD' : b.status;
      }
    }
  }
  res.json(Object.entries(blocked).map(([hour, status]) => ({ hour: Number(hour), status })));
});

r.post('/reservations/hold_slot', optional, bookingLimit, async (req, res) => {
  const { studio, booking_date, start_time, end_time, duration_hours, previous_hold_id } = req.body || {};
  if (!studio || !booking_date || !start_time || !end_time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const hold = await sequelize.transaction(async (t) => {
      if (req.user?.id) {
        await Booking.destroy({ where: { user_id: req.user.id, status: 'HOLD' }, transaction: t });
      }
      if (previous_hold_id) {
        await Booking.destroy({ where: { id: previous_hold_id, status: 'HOLD' }, transaction: t });
      }

      const bookings = await Booking.findAll({
        where: activeBookingWhere(booking_date),
        transaction: t,
        ...(sequelize.getDialect() === 'mysql' ? { lock: t.LOCK.UPDATE } : {}),
      });

      const reqStart = hourOf(start_time);
      const reqEnd = hourOf(end_time);
      for (const b of bookings) {
        if (overlaps(reqStart, reqEnd, b)) {
          const err = new Error('overlap');
          err.status = 409;
          throw err;
        }
      }

      const dbUser = req.user?.id ? await User.findByPk(req.user.id, { transaction: t }) : null;
      return Booking.create({
        studio_id: studio,
        booking_date,
        start_time,
        end_time,
        duration_hours: duration_hours || 1,
        status: 'HOLD',
        total_amount: 0,
        customer_name: dbUser?.username || 'Guest (Hold)',
        customer_email: dbUser?.email || 'hold@pending.com',
        user_id: dbUser?.id || null,
        expires_at: new Date(Date.now() + 10 * 60 * 1000),
      }, { transaction: t });
    });

    await hold.reload({ include: bookingInclude() });
    res.json(serializeBooking(hold));
  } catch (err) {
    const busy = err.name === 'SequelizeTimeoutError' || err.parent?.code === 'SQLITE_BUSY' || err.original?.code === 'SQLITE_BUSY';
    if (err.status === 409 || err.message === 'overlap' || busy) {
      return res.status(409).json({ error: 'Selected time overlaps with an existing booking or its cleaning buffer.' });
    }
    return res.status(500).json({ error: err.message || 'Failed to hold slot' });
  }
});

async function canAccess(req, booking) {
  if (isAdminUser(req.user)) return true;
  if (!req.user?.id) return false;
  if (booking.user_id === req.user.id) return true;
  const dbUser = await User.findByPk(req.user.id);
  return Boolean(dbUser?.email) && booking.customer_email === dbUser.email;
}

r.get('/reservations/:id', optional, async (req, res) => {
  const booking = await Booking.findByPk(req.params.id, { include: bookingInclude() });
  if (!booking || !(await canAccess(req, booking))) return res.status(404).json({ detail: 'Not found.' });
  res.json(serializeBooking(booking));
});

r.delete('/reservations/:id', optional, async (req, res) => {
  const booking = await Booking.findByPk(req.params.id);
  if (!booking || !(await canAccess(req, booking))) return res.status(404).json({ detail: 'Not found.' });
  await booking.destroy();
  res.status(204).end();
});

r.patch('/reservations/:id/update_status', required, async (req, res) => {
  const booking = await Booking.findByPk(req.params.id, { include: bookingInclude() });
  if (!booking) return res.status(404).json({ detail: 'Not found.' });
  const newStatus = req.body?.status;
  if (!STATUSES.includes(newStatus)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  booking.status = newStatus;
  await booking.save();
  res.json(serializeBooking(booking));
});

r.post('/reservations/:id/release_hold', async (req, res) => {
  const hold = await Booking.findOne({ where: { id: req.params.id, status: 'HOLD' } });
  if (!hold) return res.status(404).json({ error: 'Hold not found' });
  hold.status = 'CANCELLED';
  await hold.save();
  res.json({ status: 'Hold released' });
});

r.post('/reservations/:id/create_payment_order', optional, bookingLimit, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status !== 'HOLD') {
      return res.status(400).json({ error: 'Cannot initiate payment for a booking that is not on hold.' });
    }

    booking.customer_name = req.body?.customer_name || booking.customer_name;
    booking.customer_email = req.body?.customer_email || booking.customer_email;
    booking.customer_phone = req.body?.customer_phone || booking.customer_phone;
    if (req.body?.notes !== undefined) booking.notes = req.body.notes;
    if (req.user?.id) booking.user_id = req.user.id;
    await booking.save();

    const origin = (req.get('origin') || process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
    const phone = booking.customer_phone
      ? String(booking.customer_phone).replace(/[^\d+]/g, '')
      : '9999999999';

    const payload = {
      order_amount: 100.0,
      order_currency: 'INR',
      customer_details: {
        customer_id: `cust_${booking.id}`,
        customer_phone: phone || '9999999999',
        customer_email: booking.customer_email || 'guest@studiofloor.com',
        customer_name: booking.customer_name || 'Guest Creator',
      },
      order_meta: {
        return_url: `${origin}/?order_id={order_id}`,
      },
    };

    const response = await fetch(`${cashfreeBase()}/orders`, {
      method: 'POST',
      headers: cashfreeHeaders(),
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({ error: `Cashfree Error (Not JSON): ${response.status} - ${text}` });
    }

    if (response.ok) {
      booking.cashfree_order_id = data.order_id;
      await booking.save();
      return res.json({ payment_session_id: data.payment_session_id, order_id: data.order_id });
    }
    const errorMsg = data.message || data.error_message || 'Failed to create Cashfree order';
    return res.status(400).json({ error: `Cashfree Error: ${errorMsg}` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

r.post('/reservations/:id/verify_payment', optional, bookingLimit, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, { include: bookingInclude() });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    const orderId = req.body?.order_id;
    if (!orderId) return res.status(400).json({ error: 'Order ID is required' });
    if (booking.status === 'CONFIRMED') {
      return res.status(400).json({ error: 'Booking is already confirmed' });
    }

    const response = await fetch(`${cashfreeBase()}/orders/${orderId}/payments`, {
      headers: cashfreeHeaders(),
    });
    const payments = await response.json();

    let isSuccessful = false;
    if (Array.isArray(payments)) {
      isSuccessful = payments.some((p) => p.payment_status === 'SUCCESS');
    } else if (payments && typeof payments === 'object') {
      if (payments.payment_status === 'SUCCESS') isSuccessful = true;
      else if (Array.isArray(payments.payments)) {
        isSuccessful = payments.payments.some((p) => p.payment_status === 'SUCCESS');
      }
    }

    if (!isSuccessful) {
      return res.status(400).json({ error: 'Payment not successful yet' });
    }

    booking.status = 'CONFIRMED';
    booking.reservation_fee_paid = true;
    booking.expires_at = null;
    await booking.save();
    sendBookingConfirmationEmail(booking, booking.studio?.name);
    await booking.reload({ include: bookingInclude() });
    res.json(serializeBooking(booking));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

r.get('/slots', async (req, res) => {
  const where = {};
  if (req.query.studio) where.studio_id = req.query.studio;
  if (req.query.date) where.date = req.query.date;
  const slots = await TimeSlot.findAll({ where });
  res.json(slots.map(serializeSlot));
});

r.post('/slots', required, admin, async (req, res) => {
  const slot = await TimeSlot.create({
    studio_id: req.body.studio,
    date: req.body.date,
    start_time: req.body.start_time,
    end_time: req.body.end_time,
    is_available: req.body.is_available !== false,
    is_blackout: Boolean(req.body.is_blackout),
  });
  res.status(201).json(serializeSlot(slot));
});

export function startHoldCleanup() {
  const sweep = async () => {
    try {
      await Booking.update(
        { status: 'CANCELLED' },
        { where: { status: 'HOLD', expires_at: { [Op.lt]: new Date() } } }
      );
    } catch (err) {
      console.warn('Hold cleanup failed:', err.message);
    }
  };
  sweep();
  return setInterval(sweep, 60 * 1000);
}

export default r;
