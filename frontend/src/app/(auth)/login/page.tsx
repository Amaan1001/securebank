'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api/auth';
import { useUserContext } from '@/context/UserContext';

export default function LoginPage() {
  const { setUser } = useUserContext();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login({ email: form.email, password: form.password });
      setUser({
        userId: res.userId,
        fullName: res.fullName,
        email: res.email,
        token: res.token,
      });
      router.push('/dashboard');
    } catch (err: any) {
      // 1. Check if the backend sent a specific API error message body
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } 
      // 2. If the body is empty but it's a 401 status, show a clean message
      else if (err.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } 
      // 3. Fallback to standard messages for other errors (e.g., network down)
      else {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Sign in to your account</h2>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="label">Email address</label>
          <input
            type="email" className="input"
            placeholder="you@example.com"
            value={form.email} onChange={set('email')} required
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password" className="input"
            placeholder="••••••••"
            value={form.password} onChange={set('password')} required
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="text-sm text-gray-500 text-center mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-brand-600 font-medium hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
