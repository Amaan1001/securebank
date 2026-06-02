import type { Transaction } from '@/lib/types';
import { Badge } from '@/components/ui';
import clsx from 'clsx';

function fmt(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function txVariant(type: Transaction['type']) {
  if (type === 'DEPOSIT' || type === 'TRANSFER_IN') return 'green';
  return 'red';
}

function txSign(type: Transaction['type']) {
  return type === 'DEPOSIT' || type === 'TRANSFER_IN' ? '+' : '-';
}

function txLabel(type: Transaction['type']) {
  const map: Record<Transaction['type'], string> = {
    DEPOSIT: 'Deposit',
    WITHDRAWAL: 'Withdrawal',
    TRANSFER_IN: 'Transfer In',
    TRANSFER_OUT: 'Transfer Out',
  };
  return map[type];
}

export default function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  if (!transactions.length) {
    return <p className="text-sm text-gray-400 py-4">No transactions yet.</p>;
  }

  return (
    <div className="divide-y divide-gray-50">
      {transactions.map(tx => (
        <div key={tx.id} className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className={clsx(
              'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold',
              (tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN')
                ? 'bg-green-50 text-green-600'
                : 'bg-red-50 text-red-600'
            )}>
              {txSign(tx.type)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{txLabel(tx.type)}</p>
              <p className="text-xs text-gray-400">
                {tx.description || tx.referenceNumber}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={clsx(
              'text-sm font-semibold',
              (tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN') ? 'text-green-600' : 'text-red-600'
            )}>
              {txSign(tx.type)}{fmt(tx.amount)}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(tx.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
