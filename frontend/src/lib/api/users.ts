import client from './client';
import type { User, CreateUserRequest } from '@/lib/types';

export const usersApi = {
  create: async (data: CreateUserRequest): Promise<User> => {
    const res = await client.post<User>('/users', data);
    return res.data;
  },

  getById: async (id: string): Promise<User> => {
    const res = await client.get<User>(`/users/${id}`);
    return res.data;
  },

  getByEmail: async (email: string): Promise<User> => {
    const res = await client.get<User>(`/users/email/${email}`);
    return res.data;
  },
};
