import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import StockCard from '../components/stocks/StockCard';
import StockSearch from '../components/stocks/StockSearch';
import Pagination from '../components/ui/Pagination';
import Loader from '../components/ui/Loader';

export default function Market() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['stocks', debouncedSearch, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit: 12 });
      if (debouncedSearch) params.set('search', debouncedSearch);
      const { data: res } = await api.get(`/stocks?${params}`);
      return res.data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Market</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Browse and search stocks to trade
        </p>
      </div>

      <StockSearch value={search} onChange={setSearch} />

      {isLoading ? (
        <Loader className="py-20" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data?.stocks?.map((stock) => (
              <StockCard key={stock.symbol} stock={stock} />
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={data?.pagination?.totalPages || 1}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
