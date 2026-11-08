import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { calcTotal, isRoomAvailable } from '../lib/booking';
import { SERVICES, useCart, useToast } from '../store';

const get = (u) => fetch(u).then((r) => { if (!r.ok) throw new Error('fail'); return r.json(); });
const today = new Date().toISOString().slice(0, 10);
const shade = (hue, i) => `linear-gradient(${135 + i * 30}deg,hsl(${hue + i * 25} 60% ${55 - i * 4}%),hsl(${hue + 40 + i * 25} 60% 35%))`;

function Gallery({ hue }) {
  const [i, setI] = useState(0); const [open, setOpen] = useState(false); const n = 4;
  useEffect(() => {
    if (!open) return;
    const k = (e) => { if (e.key === 'Escape') setOpen(false); if (e.key === 'ArrowRight') setI((x) => (x + 1) % n); if (e.key === 'ArrowLeft') setI((x) => (x + n - 1) % n); };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [open]);
  return (<div>
    <button className="hero" style={{ background: shade(hue, i) }} onClick={() => setOpen(true)} aria-label={`Open photo ${i + 1} of ${n} full size`} />
    <div className="thumbs">{Array.from({ length: n }, (_, k) =>
      <button key={k} className={k === i ? 'on' : ''} style={{ background: shade(hue, k) }} onClick={() => setI(k)} aria-label={`Photo ${k + 1}`} aria-pressed={k === i} />)}</div>
    {open && <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer">
      <button onClick={() => setI((i + n - 1) % n)} aria-label="Previous photo">‹</button>
      <div className="big" style={{ background: shade(hue, i) }} />
      <button onClick={() => setI((i + 1) % n)} aria-label="Next photo">›</button>
      <button autoFocus onClick={() => setOpen(false)} aria-label="Close viewer" style={{ position: 'absolute', top: 16, right: 16 }}>✕</button></div>}
  </div>);
}

export default function RoomDetails() {
  const { id } = useParams(); const nav = useNavigate(); const setCart = useCart((s) => s.setCart); const toast = useToast((s) => s.show);
  const rooms = useQuery({ queryKey: ['rooms'], queryFn: () => get('/api/rooms') });
  const bookings = useQuery({ queryKey: ['bookings'], queryFn: () => get('/api/bookings') });
  const [d, setD] = useState({ checkIn: '', checkOut: '' }); const [svc, setSvc] = useState([]);
  if (rooms.isLoading) return <main className="wrap" aria-busy="true"><div className="card skel" /></main>;
  if (rooms.isError) return <main className="wrap state" role="alert"><p>Couldn't load room.</p><button onClick={() => rooms.refetch()}>Retry</button></main>;
  const room = rooms.data.find((r) => r.id === +id);
  if (!room) return <main className="wrap state"><p>Room not found.</p></main>;

  const services = SERVICES.filter((s) => svc.includes(s.id));
  const t = calcTotal({ rate: room.rate, ...d, services });
  const bad = d.checkIn && d.checkOut && d.checkOut <= d.checkIn ? 'Check-out must be after check-in'
    : t.nights > 0 && !isRoomAvailable(room.id, d.checkIn, d.checkOut, bookings.data || []) ? 'Room is already booked for these dates' : '';
  const go = () => { setCart({ room, ...d, services, totals: t }); nav('/checkout'); };

  return (<main className="wrap"><h1>{room.name} · {room.type}</h1>
    <div className="split"><Gallery hue={room.hue} />
      <section className="panel" aria-label="Book this room">
        <p><strong>${room.rate}</strong> / night · up to {room.capacity} guests</p>
        <label htmlFor="ci">Check-in</label><input id="ci" type="date" min={today} value={d.checkIn} onChange={(e) => setD({ ...d, checkIn: e.target.value })} />
        <label htmlFor="co">Check-out</label><input id="co" type="date" min={d.checkIn || today} value={d.checkOut} onChange={(e) => setD({ ...d, checkOut: e.target.value })} />
        {bad && <p role="alert" className="err">{bad}</p>}
        <fieldset><legend>Extra services</legend>{SERVICES.map((s) =>
          <label key={s.id} className="check"><input type="checkbox" checked={svc.includes(s.id)}
            onChange={() => setSvc(svc.includes(s.id) ? svc.filter((x) => x !== s.id) : [...svc, s.id])} />
            {s.name} (${s.price}{s.perNight ? '/night' : ''})</label>)}</fieldset>
        <div aria-live="polite">
          <div className="row"><span>{t.nights} night(s) × ${room.rate}</span><span>${t.room.toFixed(2)}</span></div>
          <div className="row"><span>Services</span><span>${t.services.toFixed(2)}</span></div>
          <div className="row"><span>Tax (12%)</span><span>${t.tax.toFixed(2)}</span></div>
          <div className="row total"><span>Total</span><span>${t.total.toFixed(2)}</span></div></div>
        <button disabled={!t.nights || !!bad} onClick={go}>Continue to checkout</button>
      </section></div></main>);
}
