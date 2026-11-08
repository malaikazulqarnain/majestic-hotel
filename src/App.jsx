import { Routes, Route, Navigate, Link, Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth, useTheme } from './store';
import Search from './pages/Search';
import Login from './pages/Login';
import { HOTEL_NAME } from './config';
import RoomDetails from './pages/RoomDetails';
import { Checkout, MyBookings } from './pages/Booking';
import { useToast } from './store';

const Stub = ({ title }) => <main className="wrap"><h1>{title}</h1><p>Coming in the next step.</p></main>;
const home = { guest: '/my-bookings', receptionist: '/reception', admin: '/admin' };

function Protected({ roles }) {
  const user = useAuth((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={home[user.role]} replace />;
  return <Outlet />;
}

function Layout() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const nav = useNavigate();
  const toast = useToast();
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; }, [dark]);
  return (<>
    <header className="bar"><nav aria-label="Main">
      <Link to="/" className="brand">{HOTEL_NAME}</Link>
      <Link to="/">Rooms</Link>
      {user?.role === 'guest' && <Link to="/my-bookings">My Bookings</Link>}
      {user?.role === 'receptionist' && <Link to="/reception">Reception</Link>}
      {user?.role === 'admin' && <Link to="/admin">Analytics</Link>}
    </nav>
    <div>
      <button onClick={toggle} aria-pressed={dark}>{dark ? 'Light' : 'Dark'} mode</button>{' '}
      {user ? <button onClick={() => { logout(); nav('/'); }}>Log out ({user.role})</button>
            : <Link to="/login">Log in</Link>}
    </div></header>
    <Outlet />
    {toast.msg && <div role="status" className={`toast ${toast.kind}`}>{toast.msg}</div>}
  </>);
}

export default function App() {
  return (<Routes><Route element={<Layout />}>
    <Route path="/" element={<Search />} />
    <Route path="/login" element={<Login />} />
    <Route path="/rooms/:id" element={<RoomDetails />} />
    <Route element={<Protected roles={['guest']} />}>
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/my-bookings" element={<MyBookings />} />
    </Route>
    <Route element={<Protected roles={['receptionist', 'admin']} />}>
      <Route path="/reception" element={<Stub title="Receptionist Panel" />} />
    </Route>
    <Route element={<Protected roles={['admin']} />}>
      <Route path="/admin" element={<Stub title="Admin Dashboard" />} />
    </Route>
    <Route path="*" element={<Stub title="Page not found" />} />
  </Route></Routes>);
}
