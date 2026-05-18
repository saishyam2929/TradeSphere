import { getLatestPrice } from '../services/stockService.js';
import { getPortfolio } from '../services/portfolioService.js';

const STOCK_UPDATE_INTERVAL = 5000;
const STOCK_ROOM_PREFIX = 'stock:';

const getActiveStockSymbols = (io) => {
  const symbols = new Set();

  for (const roomName of io.sockets.adapter.rooms.keys()) {
    if (!roomName.startsWith(STOCK_ROOM_PREFIX)) continue;

    const room = io.sockets.adapter.rooms.get(roomName);
    if (room?.size > 0) {
      symbols.add(roomName.slice(STOCK_ROOM_PREFIX.length));
    }
  }

  return [...symbols];
};

export const setupStockSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('subscribe:stock', (symbol) => {
      if (!symbol) return;

      const upperSymbol = String(symbol).toUpperCase();
      socket.join(`${STOCK_ROOM_PREFIX}${upperSymbol}`);
      console.log(`${socket.id} subscribed to ${upperSymbol}`);
    });

    socket.on('subscribe:portfolio', async (userId) => {
      if (userId) {
        socket.join(`portfolio:${userId}`);
      }
    });

    socket.on('unsubscribe:stock', (symbol) => {
      if (!symbol) return;

      const upperSymbol = String(symbol).toUpperCase();
      socket.leave(`${STOCK_ROOM_PREFIX}${upperSymbol}`);
      console.log(`${socket.id} unsubscribed from ${upperSymbol}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  setInterval(async () => {
    try {
      const symbols = getActiveStockSymbols(io);
      if (symbols.length === 0) return;

      const updates = await Promise.all(
        symbols.map(async (symbol) => {
          try {
            const price = await getLatestPrice(symbol);
            return { symbol, price, timestamp: Date.now() };
          } catch {
            return null;
          }
        })
      );

      updates.filter(Boolean).forEach((update) => {
        io.to(`${STOCK_ROOM_PREFIX}${update.symbol}`).emit('stock:update', update);
      });
    } catch (err) {
      console.error('Stock update error:', err.message);
    }
  }, STOCK_UPDATE_INTERVAL);

  return io;
};

export const emitPortfolioUpdate = async (io, userId) => {
  try {
    const portfolio = await getPortfolio(userId);
    io.to(`portfolio:${userId}`).emit('portfolio:update', portfolio);
  } catch (err) {
    console.error('Portfolio update error:', err.message);
  }
};

export default { setupStockSocket, emitPortfolioUpdate };
