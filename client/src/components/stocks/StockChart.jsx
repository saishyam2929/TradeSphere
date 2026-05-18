import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { formatCurrency } from '../../utils/format';

export default function StockChart({ data, type = 'line' }) {
  if (!data?.length) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        No chart data available
      </div>
    );
  }

  const chartData = data.map((d) => ({
    date: d.date?.slice(5) || d.date,
    price: d.close,
    volume: d.volume,
    open: d.open,
    high: d.high,
    low: d.low,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          yAxisId="price"
          tick={{ fontSize: 12, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          domain={['auto', 'auto']}
          tickFormatter={(v) => `$${v}`}
        />
        {type === 'candlestick' && (
          <YAxis yAxisId="volume" orientation="right" hide />
        )}
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: 'none',
            borderRadius: '8px',
            color: '#f1f5f9',
          }}
          formatter={(value, name) => [
            name === 'volume' ? value.toLocaleString() : formatCurrency(value),
            name === 'volume' ? 'Volume' : 'Price',
          ]}
        />
        {type === 'candlestick' ? (
          <>
            <Bar yAxisId="volume" dataKey="volume" fill="#6366f1" opacity={0.3} />
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="price"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
            />
          </>
        ) : (
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="price"
            stroke="#6366f1"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#6366f1' }}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
