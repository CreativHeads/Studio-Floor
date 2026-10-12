import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '..', 'uploads');

function configured() {
  if (process.env.CLOUDINARY_URL) return true;
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

if (configured() && !process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function uploadImage(file, folder = 'studios') {
  if (!file) return null;
  if (configured()) {
    const source = file.path
      ? file.path
      : `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(source, { folder });
    return result.secure_url;
  }
  fs.mkdirSync(uploadDir, { recursive: true });
  const ext = path.extname(file.originalname || '') || '.jpg';
  const name = `${folder}-${Date.now()}${ext}`;
  const dest = path.join(uploadDir, name);
  if (file.buffer) fs.writeFileSync(dest, file.buffer);
  else if (file.path) fs.copyFileSync(file.path, dest);
  return `/uploads/${name}`;
}
