'use client';

import { useState } from 'react';
import { useUserContext } from '@/context/UserContext';
import { useAccounts } from '@/lib/hooks';
import { accountsApi } from '@/lib/api/accounts';
import { Spinner, ErrorMsg, Card } from '@/components/ui';
import { mutate } from 'swr';
import { CheckCircle } from 'lucide-react';

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export default function TransferPage() {
  const { user } = useUserContext();
  const { data: accounts, isLoading } = useAccounts(user?.userId ?? null);

  const [fromId, setFromId]           = useState('');
  const [toAccountNumber, setToAccountNumber] = useState('');
  const [amount, setAmount]           = useState('');
  const [desc, setDesc]               = useState('');
  const [loading, setLoading]         = useState(false);
  const [err, setErr]                 = useState('');
  const [done, setDone]               = useState(false);

  const selectedAccount = accounts?.find(a => a.id === fromId);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setDone(false);
    setLoading(true);
    try {
      await accountsApi.transfer(fromId, {
        toAccountNumber: toAccountNumber.trim(),
        amount: parseFloat(amount),
        description: desc || undefined,
      });
      setDone(true);
      setAmount(''); setDesc(''); setToAccountNumber('');
      mutate(['accounts', user?.userId]);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="max-w-lg space-y-6">
      <Card>
        <h3 className="text-sm font-semibold text-gray-900 mb-6">Transfer Funds</h3>

        {done && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-4">
            <CheckCircle size={16} />
            Transfer completed successfully!
          </div>
        )}

        <form onSubmit={handleTransfer} className="space-y-4">
          {/* From account */}
          <div>
            <label className="label">From account</label>
            <select
              className="input"
              value={fromId}
              onChange={e => setFromId(e.target.value)}
              required
            >
              <option value="">Select account...</option>
              {accounts?.filter(a => a.status === 'ACTIVE').map(a => (
                <option key={a.id} value={a.id}>
                  {a.accountType} · {a.accountNumber} · {fmt(a.balance)}
                </option>
              ))}
            </select>
            {selectedAccount && (
              <p className="text-xs text-gray-400 mt-1">
                Available: {fmt(selectedAccount.balance)}
              </p>
            )}
          </div>

          {/* To account number */}
          <div>
            <label className="label">To account number</label>
            <input
              className="input font-mono"
              placeholder="SB0000000000"
              value={toAccountNumber}
              onChange={e => setToAccountNumber(e.target.value)}
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="label">Amount (USD)</label>
            <input
              type="number" step="0.01" min="0.01"
              className="input" placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="label">Description (optional)</label>
            <input
              className="input"
              placeholder="e.g. Rent payment"
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
          </div>

          {err && <ErrorMsg message={err} />}

          <button
            type="submit"
            disabled={loading || !fromId}
            className="btn-primary w-full"
          >
            {loading ? 'Sending...' : 'Send Transfer'}
          </button>
        </form>
      </Card>

      {/* Info box */}
      <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 text-sm text-brand-700">
        <p className="font-medium mb-1">How transfers work</p>
        <ul className="space-y-1 text-xs text-brand-600 list-disc list-inside">
          <li>Transfers are instant and irreversible</li>
          <li>You need the recipient&apos;s account number (starts with SB)</li>
          <li>Both accounts must be active</li>
          <li>Sufficient balance required</li>
        </ul>
      </div>
    </div>
  );
}
