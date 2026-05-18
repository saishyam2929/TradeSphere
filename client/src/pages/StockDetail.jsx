import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Star } from 'lucide-react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import StockChart from '../components/stocks/StockChart';
import TradePanel from '../components/stocks/TradePanel';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { formatCurrency, formatPercent, formatNumber } from '../utils/format';

export default function StockDetail() {
  const { symbol } = useParams();
  const [livePrice, setLivePrice] = useState(null);
  const [chartType, setChartType] = useState('line');

  const { data, isLoading } = useQuery({
    queryKey: ['stock', symbol],
    queryFn: async () => {
      const { data: res } = await api.get(`/stocks/${symbol}`);
      return res.data;
    },
  });

  const { data: portfolio } = useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => {
      const { data: res } = await api.get('/portfolio');
      return res.data;
    },
  });

  const holding = portfolio?.holdings?.find(
    (h) => h.symbol === symbol?.toUpperCase()
  );

  useEffect(() => {
    if (!symbol) return;

    const upperSymbol = symbol.toUpperCase();
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    socket.emit('subscribe:stock', upperSymbol);

    const onStockUpdate = (update) => {
      if (update.symbol === upperSymbol) {
        setLivePrice(update.price);
      }
    };

    socket.on('stock:update', onStockUpdate);

    return () => {
      socket.emit('unsubscribe:stock', upperSymbol);
      socket.off('stock:update', onStockUpdate);
      setLivePrice(null);
    };
  }, [symbol]);

  const handleAddWatchlist = async () => {
    try {
      await api.post('/watchlist', { symbol });
      toast.success(`${symbol} added to watchlist`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (isLoading) return <Loader className="py-20" />;

  const stock = data?.stock;
  const price = livePrice ?? stock?.currentPrice;
  const change = stock?.dailyChange || 0;
  const isPositive = change >= 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {stock?.symbol}
            </h1>
            <Badge variant={isPositive ? 'success' : 'danger'}>
              {formatPercent(change)}
            </Badge>
          </div>
          <p className="text-gray-500 dark:text-gray-400">{stock?.companyName}</p>
          <p className="mt-2 text-4xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(price)}
          </p>
        </div>
        <Button variant="secondary" onClick={handleAddWatchlist}>
          <Star className="h-4 w-4" />
          Add to Watchlist
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card
            title="Price Chart"
            action={
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={chartType === 'line' ? 'primary' : 'ghost'}
                  onClick={() => setChartType('line')}
                >
                  Line
                </Button>
                <Button
                  size="sm"
                  variant={chartType === 'candlestick' ? 'primary' : 'ghost'}
                  onClick={() => setChartType('candlestick')}
                >
                  Candlestick
                </Button>
              </div>
            }
          >
            <StockChart data={data?.candles} type={chartType} />
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card title="Market Stats">
              <dl className="space-y-3 text-sm">
                {[
                  ['Open', data?.marketStats?.open],
                  ['High', data?.marketStats?.high],
                  ['Low', data?.marketStats?.low],
                  ['Prev Close', data?.marketStats?.previousClose],
                  ['Volume', data?.marketStats?.volume],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <dt className="text-gray-500">{label}</dt>
                    <dd className="font-medium">
                      {label === 'Volume' ? formatNumber(value) : formatCurrency(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>

            <Card title="Company Info">
              <dl className="space-y-3 text-sm">
                {[
                  ['Industry', data?.companyInfo?.industry],
                  ['Exchange', data?.companyInfo?.exchange],
                  ['Country', data?.companyInfo?.country],
                  ['Market Cap', data?.companyInfo?.marketCap],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <dt className="text-gray-500">{label}</dt>
                    <dd className="font-medium">{value || '—'}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </div>
        </div>

        <TradePanel
          symbol={symbol}
          currentPrice={price}
          ownedQuantity={holding?.quantity || 0}
        />
      </div>
    </div>
  );
}
