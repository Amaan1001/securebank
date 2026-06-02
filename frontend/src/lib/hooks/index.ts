import useSWR from 'swr';
import { accountsApi } from '@/lib/api/accounts';
import { usersApi } from '@/lib/api/users';
import { transactionsApi } from '@/lib/api/transactions';

export function useUser(id: string | null) {
  return useSWR(
    id ? ['user', id] : null,
    () => usersApi.getById(id!)
  );
}

export function useAccounts(userId: string | null) {
  return useSWR(
    userId ? ['accounts', userId] : null,
    () => accountsApi.getByUser(userId!)
  );
}

export function useAccount(id: string | null) {
  return useSWR(
    id ? ['account', id] : null,
    () => accountsApi.getById(id!)
  );
}

export function useTransactions(accountId: string | null, page = 0) {
  return useSWR(
    accountId ? ['transactions', accountId, page] : null,
    () => transactionsApi.getByAccount(accountId!, page)
  );
}
