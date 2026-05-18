import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import PortfolioSummary from '../components/portfolio/PortfolioSummary';
import HoldingsTable from '../components/portfolio/HoldingsTable';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';

export default function Portfolio() {
  const { data, isLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => {
      const { data: res } = await api.get('/portfolio');
      return res.data;
    },
  });

  if (isLoading) return <Loader className="py-20" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolio</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Track your holdings and performance
        </p>
      </div>

      <PortfolioSummary summary={data?.summary} />

      <Card title="All Holdings">
        <HoldingsTable holdings={data?.holdings} />
      </Card>
    </div>
  );
}
