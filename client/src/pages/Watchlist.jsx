import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import WatchlistCard from '../components/watchlist/WatchlistCard';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';

export default function Watchlist() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['watchlist'],
    queryFn: async () => {
      const { data: res } = await api.get('/watchlist');
      return res.data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Watchlist</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Monitor your favorite stocks
        </p>
      </div>

      {isLoading ? (
        <Loader className="py-20" />
      ) : data?.length === 0 ? (
        <Card>
          <div className="py-12 text-center text-gray-500">
            Your watchlist is empty. Add stocks from the Market or Stock Detail page.
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map((item) => (
            <WatchlistCard key={item.id} item={item} onRemove={refetch} />
          ))}
        </div>
      )}
    </div>
  );
}
