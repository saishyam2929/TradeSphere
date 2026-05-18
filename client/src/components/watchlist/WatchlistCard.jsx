import { Link } from 'react-router-dom';
import { Star, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency, formatPercent } from '../../utils/format';
import Badge from '../ui/Badge';
import api from '../../services/api';

export default function WatchlistCard({ item, onRemove }) {
  const stock = item.stock;
  const change = stock?.dailyChange || 0;
  const isPositive = change >= 0;

  const handleRemove = async () => {
    try {
      await api.delete(`/watchlist/${item.id}`);
      toast.success('Removed from watchlist');
      onRemove?.();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <Link to={`/stocks/${item.symbol}`} className="flex-1">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="font-bold text-gray-900 dark:text-white">{item.symbol}</span>
          <Badge variant={isPositive ? 'success' : 'danger'}>
            {formatPercent(change)}
          </Badge>
        </div>
        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
          {formatCurrency(stock?.currentPrice)}
        </p>
      </Link>
      <button
        onClick={handleRemove}
        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
