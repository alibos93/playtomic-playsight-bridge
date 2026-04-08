const config = require('./config');

/**
 * ============================================================
 *  PlaySight API - PLACEHOLDER
 * ============================================================
 *
 *  PlaySight does not publish their API docs publicly.
 *  You need to request API access from: support@playsight.com
 *
 *  Once you have their docs, replace the placeholder below
 *  with the real API call. Based on how their integrations
 *  with CourtReserve/clubcloud/Playbypoint work, you'll
 *  likely need something like:
 *
 *    POST /api/v1/sessions/start
 *    {
 *      "facility_id": "...",
 *      "court_id": "...",
 *      "duration_minutes": 90,
 *      "title": "Padel Match - Court 1"
 *    }
 *
 *  The function signature below is designed to be easy to
 *  fill in once you have the real endpoint.
 * ============================================================
 */

/**
 * Start a PlaySight recording session on a specific court.
 *
 * @param {string} playsightCourtId - PlaySight court/camera identifier
 * @param {number} durationMinutes  - How long to record
 * @param {object} metadata         - Extra info (booking ID, player names, etc.)
 * @returns {object} Session info from PlaySight (or placeholder)
 */
async function startRecording(playsightCourtId, durationMinutes, metadata = {}) {
  const { apiUrl, apiKey, facilityId } = config.playsight;

  // ── If no API key configured, run in dry-run mode ──
  if (!apiKey) {
    console.log(`[PlaySight] DRY RUN - Would start recording:`);
    console.log(`  Court:    ${playsightCourtId}`);
    console.log(`  Duration: ${durationMinutes} min`);
    console.log(`  Metadata: ${JSON.stringify(metadata)}`);
    return { status: 'dry_run', courtId: playsightCourtId };
  }

  // ── Real API call (fill in once you have PlaySight docs) ──
  console.log(`[PlaySight] Starting recording on court ${playsightCourtId}...`);

  const res = await fetch(`${apiUrl}/api/v1/sessions/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      // Or could be: 'X-API-Key': apiKey
    },
    body: JSON.stringify({
      facility_id: facilityId,
      court_id: playsightCourtId,
      duration_minutes: durationMinutes,
      title: metadata.title || 'Auto-recorded match',
      // Add any other fields PlaySight requires
      ...metadata,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[PlaySight] Start recording failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  console.log(`[PlaySight] Recording started: ${JSON.stringify(data)}`);
  return data;
}

module.exports = { startRecording };
