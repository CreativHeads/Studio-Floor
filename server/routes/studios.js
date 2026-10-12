import { Router } from 'express';
import { StudioRoom, Blog, SiteSettings } from '../models/index.js';
import { optional, required, admin, isAdminUser } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { uploadImage } from '../lib/cloudinary.js';
import {
  serializeRoom, serializeBlog, serializeSettings, parseBool, uniqueSlug,
} from '../lib/serialize.js';

const r = Router();

async function getSettings() {
  const [row] = await SiteSettings.findOrCreate({
    where: { id: 1 },
    defaults: { mode: 'NORMAL' },
  });
  return row;
}

function roomPayload(body) {
  const data = {};
  const keys = [
    'name', 'slug', 'room_type', 'tagline', 'description',
    'hourly_rate', 'half_day_rate', 'full_day_rate', 'max_capacity',
    'acoustics_rating', 'image',
  ];
  for (const key of keys) {
    if (body[key] !== undefined && body[key] !== '') data[key] = body[key];
  }
  if (body.is_active !== undefined) data.is_active = parseBool(body.is_active, true);
  if (data.max_capacity != null) data.max_capacity = Number(data.max_capacity);
  return data;
}

r.get('/rooms', async (_req, res) => {
  const rooms = await StudioRoom.findAll({ order: [['id', 'ASC']] });
  res.json(rooms.map(serializeRoom));
});

r.post('/rooms', required, admin, upload.single('image'), async (req, res) => {
  const data = roomPayload(req.body);
  if (!data.name) return res.status(400).json({ name: ['This field is required.'] });
  data.slug = await uniqueSlug(StudioRoom, data.slug || data.name);
  if (req.file) data.image = await uploadImage(req.file, 'studios');
  if (data.hourly_rate == null) data.hourly_rate = 0;
  if (data.half_day_rate == null) data.half_day_rate = 0;
  if (data.full_day_rate == null) data.full_day_rate = 0;
  const room = await StudioRoom.create(data);
  res.status(201).json(serializeRoom(room));
});

r.get('/rooms/:id', async (req, res) => {
  const room = await StudioRoom.findByPk(req.params.id);
  if (!room) return res.status(404).json({ detail: 'Not found.' });
  res.json(serializeRoom(room));
});

r.patch('/rooms/:id', required, admin, upload.single('image'), async (req, res) => {
  const room = await StudioRoom.findByPk(req.params.id);
  if (!room) return res.status(404).json({ detail: 'Not found.' });
  const data = roomPayload(req.body);
  if (data.slug) data.slug = await uniqueSlug(StudioRoom, data.slug, room.id);
  if (req.file) data.image = await uploadImage(req.file, 'studios');
  await room.update(data);
  res.json(serializeRoom(room));
});

r.put('/rooms/:id', required, admin, upload.single('image'), async (req, res) => {
  const room = await StudioRoom.findByPk(req.params.id);
  if (!room) return res.status(404).json({ detail: 'Not found.' });
  const data = roomPayload(req.body);
  if (data.slug) data.slug = await uniqueSlug(StudioRoom, data.slug, room.id);
  if (req.file) data.image = await uploadImage(req.file, 'studios');
  await room.update(data);
  res.json(serializeRoom(room));
});

r.delete('/rooms/:id', required, admin, async (req, res) => {
  const room = await StudioRoom.findByPk(req.params.id);
  if (!room) return res.status(404).json({ detail: 'Not found.' });
  await room.destroy();
  res.status(204).end();
});

r.get('/blogs', optional, async (req, res) => {
  const where = isAdminUser(req.user) ? {} : { published: true };
  const blogs = await Blog.findAll({ where, order: [['created_at', 'DESC']] });
  res.json(blogs.map(serializeBlog));
});

r.post('/blogs', required, admin, upload.single('image'), async (req, res) => {
  const { title, content, tags, image_url } = req.body || {};
  if (!title) return res.status(400).json({ title: ['This field is required.'] });
  const slug = await uniqueSlug(Blog, title);
  let image = req.body.image || null;
  if (req.file) image = await uploadImage(req.file, 'blogs');
  const blog = await Blog.create({
    title,
    slug,
    content: content || '',
    tags: tags || '',
    published: parseBool(req.body.published, false),
    image,
    image_url: image_url || image || null,
  });
  res.status(201).json(serializeBlog(blog));
});

r.get('/blogs/:id', optional, async (req, res) => {
  const blog = await Blog.findOne({
    where: isAdminUser(req.user)
      ? { id: req.params.id }
      : { id: req.params.id, published: true },
  });
  if (!blog) return res.status(404).json({ detail: 'Not found.' });
  res.json(serializeBlog(blog));
});

r.patch('/blogs/:id', required, admin, upload.single('image'), async (req, res) => {
  const blog = await Blog.findByPk(req.params.id);
  if (!blog) return res.status(404).json({ detail: 'Not found.' });
  const data = {};
  for (const key of ['title', 'content', 'tags', 'image_url']) {
    if (req.body[key] !== undefined) data[key] = req.body[key];
  }
  if (req.body.published !== undefined) data.published = parseBool(req.body.published, blog.published);
  if (req.file) {
    data.image = await uploadImage(req.file, 'blogs');
    if (!data.image_url) data.image_url = data.image;
  }
  await blog.update(data);
  res.json(serializeBlog(blog));
});

r.delete('/blogs/:id', required, admin, async (req, res) => {
  const blog = await Blog.findByPk(req.params.id);
  if (!blog) return res.status(404).json({ detail: 'Not found.' });
  await blog.destroy();
  res.status(204).end();
});

r.get('/addons', (_req, res) => res.json([]));

r.get('/settings', async (_req, res) => {
  res.json(serializeSettings(await getSettings()));
});

r.put('/settings', required, admin, async (req, res) => {
  const allowed = ['NORMAL', 'COMING_SOON', 'MAINTENANCE'];
  const mode = req.body?.mode;
  if (mode && !allowed.includes(mode)) {
    return res.status(400).json({ mode: ['Invalid mode'] });
  }
  const settings = await getSettings();
  if (mode) settings.mode = mode;
  await settings.save();
  res.json(serializeSettings(settings));
});

export default r;
