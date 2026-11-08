import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth, useCart, useToast } from '../store';

export function Checkout() {
  const { cart, clear } = useCart(); const user = useAuth((s) => s.user); const toast = useToast((s) => s.show);
  const qc = useQueryClient(); const nav = useNavigate(); const [err, setErr] = useState('');
  const m = useMutation({
    mutationFn: async () => {
      const r = await fetch('/api/bookings', { method: 'POST', body: JSON.stringify({
        roomId: cart.room.id, guestEmail: user.email, checkIn: cart.checkIn, checkOut: cart.checkOut, total: cart.totals.total }) });
      if (!r.ok) throw new Error((await r.json()).message); return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bookings'] }); clear(); toast('Booking confirmed!'); nav('/my-bookings'); },
    onError: (e) => { setErr(e.message); toast(e.message, 'error'); },
  });
  if (!cart) return <main className="wrap state"><p>Your booking is empty.</p><Link className="btn" to="/">Browse rooms</Link></main>;
  const t = cart.totals;
  return (<main className="wrap narrow"><h1>Booking summary</h1>
    <p>{cart.room.name} · {cart.room.type}</p><p>{cart.checkIn} → {cart.checkOut} ({t.nights} nights)</p>
    {cart.services.length > 0 && <p>Services: {cart.services.map((s) => s.name).join(', ')}</p>}
    <div className="row"><span>Room</span><span>${t.room.toFixed(2)}</span></div>
    <div className="row"><span>Services</span><span>${t.services.toFixed(2)}</span></div>
    <div className="row"><span>Tax</span><span>${t.tax.toFixed(2)}</span></div>
    <div className="row total"><span>Total</span><span>${t.total.toFixed(2)}</span></div>
    {err && <p role="alert" className="err">{err}</p>}
    <button disabled={m.isPending} onClick={() => { setErr(''); m.mutate(); }}>{m.isPending ? 'Confirming…' : 'Confirm booking'}</button></main>);
}

export function MyBookings() {
  const user = useAuth((s) => s.user); const qc = useQueryClient(); const toast = useToast((s) => s.show);
  const q = useQuery({ queryKey: ['bookings'], queryFn: () => fetch('/api/bookings').then((r) => { if (!r.ok) throw new Error('fail'); return r.json(); }) });
  const cancel = useMutation({
    mutationFn: (id) => fetch(`/api/bookings/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'cancelled' }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bookings'] }); toast('Booking cancelled'); } });
  const mine = (q.data || []).filter((b) => b.guestEmail === user.email);
  return (<main className="wrap"><h1>My bookings</h1>
    {q.isLoading && <div className="card skel" aria-busy="true" />}
    {q.isError && <div role="alert" className="state"><p>Couldn't load bookings.</p><button onClick={() => q.refetch()}>Retry</button></div>}
    {q.data && !mine.length && <div className="state"><p>No bookings yet.</p><Link className="btn" to="/">Find a room</Link></div>}
    {mine.map((b) => (<article key={b.id} className="card" style={{ marginBottom: 12 }}>
      <h2>Room #{b.roomId} <span className={`badge ${b.status === 'confirmed' ? 'booked' : b.status === 'checked-in' ? 'occupied' : 'cleaning'}`}>{b.status}</span></h2>
      <p>{b.checkIn} → {b.checkOut}</p>
      {b.status === 'confirmed' && <button disabled={cancel.isPending} onClick={() => cancel.mutate(b.id)}>Cancel booking</button>}</article>))}</main>);
}
