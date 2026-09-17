# What's Pumping?

Fun meme-coin radar powered by Tatum Data API.

**Live:** [https://apps.tatum.io/whats-pumping](https://apps.tatum.io/whats-pumping)

## Features

- Dark hero with **green wojak** (best % for the selected timeframe) and **rekt wojak** (worst % / rug of the day)
- Leaderboard with **market cap**, price, volume, and % change
- Rank by **% increase** (timeframe-aware) or **market cap**
- **Bubble view** sized by market cap
- Search by ticker / name / contract address
- Chain boards: **Solana**, **Base**, **BSC** (chain-colored)
- Notifications CTA to draft a target-price alert (links to Tatum Notifications)
- Corner badge: **Built with Tatum Builder** → [ai.tatum.io](https://ai.tatum.io/)

> Robinhood RWA/stocks and Sui trending are not available on `GET /v4/data/tokens/trending` yet, so the third board uses **Base**.

## Setup

```bash
cp .env.example .env.local
# TATUM_API_KEY=...

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Webflow Cloud

Deployed to the **Tatum Apps** site at mount `/whats-pumping`.

```bash
webflow auth login
webflow cloud deploy \
  --site-id 618a9dc0e5826661c77e6a67 \
  --app-id 0975131f-2b1c-4aaa-987b-7f09c6d56926 \
  --environment production \
  --mount /whats-pumping \
  --auto-publish
```

Set `TATUM_API_KEY` (secret) and optionally `NEXT_PUBLIC_BASE_PATH=/whats-pumping` in the Cloud environment variables dashboard, then redeploy.
