import axios from 'axios';
import type { AuthResponse } from '@/lib/types';

// Use plain axios here — no token needed for auth endpoints
const authClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

export const authApi = {
  register: async (data: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<AuthResponse> => {
    const res = await authClient.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  login: async (data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const res = await authClient.post<AuthResponse>('/auth/login', data);
    return res.data;
  },
};
