import { describe, it, expect } from 'vitest';
import { calcTotal, overlaps, isRoomAvailable, roomStatus, nightsBetween } from './booking';
import { bookingSchema, validateImage } from './schemas';

const bookings = [{ roomId: 1, checkIn: '2026-12-10', checkOut: '2026-12-13', status: 'confirmed' }];

describe('date overlap', () => {
  it('rejects overlapping stays', () => expect(isRoomAvailable(1, '2026-12-12', '2026-12-15', bookings)).toBe(false));
  it('allows back-to-back stays', () => expect(isRoomAvailable(1, '2026-12-13', '2026-12-15', bookings)).toBe(true));
  it('ignores cancelled bookings', () =>
    expect(isRoomAvailable(1, '2026-12-11', '2026-12-12', [{ ...bookings[0], status: 'cancelled' }])).toBe(true));
  it('detects containment', () => expect(overlaps('2026-12-01', '2026-12-31', '2026-12-10', '2026-12-12')).toBe(true));
});
describe('price', () => {
  it('computes nights x rate + services + tax', () => {
    const r = calcTotal({ rate: 100, checkIn: '2026-12-01', checkOut: '2026-12-04',
      services: [{ price: 20, perNight: true }, { price: 30 }] });
    expect(r).toMatchObject({ nights: 3, room: 300, services: 90, tax: 46.8, total: 436.8 });
  });
  it('is zero for invalid range', () => expect(calcTotal({ rate: 100, checkIn: '2026-12-04', checkOut: '2026-12-01' }).total).toBe(0));
  it('counts nights', () => expect(nightsBetween('2026-12-01', '2026-12-02')).toBe(1));
});
describe('status + validation', () => {
  it('shows Occupied after check-in', () =>
    expect(roomStatus(1, [{ ...bookings[0], status: 'checked-in' }], '2026-12-11')).toBe('Occupied'));
  it('rejects checkout before checkin', () =>
    expect(bookingSchema.safeParse({ checkIn: '2026-12-05', checkOut: '2026-12-04', guests: 1 }).success).toBe(false));
  it('rejects bad image type', () => expect(validateImage({ type: 'image/gif', size: 10 })).toMatch(/Only/));
});
