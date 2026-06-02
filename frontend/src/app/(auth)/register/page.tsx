'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api/auth';
import { accountsApi } from '@/lib/api/accounts';
import { useUserContext } from '@/context/UserContext';

export default function RegisterPage() {
  const { setUser } = useUserContext();
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '', phone: '',
  });
  const [accountType, setAccountType] = useState<'CHECKING' | 'SAVINGS'>('CHECKING');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      // 1. Register user → get JWT back
      const res = await authApi.register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
      });

      // 2. Store auth state
      setUser({
        userId: res.userId,
        fullName: res.fullName,
        email: res.email,
        token: res.token,
      });

      // 3. Create first account (token is now in sessionStorage, client attaches it)
      await accountsApi.create({ userId: res.userId, accountType });

      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Create your account</h2>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="label">Full name</label>
          <input className="input" placeholder="Jane Doe" value={form.fullName} onChange={set('fullName')} required />
        </div>
        <div>
          <label className="label">Email address</label>
          <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" className="input" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} required />
        </div>
        <div>
          <label className="label">Confirm password</label>
          <input type="password" className="input" placeholder="••••••••" value={form.confirmPassword} onChange={set('confirmPassword')} required />
        </div>
        <div>
          <label className="label">Phone (optional)</label>
          <input className="input" placeholder="+1234567890" value={form.phone} onChange={set('phone')} />
        </div>
        <div>
          <label className="label">Account type</label>
          <select className="input" value={accountType} onChange={e => setAccountType(e.target.value as 'CHECKING' | 'SAVINGS')}>
            <option value="CHECKING">Checking</option>
            <option value="SAVINGS">Savings</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-gray-500 text-center mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
