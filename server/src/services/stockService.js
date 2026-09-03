import axios from 'axios';
import { query } from '../config/db.js';
import AppError from '../utils/AppError.js';
import env from '../config/env.js';
import { mapStock } from '../utils/mappers.js';


// Simulated prices for fallback mode
const getSimulatedPrice = (symbol) => {
  const base = symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const price = 50 + (base % 450) + Math.sin(Date.now() / 60000 + base) * 5;
  const change = (Math.sin(Date.now() / 30000 + base) * 3).toFixed(2);
  return {
    currentPrice: parseFloat(price.toFixed(2)),
    dailyChange: parseFloat(change),
    volume: Math.floor(1000000 + base * 10000),
  };
};
const fetchStockSymbolsFromFinnhub = async () => {
  if (!env.finnhubApiKey) return [];

  try {
    const { data } = await axios.get(
      'https://finnhub.io/api/v1/stock/symbol',
      {
        params: {
          exchange: 'US',
          token: env.finnhubApiKey,
        },
        timeout: 10000,
      }
    );

    return data;
  } catch (error) {
    console.error('Failed to fetch stock symbols:', error.message);
    return [];
  }
};
export const syncStockSymbols = async () => {
  const symbols = await fetchStockSymbolsFromFinnhub();

  for (const stock of symbols) {
    await query(
      `
      INSERT INTO stock_symbols
        (symbol, company_name, exchange, type)
      VALUES
        ($1, $2, $3, $4)
      ON CONFLICT (symbol)
      DO UPDATE SET
        company_name = EXCLUDED.company_name,
        exchange = EXCLUDED.exchange,
        type = EXCLUDED.type
      `,
      [
        stock.symbol,
        stock.description,
        stock.exchange,
        stock.type,
      ]
    );
  }

  console.log(`Synced ${symbols.length} stock symbols`);
};

const fetchFromFinnhub = async (symbol) => {
  if (!env.finnhubApiKey) return null;

  try {
    const [quoteRes, profileRes] = await Promise.all([
      axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}`, {
        params: { token: env.finnhubApiKey },
        timeout: 5000,
      }),
      axios.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}`, {
        params: { token: env.finnhubApiKey },
        timeout: 5000,
      }),
    ]);

    const quote = quoteRes.data;
    if (!quote || quote.c === 0) return null;

    return {
      symbol: symbol.toUpperCase(),
      companyName: profileRes.data?.name || symbol,
      currentPrice: quote.c,
      dailyChange: quote.dp || 0,
      volume: quote.v || 0,
      open: quote.o,
      high: quote.h,
      low: quote.l,
      previousClose: quote.pc,
    };
  } catch {
    return null;
  }
};

const fetchCandlesFromFinnhub = async (symbol) => {
  if (!env.finnhubApiKey) return null;

  try {
    const to = Math.floor(Date.now() / 1000);
    const from = to - 30 * 24 * 60 * 60;

    const { data } = await axios.get('https://finnhub.io/api/v1/stock/candle', {
      params: {
        symbol,
        resolution: 'D',
        from,
        to,
        token: env.finnhubApiKey,
      },
      timeout: 5000,
    });

    if (data.s !== 'ok') return null;

    return data.t.map((timestamp, i) => ({
      date: new Date(timestamp * 1000).toISOString().split('T')[0],
      open: data.o[i],
      high: data.h[i],
      low: data.l[i],
      close: data.c[i],
      volume: data.v[i],
    }));
  } catch {
    return null;
  }
};

const generateSimulatedCandles = (symbol) => {
  const { currentPrice } = getSimulatedPrice(symbol);
  const candles = [];
  let price = currentPrice * 0.9;

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const change = (Math.random() - 0.48) * 5;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.min(open, close) - Math.random() * 2;
    candles.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 5000000),
    });
    price = close;
  }

  return candles;
};

export const upsertStock = async (stockData) => {
  const result = await query(
    `INSERT INTO stocks (symbol, company_name, current_price, daily_change, volume)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (symbol) DO UPDATE SET
       company_name = EXCLUDED.company_name,
       current_price = EXCLUDED.current_price,
       daily_change = EXCLUDED.daily_change,
       volume = EXCLUDED.volume,
       updated_at = NOW()
     RETURNING *`,
    [
      stockData.symbol,
      stockData.companyName,
      stockData.currentPrice,
      stockData.dailyChange,
      stockData.volume,
    ]
  );

  return mapStock(result.rows[0]);
};

