import type { Transaction, Page } from '@/lib/types';
import clsx from 'clsx';

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

const typeLabel: Record<Transaction['type'], string> = {
  DEPOSIT: 'Deposit',
  WITHDRAWAL: 'Withdrawal',
  TRANSFER_IN: 'Transfer In',
  TRANSFER_OUT: 'Transfer Out',
};

const statusVariant: Record<Transaction['status'], string> = {
  COMPLETED: 'text-green-600 bg-green-50',
  PENDING:   'text-yellow-600 bg-yellow-50',
  FAILED:    'text-red-600 bg-red-50',
  REVERSED:  'text-gray-600 bg-gray-50',
};

interface Props {
  data: Page<Transaction>;
  page: number;
  onPage: (p: number) => void;
}

export default function TransactionTable({ data, page, onPage }: Props) {
  const isCredit = (t: Transaction['type']) => t === 'DEPOSIT' || t === 'TRANSFER_IN';

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-100">
              <th className="pb-3 pr-4">Type</th>
              <th className="pb-3 pr-4">Reference</th>
              <th className="pb-3 pr-4">Description</th>
              <th className="pb-3 pr-4 text-right">Amount</th>
              <th className="pb-3 pr-4 text-right">Balance After</th>
              <th className="pb-3 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.content.map(tx => (
              <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 pr-4">
                  <span className={clsx(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    statusVariant[tx.status]
                  )}>
                    {typeLabel[tx.type]}
                  </span>
                </td>
                <td className="py-3 pr-4 text-gray-400 font-mono text-xs">{tx.referenceNumber}</td>
                <td className="py-3 pr-4 text-gray-600">{tx.description || '—'}</td>
                <td className={clsx(
                  'py-3 pr-4 text-right font-semibold',
                  isCredit(tx.type) ? 'text-green-600' : 'text-red-600'
                )}>
                  {isCredit(tx.type) ? '+' : '-'}{fmt(tx.amount)}
                </td>
                <td className="py-3 pr-4 text-right text-gray-600">{fmt(tx.balanceAfter)}</td>
                <td className="py-3 text-right text-gray-400">
                  {new Date(tx.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Page {page + 1} of {data.totalPages} · {data.totalElements} transactions
          </p>
          <div className="flex gap-2">
            <button
              disabled={data.first}
              onClick={() => onPage(page - 1)}
              className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={data.last}
              onClick={() => onPage(page + 1)}
              className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
