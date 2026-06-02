'use client';

import { useState } from 'react';
import { useAccount, useTransactions } from '@/lib/hooks';
import { accountsApi } from '@/lib/api/accounts';
import TransactionTable from '@/components/accounts/TransactionTable';
import { Spinner, ErrorMsg, Card, Badge } from '@/components/ui';
import { mutate } from 'swr';

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export default function AccountDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { data: account, error: accErr, isLoading } = useAccount(id);
  const [page, setPage]       = useState(0);
  const { data: txPage, error: txErr } = useTransactions(id, page);

  const [amount, setAmount]   = useState('');
  const [desc, setDesc]       = useState('');
  const [mode, setMode]       = useState<'deposit' | 'withdraw'>('deposit');
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState('');
  const [success, setSuccess] = useState('');

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setSuccess('');
    setLoading(true);
    try {
      const payload = { amount: parseFloat(amount), description: desc || undefined };
      if (mode === 'deposit') await accountsApi.deposit(id, payload);
      else await accountsApi.withdraw(id, payload);
      setSuccess(`${mode === 'deposit' ? 'Deposit' : 'Withdrawal'} successful!`);
      setAmount(''); setDesc('');
      mutate(['account', id]);
      mutate(['transactions', id, page]);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <Spinner />;
  if (accErr) return <ErrorMsg message="Account not found." />;
  if (!account) return null;

  const statusVariant = account.status === 'ACTIVE' ? 'green' : account.status === 'FROZEN' ? 'yellow' : 'red';

  return (
    <div className="space-y-6">
      {/* Account header */}
      <Card className="bg-gradient-to-br from-brand-600 to-brand-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-brand-100 text-xs uppercase tracking-wider">{account.accountType}</p>
            <p className="text-brand-100 text-xs mt-0.5 font-mono">{account.accountNumber}</p>
            <p className="text-4xl font-bold mt-4">{fmt(account.balance)}</p>
            <p className="text-brand-100 text-sm mt-1">{account.currency} · Available balance</p>
          </div>
          <Badge label={account.status} variant={statusVariant} />
        </div>
      </Card>

      {/* Deposit / Withdraw */}
      {account.status === 'ACTIVE' && (
        <Card className="max-w-md">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Make a Transaction</h4>
          <div className="flex gap-2 mb-4">
            {(['deposit', 'withdraw'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={mode === m ? 'btn-primary flex-1 capitalize' : 'btn-secondary flex-1 capitalize'}
              >
                {m}
              </button>
            ))}
          </div>
          <form onSubmit={handleAction} className="space-y-3">
            <div>
              <label className="label">Amount (USD)</label>
              <input
                type="number" step="0.01" min="0.01"
                className="input" placeholder="0.00"
                value={amount} onChange={e => setAmount(e.target.value)} required
              />
            </div>
            <div>
              <label className="label">Description (optional)</label>
              <input className="input" placeholder="e.g. Paycheck" value={desc} onChange={e => setDesc(e.target.value)} />
            </div>
            {err     && <ErrorMsg message={err} />}
            {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">{success}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full capitalize">
              {loading ? 'Processing...' : mode}
            </button>
          </form>
        </Card>
      )}

      {/* Transaction history */}
      <Card>
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Transaction History</h4>
        {txErr ? (
          <ErrorMsg message="Failed to load transactions." />
        ) : !txPage ? (
          <Spinner />
        ) : txPage.content.length === 0 ? (
          <p className="text-gray-400 text-sm">No transactions yet.</p>
        ) : (
          <TransactionTable data={txPage} page={page} onPage={setPage} />
        )}
      </Card>
    </div>
  );
}
