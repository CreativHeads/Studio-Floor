import { readFileSync } from 'fs';
import admin from 'firebase-admin';

export function initFirebase() {
  if (admin.apps.length) return true;
  try {
    const raw = process.env.FIREBASE_CREDENTIALS_JSON;
    const filePath = process.env.FIREBASE_CREDENTIALS_PATH;
    if (raw) {
      admin.initializeApp({ credential: admin.credential.cert(JSON.parse(raw)) });
      return true;
    }
    if (filePath) {
      const cred = JSON.parse(readFileSync(filePath, 'utf8'));
      admin.initializeApp({ credential: admin.credential.cert(cred) });
      return true;
    }
    console.warn('Firebase Admin: no FIREBASE_CREDENTIALS_JSON or FIREBASE_CREDENTIALS_PATH set');
    return false;
  } catch (err) {
    console.warn('Firebase Admin initialization warning:', err.message);
    return false;
  }
}

export async function verifyIdToken(idToken) {
  if (!initFirebase()) return null;
  try {
    return await admin.auth().verifyIdToken(idToken);
  } catch (err) {
    console.warn('Firebase token verify failed:', err.message);
    return null;
  }
}
