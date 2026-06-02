import client from './client';
import type {
  Account,
  CreateAccountRequest,
  TransactionRequest,
  TransferRequest,
  Transaction,
} from '@/lib/types';

export const accountsApi = {
  create: async (data: CreateAccountRequest): Promise<Account> => {
    const res = await client.post<Account>('/accounts', data);
    return res.data;
  },

  getById: async (id: string): Promise<Account> => {
    const res = await client.get<Account>(`/accounts/${id}`);
    return res.data;
  },

  getByUser: async (userId: string): Promise<Account[]> => {
    const res = await client.get<Account[]>(`/accounts/user/${userId}`);
    return res.data;
  },

  deposit: async (id: string, data: TransactionRequest): Promise<Transaction> => {
    const res = await client.post<Transaction>(`/accounts/${id}/deposit`, data);
    return res.data;
  },

  withdraw: async (id: string, data: TransactionRequest): Promise<Transaction> => {
    const res = await client.post<Transaction>(`/accounts/${id}/withdraw`, data);
    return res.data;
  },

  transfer: async (id: string, data: TransferRequest): Promise<Transaction[]> => {
    const res = await client.post<Transaction[]>(`/accounts/${id}/transfer`, data);
    return res.data;
  },
};
