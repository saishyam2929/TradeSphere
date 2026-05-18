import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import TransactionTable from '../components/transactions/TransactionTable';
import Card from '../components/ui/Card';
import Pagination from '../components/ui/Pagination';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';

export default function Transactions() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', page, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit: 15 });
      if (typeFilter) params.set('type', typeFilter);
      const { data: res } = await api.get(`/transactions?${params}`);
      return res.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Transactions
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Your complete trading history
          </p>
        </div>
        <div className="flex gap-2">
          {['', 'BUY', 'SELL'].map((type) => (
            <Button
              key={type || 'all'}
              size="sm"
              variant={typeFilter === type ? 'primary' : 'secondary'}
              onClick={() => {
                setTypeFilter(type);
                setPage(1);
              }}
            >
              {type || 'All'}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        {isLoading ? (
          <Loader className="py-12" />
        ) : (
          <>
            <TransactionTable transactions={data?.transactions} />
            <Pagination
              page={page}
              totalPages={data?.pagination?.totalPages || 1}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>
    </div>
  );
}
