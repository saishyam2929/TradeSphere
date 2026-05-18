import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatPercent } from '../../utils/format';
import Badge from '../ui/Badge';

export default function StockCard({ stock, livePrice }) {
  const price = livePrice ?? stock.currentPrice;
  const change = stock.dailyChange || 0;
  const isPositive = change >= 0;

  return (
    <Link
      to={`/stocks/${stock.symbol}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-600"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">{stock.symbol}</h3>
          <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">
            {stock.companyName}
          </p>
        </div>
        <Badge variant={isPositive ? 'success' : 'danger'}>
          {isPositive ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
          {formatPercent(change)}
        </Badge>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {formatCurrency(price)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Vol: {((stock.volume || 0) / 1000000).toFixed(1)}M
        </p>
      </div>
    </Link>
  );
}
