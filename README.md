# TradeSphere

A full-stack stock market simulator built with the **PERN stack** (PostgreSQL, Express, React, Node.js). Trade virtual stocks, manage your portfolio, compete on the leaderboard — all with $100,000 starting capital.

## Features

- JWT authentication with protected routes
- Virtual wallet ($100,000 starting balance)
- Live stock data (Finnhub API with simulated fallback)
- Buy/sell trading engine with transaction history
- Portfolio tracking with P/L calculations
- Watchlist management
- Real-time price updates via Socket.io
- Leaderboard ranked by portfolio value, profit, and ROI
- Modern trading dashboard with dark/light mode

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite, Tailwind CSS, React Router, Axios, React Query, Recharts, Zustand |
| Backend | Node.js, Express, **pg**, JWT, bcrypt, Socket.io |
| Database | PostgreSQL (managed via **pgAdmin**) |

## Project Structure

```
tradesphere/
├── client/              # React frontend
├── server/
│   ├── database/
│   │   ├── schema.sql   # Run this in pgAdmin
│   │   └── init.js      # Or run via npm run db:init
│   └── src/
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       ├── middleware/
│       ├── sockets/
│       └── config/
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL installed locally
- [pgAdmin](https://www.pgadmin.org/download/) (optional GUI)

### 1. Install Dependencies

```bash
cd tradesphere
npm run install:all
```

### 2. Configure Environment

**Server** (`server/.env`):

```env
PORT=5000
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/tradesphere"
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
FINNHUB_API_KEY=your_finnhub_key
```

**Client** (`client/.env`):

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Setup Database with pgAdmin

**Option A — pgAdmin (recommended):**

1. Open **pgAdmin**
2. Connect to your local PostgreSQL server
3. Right-click **Databases → Create → Database**
4. Name it `tradesphere`
5. Open **Query Tool** on the new database
6. Open `server/database/schema.sql`, copy all contents, paste and **Execute**

**Option B — Terminal script:**

```bash
cd server
npm run db:init
```

**Option C — psql:**

```bash
psql -U postgres -d tradesphere -f server/database/schema.sql
```

### 4. Run Development

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/profile` | Get profile |
| GET | `/api/stocks` | List/search stocks |
| GET | `/api/stocks/:symbol` | Stock details |
| POST | `/api/trade/buy` | Buy stock |
| POST | `/api/trade/sell` | Sell stock |
| GET | `/api/portfolio` | Get portfolio |
| GET | `/api/transactions` | Transaction history |
| POST | `/api/watchlist` | Add to watchlist |
| DELETE | `/api/watchlist/:id` | Remove from watchlist |
| GET | `/api/leaderboard` | Rankings |

## Deployment

### Frontend (Vercel)

1. Connect repo to Vercel
2. Set root directory to `client`
3. Add env vars: `VITE_API_URL`, `VITE_SOCKET_URL`

### Backend (Render / Railway)

1. Set root directory to `server`
2. Build command: `npm install`
3. Start command: `npm start`
4. Add all server env vars

### Database (Neon or any PostgreSQL)

1. Create a PostgreSQL database
2. Run `server/database/schema.sql` in pgAdmin or via `npm run db:init`
3. Set `DATABASE_URL` in your server environment

## License

MIT
