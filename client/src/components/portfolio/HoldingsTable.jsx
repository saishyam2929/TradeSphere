import { Link } from 'react-router-dom';
import { formatCurrency, formatPercent } from '../../utils/format';

export default function HoldingsTable({ holdings }) {
  if (!holdings?.length) {
    return (
      <div className="py-12 text-center text-gray-500 dark:text-gray-400">
        No holdings yet. Start trading in the Market!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500 dark:border-slate-700 dark:text-gray-400">
            <th className="pb-3 font-medium">Symbol</th>
            <th className="pb-3 font-medium">Qty</th>
            <th className="pb-3 font-medium">Avg Price</th>
            <th className="pb-3 font-medium">Current</th>
            <th className="pb-3 font-medium">Value</th>
            <th className="pb-3 font-medium">P/L</th>
            <th className="pb-3 font-medium">Return</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => (
            <tr
              key={h.id}
              className="border-b border-gray-100 dark:border-slate-800"
            >
              <td className="py-3">
                <Link
                  to={`/stocks/${h.symbol}`}
                  className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  {h.symbol}
                </Link>
              </td>
              <td className="py-3">{h.quantity}</td>
              <td className="py-3">{formatCurrency(h.averageBuyPrice)}</td>
              <td className="py-3">{formatCurrency(h.currentPrice)}</td>
              <td className="py-3 font-medium">{formatCurrency(h.currentValue)}</td>
              <td
                className={`py-3 font-medium ${
                  h.profitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {formatCurrency(h.profitLoss)}
              </td>
              <td
                className={`py-3 ${
                  h.profitLossPercent >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {formatPercent(h.profitLossPercent)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
