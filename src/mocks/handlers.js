import { http, HttpResponse, delay } from 'msw';
import { rooms, bookings } from './data';
import { isRoomAvailable } from '../lib/booking';
const flaky = async (ok, failRate = 0.15) => {
  await delay(400 + Math.random() * 800);
  return Math.random() < failRate ? HttpResponse.json({ message: 'Server error' }, { status: 500 }) : ok();
};
export const handlers = [
  http.post('/api/login', async ({ request }) => {
    const { email, password } = await request.json();
    await delay(500);
    if (!password || password.length < 6) return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    const role = email.startsWith('admin') ? 'admin' : email.startsWith('reception') ? 'receptionist' : 'guest';
    return HttpResponse.json({ token: btoa(email + ':' + role), user: { email, role } });
  }),
  http.get('/api/rooms', () => flaky(() => HttpResponse.json(rooms))),
  http.get('/api/bookings', () => flaky(() => HttpResponse.json(bookings), 0.05)),
  http.post('/api/bookings', async ({ request }) => {
    const b = await request.json(); await delay(700);
    if (!isRoomAvailable(b.roomId, b.checkIn, b.checkOut, bookings))
      return HttpResponse.json({ message: 'Sorry, this room was just booked for those dates.' }, { status: 409 });
    const nb = { ...b, id: Date.now(), status: 'confirmed' }; bookings.push(nb);
    return HttpResponse.json(nb, { status: 201 });
  }),
  http.patch('/api/bookings/:id', async ({ params, request }) => {
    const { status } = await request.json(); await delay(400);
    const b = bookings.find((x) => x.id === +params.id); if (b) b.status = status;
    return HttpResponse.json(b);
  }),
];
