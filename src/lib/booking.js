export const TAX_RATE = 0.12;
const DAY = 86400000;
const toDate = (d) => new Date(d + 'T00:00:00Z');

export const nightsBetween = (checkIn, checkOut) =>
  Math.round((toDate(checkOut) - toDate(checkIn)) / DAY);

// Half-open ranges [in, out): back-to-back stays (out == next in) are allowed.
export function overlaps(aIn, aOut, bIn, bOut) {
  return toDate(aIn) < toDate(bOut) && toDate(bIn) < toDate(aOut);
}

export function isRoomAvailable(roomId, checkIn, checkOut, bookings) {
  return !bookings.some(
    (b) => b.roomId === roomId && b.status !== 'cancelled' &&
      overlaps(checkIn, checkOut, b.checkIn, b.checkOut)
  );
}

// Dates the date picker must disable for a room (past dates + booked nights).
export function disabledNights(roomId, bookings, today) {
  const out = new Set();
  for (const b of bookings) {
    if (b.roomId !== roomId || b.status === 'cancelled') continue;
    for (let t = toDate(b.checkIn); t < toDate(b.checkOut); t = new Date(+t + DAY))
      out.add(t.toISOString().slice(0, 10));
  }
  return (d) => d < today || out.has(d);
}

export function calcTotal({ rate, checkIn, checkOut, services = [] }) {
  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  if (nights <= 0) return { nights: 0, room: 0, services: 0, tax: 0, total: 0 };
  const room = nights * rate;
  const svc = services.reduce((s, x) => s + (x.perNight ? x.price * nights : x.price), 0);
  const tax = Math.round((room + svc) * TAX_RATE * 100) / 100;
  return { nights, room, services: svc, tax, total: room + svc + tax };
}

// Status derived from bookings so every badge in the app agrees.
export function roomStatus(roomId, bookings, today, housekeeping = {}) {
  if (housekeeping[roomId] === 'cleaning') return 'Cleaning';
  const mine = bookings.filter((b) => b.roomId === roomId);
  if (mine.some((b) => b.status === 'checked-in')) return 'Occupied';
  if (mine.some((b) => b.status === 'confirmed' && b.checkOut > today)) return 'Booked';
  return 'Available';
}
