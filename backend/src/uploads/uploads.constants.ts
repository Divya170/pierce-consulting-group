import { resolve } from 'path';

/** backend/uploads — served publicly at /uploads/* */
export const UPLOAD_DIR = resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
};
