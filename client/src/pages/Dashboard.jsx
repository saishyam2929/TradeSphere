import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { useAuthStore } from '../store/authStore';
import PortfolioSummary from '../components/portfolio/PortfolioSummary';
import HoldingsTable from '../components/portfolio/HoldingsTable';
import StockCard from '../components/stocks/StockCard';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const { data: portfolio, isLoading: portfolioLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => {
      const { data } = await api.get('/portfolio');
      return data.data;
    },
  });

  const { data: stocksData, isLoading: stocksLoading } = useQuery({
    queryKey: ['stocks', 'dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/stocks?limit=6');
      return data.data;
    },
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    if (user?.id) socket.emit('subscribe:portfolio', user.id);

    socket.on('portfolio:update', () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    });

    return () => {
      socket.off('portfolio:update');
    };
  }, [user?.id, queryClient]);

  if (portfolioLoading) return <Loader className="py-20" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Your trading overview at a glance
          </p>
        </div>
        <Link to="/market">
          <Button>Explore Market</Button>
        </Link>
      </div>

      <PortfolioSummary summary={portfolio?.summary} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Your Holdings">
          <HoldingsTable holdings={portfolio?.holdings?.slice(0, 5)} />
          {(portfolio?.holdings?.length || 0) > 5 && (
            <Link
              to="/portfolio"
              className="mt-4 block text-center text-sm text-indigo-600 hover:underline dark:text-indigo-400"
            >
              View all holdings →
            </Link>
          )}
        </Card>

        <Card title="Trending Stocks">
          {stocksLoading ? (
            <Loader />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {stocksData?.stocks?.map((stock) => (
                <StockCard key={stock.symbol} stock={stock} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