export const getStockQuote = async (symbol) => {
  const upperSymbol = symbol.toUpperCase();

  let stockData = await fetchFromFinnhub(upperSymbol);

  if (!stockData) {
    const simulated = getSimulatedPrice(upperSymbol);

const stockResult = await query(
  `
  SELECT company_name
  FROM stock_symbols
  WHERE symbol = $1
  `,
  [upperSymbol]
);

stockData = {
  symbol: upperSymbol,
  companyName:
    stockResult.rows[0]?.company_name || `${upperSymbol} Corp.`,
  ...simulated,
};
  }

  const stock = await upsertStock(stockData);
  return { ...stock, ...stockData };
};

const hasCachedPrice = (stock) =>
  stock.currentPrice != null && stock.currentPrice > 0;

const hydrateStockPrices = async (stocks) =>
  Promise.all(
    stocks.map(async (stock) => {
      if (hasCachedPrice(stock)) return stock;

      try {
        const quote = await getStockQuote(stock.symbol);
        return {
          ...stock,
          companyName: quote.companyName || stock.companyName,
          currentPrice: quote.currentPrice,
          dailyChange: quote.dailyChange,
          volume: quote.volume,
        };
      } catch {
        return stock;
      }
    })
  );

export const searchStocks = async (
  search = '',
  page = 1,
  limit = 10
) => {

  const offset = (page - 1) * limit;

  const result = await query(
    `
    SELECT
      ss.symbol,
      ss.company_name,
      ss.exchange,
      ss.type,
      s.current_price,
      s.daily_change,
      s.volume
    FROM stock_symbols ss
    LEFT JOIN stocks s ON s.symbol = ss.symbol
    WHERE ss.symbol ILIKE $1
    OR ss.company_name ILIKE $1
    ORDER BY ss.symbol
    LIMIT $2
    OFFSET $3
    `,
    [
      `%${search}%`,
      limit,
      offset
    ]
  );

  const countResult = await query(
    `
    SELECT COUNT(*)
    FROM stock_symbols
    WHERE symbol ILIKE $1
    OR company_name ILIKE $1
    `,
    [`%${search}%`]
  );

  const total = parseInt(countResult.rows[0].count);

  const stocks = result.rows.map((row) => ({
    symbol: row.symbol,
    companyName: row.company_name,
    exchange: row.exchange,
    type: row.type,
    currentPrice:
      row.current_price != null ? parseFloat(row.current_price) : null,
    dailyChange:
      row.daily_change != null ? parseFloat(row.daily_change) : null,
    volume: row.volume != null ? parseFloat(row.volume) : null,
  }));

  return {
    stocks: await hydrateStockPrices(stocks),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAllStocks = async (page = 1, limit = 15) => {
  return searchStocks('', page, limit);
};

export const getStockDetails = async (symbol) => {
  const upperSymbol = symbol.toUpperCase();
  const stock = await getStockQuote(upperSymbol);

  let candles = await fetchCandlesFromFinnhub(upperSymbol);
  if (!candles) {
    candles = generateSimulatedCandles(upperSymbol);
  }

  let companyInfo = {};
  if (env.finnhubApiKey) {
    try {
      const { data } = await axios.get(
        'https://finnhub.io/api/v1/stock/profile2',
        {
          params: { symbol: upperSymbol, token: env.finnhubApiKey },
          timeout: 5000,
        }
      );
      companyInfo = {
        industry: data.finnhubIndustry,
        marketCap: data.marketCapitalization,
        website: data.weburl,
        exchange: data.exchange,
        country: data.country,
        ipo: data.ipo,
      };
    } catch {
      companyInfo = { industry: 'Technology', exchange: 'NASDAQ' };
    }
  } else {
    companyInfo = { industry: 'Technology', exchange: 'NASDAQ' };
  }

  return {
    stock,
    candles,
    companyInfo,
    marketStats: {
      open: stock.open || stock.currentPrice,
      high: stock.high || stock.currentPrice * 1.02,
      low: stock.low || stock.currentPrice * 0.98,
      previousClose: stock.previousClose || stock.currentPrice,
      volume: stock.volume,
    },
  };
};

export const getLatestPrice = async (symbol) => {
  const stock = await getStockQuote(symbol);
  return stock.currentPrice;
};

export default {
  getStockQuote,
  searchStocks,
  getAllStocks,
  getStockDetails,
  getLatestPrice,
};
