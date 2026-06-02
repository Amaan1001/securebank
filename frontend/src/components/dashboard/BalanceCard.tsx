import type { Account } from '@/lib/types';
import { Badge } from '@/components/ui';
import Link from 'next/link';

function fmt(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export default function BalanceCard({ account }: { account: Account }) {
  const statusVariant = account.status === 'ACTIVE' ? 'green' : account.status === 'FROZEN' ? 'yellow' : 'red';

  return (
    <Link href={`/accounts/${account.id}`}>
      <div className="card hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-br from-brand-600 to-brand-900 text-white border-0">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-brand-100 text-xs font-medium uppercase tracking-wider">
              {account.accountType}
            </p>
            <p className="text-brand-100 text-xs mt-0.5">{account.accountNumber}</p>
          </div>
          <Badge label={account.status} variant={statusVariant} />
        </div>
        <p className="text-3xl font-bold">{fmt(account.balance, account.currency)}</p>
        <p className="text-brand-100 text-sm mt-1">{account.currency} · Available balance</p>
      </div>
    </Link>
  );
}
