import client from './client';
import type { Page, Transaction } from '@/lib/types';

export const transactionsApi = {
  getByAccount: async (
    accountId: string,
    page = 0,
    size = 10
  ): Promise<Page<Transaction>> => {
    const res = await client.get<Page<Transaction>>(
      `/accounts/${accountId}/transactions`,
      { params: { page, size, sort: 'createdAt,desc' } }
    );
    return res.data;
  },
};
