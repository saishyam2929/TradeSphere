import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import LeaderboardTable from '../components/leaderboard/LeaderboardTable';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';

const sortOptions = [
  { value: 'portfolioValue', label: 'Portfolio Value' },
  { value: 'profit', label: 'Total Profit' },
  { value: 'roi', label: 'ROI %' },
];

export default function Leaderboard() {
  const [sortBy, setSortBy] = useState('portfolioValue');
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', sortBy],
    queryFn: async () => {
      const { data: res } = await api.get(`/leaderboard?sortBy=${sortBy}&limit=20`);
      return res.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Leaderboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Top traders ranked by performance
          </p>
        </div>
        <div className="flex gap-2">
          {sortOptions.map((opt) => (
            <Button
              key={opt.value}
              size="sm"
              variant={sortBy === opt.value ? 'primary' : 'secondary'}
              onClick={() => setSortBy(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        {isLoading ? (
          <Loader className="py-12" />
        ) : (
          <LeaderboardTable entries={data} currentUserId={user?.id} />
        )}
      </Card>
    </div>
  );
}
