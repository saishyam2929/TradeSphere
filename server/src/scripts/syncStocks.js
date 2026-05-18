import axios from "axios";
import { query } from "../config/db.js";
import env from "../config/env.js";

async function syncNSEStocks() {

  try {

    console.log("Fetching NSE stocks from Finnhub...");
    console.log(env.finnhubApiKey);
    const { data } = await axios.get(
      "https://finnhub.io/api/v1/stock/symbol",
      {
        params: {
          exchange: "US",
          token: env.finnhubApiKey
        }
      }
    );

    console.log(`Found ${data.length} stocks`);

    for (const stock of data) {

      await query(
        `
        INSERT INTO stock_symbols
        (symbol, company_name, exchange, type, currency)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT(symbol) DO NOTHING
        `,
        [
          stock.symbol,
          stock.description,
          stock.exchange,
          stock.type,
          stock.currency
        ]
      );
    }

    console.log("NSE stocks synced successfully");

  } catch (err) {

    console.error("Sync failed:");
    console.error(err.message);
  }
}

syncNSEStocks();