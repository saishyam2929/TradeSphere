import { formatCurrency, formatPercent } from '../../utils/format';
import Card from '../ui/Card';
import { Wallet, TrendingUp, PieChart, DollarSign } from 'lucide-react';

const statCards = [
  { key: 'walletBalance', label: 'Cash Balance', icon: Wallet, color: 'text-emerald-500' },
  { key: 'totalCurrentValue', label: 'Holdings Value', icon: PieChart, color: 'text-indigo-500' },
  { key: 'totalPortfolioValue', label: 'Total Portfolio', icon: DollarSign, color: 'text-blue-500' },
  { key: 'totalProfitLoss', label: 'Total P/L', icon: TrendingUp, color: 'text-amber-500' },
];

export default function PortfolioSummary({ summary }) {
  if (!summary) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statCards.map(({ key, label, icon: Icon, color }) => {
        const value = summary[key];
        const isPL = key === 'totalProfitLoss';
        const isPositive = value >= 0;

        return (
          <Card key={key} className="!p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg bg-gray-100 p-2 dark:bg-slate-800 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                <p
                  className={`text-xl font-bold ${
                    isPL
                      ? isPositive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {isPL ? formatCurrency(value) : formatCurrency(value)}
                </p>
                {key === 'totalPortfolioValue' && (
                  <p
                    className={`text-xs ${
                      summary.totalProfitLossPercent >= 0
                        ? 'text-emerald-600'
                        : 'text-red-600'
                    }`}
                  >
                    {formatPercent(summary.totalProfitLossPercent)} overall
                  </p>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
