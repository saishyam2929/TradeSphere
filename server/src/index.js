import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import env from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { setupStockSocket } from './sockets/stockSocket.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: env.clientUrl,
    credentials: true,
  },
});

app.set('io', io); //this stores an instance of socketio in express 
                   //which can be accessed later

app.use(    //cors middleware setup
  cors({
    origin: env.clientUrl,
    credentials: true, //cookies and authentication allowed
  })
);
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'TradeSphere API is running.' });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

setupStockSocket(io);

httpServer.listen(env.port, () => {
  console.log(`TradeSphere server running on port ${env.port}`);
});

export default app;
