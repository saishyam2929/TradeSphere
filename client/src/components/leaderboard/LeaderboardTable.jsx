import { formatCurrency, formatPercent } from '../../utils/format';
import Badge from '../ui/Badge';
import { Trophy, Medal } from 'lucide-react';

const rankIcons = {
  1: <Trophy className="h-5 w-5 text-amber-400" />,
  2: <Medal className="h-5 w-5 text-gray-400" />,
  3: <Medal className="h-5 w-5 text-amber-700" />,
};

export default function LeaderboardTable({ entries, currentUserId }) {
  if (!entries?.length) {
    return (
      <div className="py-12 text-center text-gray-500">No leaderboard data yet.</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500 dark:border-slate-700 dark:text-gray-400">
            <th className="pb-3 font-medium">Rank</th>
            <th className="pb-3 font-medium">Trader</th>
            <th className="pb-3 font-medium">Portfolio Value</th>
            <th className="pb-3 font-medium">Total Profit</th>
            <th className="pb-3 font-medium">ROI</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.userId}
              className={`border-b border-gray-100 dark:border-slate-800 ${
                entry.userId === currentUserId
                  ? 'bg-indigo-50 dark:bg-indigo-900/20'
                  : ''
              }`}
            >
              <td className="py-3">
                <div className="flex items-center gap-2">
                  {rankIcons[entry.rank] || (
                    <span className="w-5 text-center font-bold text-gray-500">
                      {entry.rank}
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 font-semibold">
                {entry.username}
                {entry.userId === currentUserId && (
                  <Badge variant="info" className="ml-2">You</Badge>
                )}
              </td>
              <td className="py-3 font-medium">
                {formatCurrency(entry.totalPortfolioValue)}
              </td>
              <td
                className={`py-3 font-medium ${
                  entry.totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {formatCurrency(entry.totalProfit)}
              </td>
              <td
                className={`py-3 ${
                  entry.roi >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {formatPercent(entry.roi)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
