import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { roomStatus, isRoomAvailable } from '../lib/booking';

const get = (u) => fetch(u).then((r) => { if (!r.ok) throw new Error('Request failed'); return r.json(); });
const PAGE = 6;
const today = new Date().toISOString().slice(0, 10);

export default function Search() {
  const [sp, setSp] = useSearchParams();
  const q = { type: sp.get('type') || '', max: +(sp.get('max') || 300), guests: +(sp.get('guests') || 1),
    in: sp.get('in') || '', out: sp.get('out') || '', page: +(sp.get('page') || 1) };
  const set = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); if (k !== 'page') n.delete('page'); setSp(n); };
  const rooms = useQuery({ queryKey: ['rooms'], queryFn: () => get('/api/rooms') });
  const bookings = useQuery({ queryKey: ['bookings'], queryFn: () => get('/api/bookings') });
  const dateErr = q.in && q.out && q.out <= q.in ? 'Check-out must be after check-in' : '';

  const filtered = (rooms.data || []).filter((r) =>
    (!q.type || r.type === q.type) && r.rate <= q.max && r.capacity >= q.guests &&
    (!q.in || !q.out || dateErr || isRoomAvailable(r.id, q.in, q.out, bookings.data || [])));
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const shown = filtered.slice((q.page - 1) * PAGE, q.page * PAGE);

  return (<main className="wrap"><h1>Find your room</h1>
    <form className="filters" onSubmit={(e) => e.preventDefault()} aria-label="Room filters">
      <label>Check-in<input type="date" min={today} value={q.in} onChange={(e) => set('in', e.target.value)} /></label>
      <label>Check-out<input type="date" min={q.in || today} value={q.out} onChange={(e) => set('out', e.target.value)} /></label>
      <label>Type<select value={q.type} onChange={(e) => set('type', e.target.value)}>
        <option value="">All</option>{['Single', 'Double', 'Deluxe', 'Suite'].map((t) => <option key={t}>{t}</option>)}</select></label>
      <label>Guests<input type="number" min="1" max="4" value={q.guests} onChange={(e) => set('guests', e.target.value)} /></label>
      <label>Max price: ${q.max}<input type="range" min="60" max="300" step="10" value={q.max} onChange={(e) => set('max', e.target.value)} /></label>
    </form>
    {dateErr && <p role="alert" className="err">{dateErr}</p>}

    {rooms.isLoading && <div className="grid" aria-busy="true">{Array.from({ length: PAGE }, (_, i) => <div key={i} className="card skel" />)}</div>}
    {rooms.isError && <div role="alert" className="state"><p>Couldn't load rooms.</p><button onClick={() => rooms.refetch()}>Retry</button></div>}
    {rooms.data && !shown.length && <div className="state"><p>No rooms match your filters.</p><button onClick={() => setSp({})}>Clear filters</button></div>}

    <div className="grid">{shown.map((r) => { const s = roomStatus(r.id, bookings.data || [], today); return (
      <article key={r.id} className="card">
        <div className="img" style={{ background: `linear-gradient(135deg,hsl(${r.hue} 60% 55%),hsl(${r.hue + 40} 60% 35%))` }} role="img" aria-label={`${r.type} room`} />
        <h2>{r.name} <span className={`badge ${s.toLowerCase()}`}>{s}</span></h2>
        <p>{r.type} · up to {r.capacity} guests</p>
        <p><strong>${r.rate}</strong> / night</p>
        <Link className="btn" to={`/rooms/${r.id}`}>View details</Link>
      </article>); })}</div>

    {filtered.length > PAGE && <nav className="pager" aria-label="Pagination">
      <button disabled={q.page <= 1} onClick={() => set('page', q.page - 1)}>Previous</button>
      <span>Page {q.page} of {pages}</span>
      <button disabled={q.page >= pages} onClick={() => set('page', q.page + 1)}>Next</button></nav>}
  </main>);
}
