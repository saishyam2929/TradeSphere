import { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { formatCurrency } from '../../utils/format';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function TradePanel({ symbol, currentPrice, ownedQuantity = 0 }) {
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const updateWallet = useAuthStore((s) => s.updateWallet);

  const qty = parseFloat(quantity) || 0;
  const total = qty * currentPrice;

  const handleTrade = async (type) => {
    if (qty <= 0) {
      toast.error('Enter a valid quantity');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post(`/trade/${type}`, { symbol, quantity: qty });
      updateWallet(data.data.walletBalance);
      toast.success(data.data.message);
      setQuantity('');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Trade">
      <div className="space-y-4">
        <div className="rounded-lg bg-gray-50 p-3 dark:bg-slate-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Current Price</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(currentPrice)}
          </p>
          {ownedQuantity > 0 && (
            <p className="mt-1 text-sm text-gray-500">
              You own: <span className="font-medium">{ownedQuantity} shares</span>
            </p>
          )}
        </div>

        <Input
          label="Quantity"
          type="number"
          min="1"
          step="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Enter quantity"
        />

        {qty > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Estimated Total</span>
            <span className="font-semibold">{formatCurrency(total)}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="success"
            loading={loading}
            onClick={() => handleTrade('buy')}
            className="w-full"
          >
            Buy
          </Button>
          <Button
            variant="danger"
            loading={loading}
            disabled={ownedQuantity === 0}
            onClick={() => handleTrade('sell')}
            className="w-full"
          >
            Sell
          </Button>
        </div>
      </div>
    </Card>
  );
}
