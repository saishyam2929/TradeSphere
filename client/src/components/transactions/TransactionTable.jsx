import Badge from '../ui/Badge';
import { formatCurrency, formatDate } from '../../utils/format';

export default function TransactionTable({ transactions }) {
  if (!transactions?.length) {
    return (
      <div className="py-12 text-center text-gray-500 dark:text-gray-400">
        No transactions yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500 dark:border-slate-700 dark:text-gray-400">
            <th className="pb-3 font-medium">Date</th>
            <th className="pb-3 font-medium">Type</th>
            <th className="pb-3 font-medium">Symbol</th>
            <th className="pb-3 font-medium">Qty</th>
            <th className="pb-3 font-medium">Price</th>
            <th className="pb-3 font-medium">Total</th>
            <th className="pb-3 font-medium">P/L</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-b border-gray-100 dark:border-slate-800">
              <td className="py-3 text-gray-600 dark:text-gray-400">
                {formatDate(tx.createdAt)}
              </td>
              <td className="py-3">
                <Badge variant={tx.type === 'BUY' ? 'info' : 'success'}>
                  {tx.type}
                </Badge>
              </td>
              <td className="py-3 font-semibold">{tx.symbol}</td>
              <td className="py-3">{tx.quantity}</td>
              <td className="py-3">{formatCurrency(tx.price)}</td>
              <td className="py-3 font-medium">{formatCurrency(tx.total)}</td>
              <td
                className={`py-3 font-medium ${
                  tx.profitLoss == null
                    ? 'text-gray-400'
                    : tx.profitLoss >= 0
                    ? 'text-emerald-600'
                    : 'text-red-600'
                }`}
              >
                {tx.profitLoss != null ? formatCurrency(tx.profitLoss) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
