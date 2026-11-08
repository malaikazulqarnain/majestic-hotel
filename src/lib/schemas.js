import { z } from 'zod';

export const bookingSchema = z.object({
  checkIn: z.string().min(1, 'Choose a check-in date'),
  checkOut: z.string().min(1, 'Choose a check-out date'),
  guests: z.coerce.number().int().min(1, 'At least 1 guest'),
}).refine((v) => v.checkOut > v.checkIn, {
  path: ['checkOut'], message: 'Check-out must be after check-in',
});

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Minimum 6 characters'),
});

export const MAX_IMG = 2 * 1024 * 1024;
export const IMG_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const validateImage = (f) =>
  !IMG_TYPES.includes(f.type) ? 'Only JPG, PNG or WebP' :
  f.size > MAX_IMG ? 'Max size is 2 MB' : null;
