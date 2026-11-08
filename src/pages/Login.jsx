import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { loginSchema } from '../lib/schemas';
import { useAuth } from '../store';

const home = { guest: '/', receptionist: '/reception', admin: '/admin' };
export default function Login() {
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } =
    useForm({ resolver: zodResolver(loginSchema) });
  const login = useAuth((s) => s.login); const nav = useNavigate(); const [err, setErr] = useState('');
  const onSubmit = async (v) => {
    setErr('');
    const r = await fetch('/api/login', { method: 'POST', body: JSON.stringify(v) });
    const d = await r.json();
    if (!r.ok) return setErr(d.message);
    login(d.token, d.user); nav(home[d.user.role]);
  };
  const demo = (e) => { setValue('email', e); setValue('password', 'demo123'); };
  return (<main className="wrap narrow"><h1>Log in</h1>
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" aria-invalid={!!errors.email} {...register('email')} />
      {errors.email && <p role="alert" className="err">{errors.email.message}</p>}
      <label htmlFor="pw">Password</label>
      <input id="pw" type="password" aria-invalid={!!errors.password} {...register('password')} />
      {errors.password && <p role="alert" className="err">{errors.password.message}</p>}
      {err && <p role="alert" className="err">{err}</p>}
      <button disabled={isSubmitting}>{isSubmitting ? 'Signing in…' : 'Log in'}</button>
    </form>
    <p>Demo accounts:{' '}
      {['guest@demo.com', 'reception@demo.com', 'admin@demo.com'].map((e) =>
        <button key={e} type="button" className="chip" onClick={() => demo(e)}>{e.split('@')[0]}</button>)}
    </p></main>);
}
