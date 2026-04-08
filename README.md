# Playtomic → PlaySight Recording Bridge

Automatically starts PlaySight camera recordings when a Playtomic booking begins — no more forgotten QR code scans.

## How It Works

1. Polls the Playtomic API every minute for bookings about to start
2. Maps the Playtomic court to its PlaySight camera
3. Triggers a PlaySight recording session automatically

## Prerequisites

- **Node.js** 18+
- **Playtomic Manager** API credentials (Settings → Developer Tools)
- **PlaySight** API access (request from support@playsight.com)

## Setup

```bash
# Install dependencies
npm install

# Copy and fill in your credentials
cp .env.example .env

# Run
npm start
```

## Configuration

All config lives in `.env`:

| Variable | Description |
|----------|-------------|
| `PLAYTOMIC_CLIENT_ID` | From Playtomic Manager → Settings → Developer Tools |
| `PLAYTOMIC_SECRET` | From Playtomic Manager → Settings → Developer Tools |
| `PLAYTOMIC_TENANT_ID` | Your venue/club ID in Playtomic |
| `PLAYSIGHT_API_URL` | PlaySight API base URL (get from PlaySight support) |
| `PLAYSIGHT_API_KEY` | PlaySight API key (get from PlaySight support) |
| `PLAYSIGHT_FACILITY_ID` | Your facility ID in PlaySight |
| `COURT_MAPPING` | JSON mapping Playtomic court IDs → PlaySight court IDs |
| `POLL_INTERVAL_MINUTES` | How often to check for new bookings (default: 1) |
| `TRIGGER_AHEAD_MINUTES` | How early to start recording before match (default: 2) |

### Court Mapping

You need to map each Playtomic court `resource_id` to its PlaySight court ID:

```
COURT_MAPPING='{"playtomic-court-uuid-1":"playsight-court-1","playtomic-court-uuid-2":"playsight-court-2"}'
```

To find your Playtomic court IDs, run the service in dry-run mode (without PlaySight credentials) and check the logs — it will print the `resource_id` for each booking.

## PlaySight API Status

The PlaySight integration is a **placeholder** until you receive API docs from PlaySight. The service runs in **dry-run mode** (logs what it would do) until a `PLAYSIGHT_API_KEY` is configured. Once you have PlaySight's API docs, update `src/playsight.js` with the real endpoint.

## Running in Production

For always-on operation, use PM2 or systemd:

```bash
# With PM2
npm install -g pm2
pm2 start src/index.js --name playtomic-playsight
pm2 save
pm2 startup
```
