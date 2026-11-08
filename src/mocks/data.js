const types = ['Single', 'Double', 'Deluxe', 'Suite'];
export const rooms = Array.from({ length: 14 }, (_, i) => ({
  id: i + 1, name: `Room ${100 + i + 1}`, type: types[i % 4],
  rate: 60 + (i % 4) * 45 + (i % 3) * 10, capacity: 1 + (i % 4),
  hue: (i * 47) % 360,
}));
export const bookings = [
  { id: 1, roomId: 1, guestEmail: 'guest@demo.com', checkIn: '2026-12-10', checkOut: '2026-12-13', status: 'confirmed' },
  { id: 2, roomId: 2, guestEmail: 'guest@demo.com', checkIn: '2026-11-05', checkOut: '2026-11-09', status: 'checked-in' },
];
