const config = require('./config');

let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Authenticate with Playtomic and return a bearer token.
 * Tokens last 1 hour; this caches and auto-refreshes.
 */
async function getToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  console.log('[Playtomic] Refreshing auth token...');

  const res = await fetch(config.playtomic.authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: config.playtomic.clientId,
      secret: config.playtomic.secret,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[Playtomic] Auth failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  cachedToken = data.token;
  // Refresh 5 minutes before expiry
  tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000;

  console.log('[Playtomic] Token refreshed successfully.');
  return cachedToken;
}

/**
 * Fetch bookings from Playtomic within a time window.
 * @param {Date} from - Start of window (UTC)
 * @param {Date} to   - End of window (UTC)
 * @returns {Array} List of booking objects
 */
async function getBookings(from, to) {
  const token = await getToken();

  const params = new URLSearchParams({
    tenant_id: config.playtomic.tenantId,
    start_booking_date: from.toISOString().replace(/\.\d{3}Z$/, ''),
    end_booking_date: to.toISOString().replace(/\.\d{3}Z$/, ''),
    sport_id: 'PADEL',
    status: 'PENDING',
    size: '200',
  });

  const url = `${config.playtomic.apiUrl}/bookings?${params}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[Playtomic] Bookings fetch failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.bookings || data.content || data || [];
}

module.exports = { getBookings };
