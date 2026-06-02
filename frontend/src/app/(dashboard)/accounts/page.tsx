'use client';

import { useState } from 'react';
import { useUserContext } from '@/context/UserContext';
import { useAccounts } from '@/lib/hooks';
import { accountsApi } from '@/lib/api/accounts';
import BalanceCard from '@/components/dashboard/BalanceCard';
import { Spinner, ErrorMsg, Card } from '@/components/ui';
import { mutate } from 'swr';

export default function AccountsPage() {
  const { user } = useUserContext();
  
  // 1. Updated hook to pass user.userId
  const { data: accounts, error, isLoading } = useAccounts(user?.userId ?? null);

  const [type, setType]       = useState<'CHECKING' | 'SAVINGS'>('CHECKING');
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState('');

  const handleCreate = async () => {
    if (!user) return;
    setCreateErr('');
    setCreating(true);
    try {
      // 2. Updated API payload to send user.userId
      await accountsApi.create({ userId: user.userId, accountType: type });
      mutate(['accounts', user.userId]);
    } catch (e: unknown) {
      setCreateErr(e instanceof Error ? e.message : 'Failed to create account');
    } finally {
      setCreating(false);
    }
  };

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMsg message="Failed to load accounts." />;

  return (
    <div className="space-y-8">
      {/* Account list */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-4">All Accounts</h3>
        {accounts?.length === 0 ? (
          <p className="text-gray-400 text-sm">No accounts yet. Open one below.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts?.map(a => <BalanceCard key={a.id} account={a} />)}
          </div>
        )}
      </div>

      {/* Open new account */}
      <Card className="max-w-sm">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Open New Account</h4>
        <div className="space-y-3">
          <div>
            <label className="label">Account type</label>
            <select
              className="input"
              value={type}
              onChange={e => setType(e.target.value as 'CHECKING' | 'SAVINGS')}
            >
              <option value="CHECKING">Checking</option>
              <option value="SAVINGS">Savings</option>
            </select>
          </div>
          {createErr && <ErrorMsg message={createErr} />}
          <button onClick={handleCreate} disabled={creating} className="btn-primary w-full">
            {creating ? 'Opening...' : 'Open Account'}
          </button>
        </div>
      </Card>
    </div>
  );
}