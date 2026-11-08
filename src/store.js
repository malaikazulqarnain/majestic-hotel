import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useAuth = create(persist(
  (set) => ({ token: null, user: null,
    login: (token, user) => set({ token, user }), logout: () => set({ token: null, user: null }) }),
  { name: 'hotel-auth' }));
export const useTheme = create(persist(
  (set, get) => ({ dark: false, toggle: () => set({ dark: !get().dark }) }), { name: 'hotel-theme' }));
export const useCart = create(persist(
  (set) => ({ cart: null, setCart: (cart) => set({ cart }), clear: () => set({ cart: null }) }), { name: 'hotel-cart' }));
export const useToast = create((set) => ({ msg: '', kind: 'ok',
  show: (msg, kind = 'ok') => { set({ msg, kind }); setTimeout(() => set({ msg: '' }), 3500); } }));
export const SERVICES = [
  { id: 'breakfast', name: 'Breakfast', price: 15, perNight: true },
  { id: 'pickup', name: 'Airport pickup', price: 30, perNight: false },
  { id: 'spa', name: 'Spa access', price: 50, perNight: false },
];
