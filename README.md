# What's Pumping?

Fun meme-coin radar inspired by [Katana Trader Info](https://apps.tatum.io/katana-trader-info) and powered by Tatum Data API.

## Features

- Dark hero with **green wojak** (best % for the selected timeframe) and **rekt wojak** (worst % / rug of the day)
- Leaderboard with **market cap**, price, volume, and % change
- Rank by **% increase** (timeframe-aware) or **market cap**
- **Bubble view** sized by market cap
- Search by ticker / name / contract address
- Chain boards: **Solana**, **Base**, **BSC** (chain-colored)
- Notifications CTA to draft a target-price alert (links to Tatum Notifications)

> Robinhood RWA/stocks and Sui trending are not available on `GET /v4/data/tokens/trending` yet, so the third board uses **Base**.

## Setup

```bash
cp .env.example .env.local
# TATUM_API_KEY=...

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
