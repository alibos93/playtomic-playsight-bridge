const path = require('path');

// Load .env file from project root
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const config = {
  playtomic: {
    authUrl: 'https://thirdparty.playtomic.io/api/v1/oauth/token',
    apiUrl: 'https://thirdparty.playtomic.io/api/v1',
    clientId: process.env.PLAYTOMIC_CLIENT_ID,
    secret: process.env.PLAYTOMIC_SECRET,
    tenantId: process.env.PLAYTOMIC_TENANT_ID,
  },
  playsight: {
    apiUrl: process.env.PLAYSIGHT_API_URL || 'https://api.playsight.com',
    apiKey: process.env.PLAYSIGHT_API_KEY,
    facilityId: process.env.PLAYSIGHT_FACILITY_ID,
  },
  pollIntervalMinutes: parseInt(process.env.POLL_INTERVAL_MINUTES, 10) || 1,
  triggerAheadMinutes: parseInt(process.env.TRIGGER_AHEAD_MINUTES, 10) || 2,

  // Map Playtomic court resource_ids to PlaySight camera/court identifiers.
  // Fill this in with your actual court mappings.
  // Example: { "playtomic-court-uuid-1": "playsight-court-A", ... }
  courtMapping: JSON.parse(process.env.COURT_MAPPING || '{}'),
};

// Validate required config
const missing = [];
if (!config.playtomic.clientId) missing.push('PLAYTOMIC_CLIENT_ID');
if (!config.playtomic.secret) missing.push('PLAYTOMIC_SECRET');
if (!config.playtomic.tenantId) missing.push('PLAYTOMIC_TENANT_ID');
if (missing.length > 0) {
  console.error(`Missing required env vars: ${missing.join(', ')}`);
  console.error('Copy .env.example to .env and fill in your credentials.');
  process.exit(1);
}

module.exports = config;
