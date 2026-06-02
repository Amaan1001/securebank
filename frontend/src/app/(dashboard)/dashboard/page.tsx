'use client';

import { useUserContext } from '@/context/UserContext';
import { useAccounts, useTransactions } from '@/lib/hooks';
import BalanceCard from '@/components/dashboard/BalanceCard';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import { Spinner, ErrorMsg, Card } from '@/components/ui';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useUserContext();
  const { data: accounts, error: accErr, isLoading: accLoading } = useAccounts(user?.userId ?? null);

  // Grab recent transactions for the first account
  const firstAccountId = accounts?.[0]?.id ?? null;
  const { data: txPage } = useTransactions(firstAccountId, 0);

  if (accLoading) return <Spinner />;
  if (accErr) return <ErrorMsg message="Failed to load accounts." />;

  const totalBalance = accounts?.reduce((sum, a) => sum + a.balance, 0) ?? 0;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.fullName?.split(' ')[0]} 👋
        </h3>
        <p className="text-gray-500 mt-1 text-sm">Here&apos;s your financial overview.</p>
      </div>

      {/* Total balance summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Balance</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalBalance)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Across {accounts?.length ?? 0} account(s)</p>
        </Card>
        <Card className="md:col-span-1 flex flex-col justify-between">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Quick Actions</p>
          <div className="flex flex-col gap-2 mt-3">
            <Link href="/transfer" className="btn-primary text-center text-sm">Transfer Funds</Link>
            <Link href="/accounts" className="btn-secondary text-center text-sm">View All Accounts</Link>
          </div>
        </Card>
        <Card className="md:col-span-1 flex flex-col justify-between">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Open New Account</p>
          <p className="text-sm text-gray-500 mt-2">Add a checking or savings account to your profile.</p>
          <Link href="/accounts" className="btn-secondary text-center text-sm mt-3 flex items-center justify-center gap-2">
            <Plus size={14} /> New Account
          </Link>
        </Card>
      </div>

      {/* Account cards */}
      {accounts && accounts.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Your Accounts</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map(a => <BalanceCard key={a.id} account={a} />)}
          </div>
        </div>
      )}

      {/* Recent transactions */}
      {firstAccountId && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-900">Recent Transactions</h4>
            <Link href={`/accounts/${firstAccountId}`} className="text-xs text-brand-600 hover:underline">
              View all
            </Link>
          </div>
          <RecentTransactions transactions={txPage?.content?.slice(0, 5) ?? []} />
        </Card>
      )}
    </div>
  );
}
