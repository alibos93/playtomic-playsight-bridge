const config = require('./config');
const { getBookings } = require('./playtomic');
const { startRecording } = require('./playsight');

// Track which bookings we've already triggered recording for
const triggeredBookings = new Set();

// Clean up old entries every hour to prevent memory leak
setInterval(() => {
  if (triggeredBookings.size > 1000) {
    triggeredBookings.clear();
    console.log('[Bridge] Cleared triggered bookings cache.');
  }
}, 60 * 60 * 1000);

/**
 * Main polling cycle:
 * 1. Fetch bookings starting in the next few minutes
 * 2. For each new booking, trigger PlaySight recording
 */
async function pollAndTrigger() {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + config.triggerAheadMinutes * 60 * 1000);

  console.log(`\n[Bridge] Polling bookings from ${now.toISOString()} to ${windowEnd.toISOString()}`);

  let bookings;
  try {
    bookings = await getBookings(now, windowEnd);
  } catch (err) {
    console.error(`[Bridge] Failed to fetch bookings: ${err.message}`);
    return;
  }

  if (!Array.isArray(bookings) || bookings.length === 0) {
    console.log('[Bridge] No upcoming bookings found.');
    return;
  }

  console.log(`[Bridge] Found ${bookings.length} upcoming booking(s).`);

  for (const booking of bookings) {
    const bookingId = booking.booking_id || booking.object_id;

    // Skip if already triggered
    if (triggeredBookings.has(bookingId)) {
      continue;
    }

    const courtId = booking.resource_id;
    const playsightCourtId = config.courtMapping[courtId];

    if (!playsightCourtId) {
      console.warn(
        `[Bridge] No PlaySight mapping for Playtomic court "${courtId}" ` +
        `(${booking.resource_name || 'unknown'}). Skipping.`
      );
      continue;
    }

    // Calculate duration in minutes from booking times
    const startTime = new Date(booking.booking_start_date);
    const endTime = new Date(booking.booking_end_date);
    const durationMinutes = Math.round((endTime - startTime) / 60000);

    // Build metadata for the recording
    const participants = booking.participant_info?.participants || [];
    const playerNames = participants.map(p => p.name).filter(Boolean).join(', ');

    const metadata = {
      title: `${booking.resource_name || 'Court'} - ${playerNames || 'Padel Match'}`,
      booking_id: bookingId,
      player_names: playerNames,
    };

    try {
      await startRecording(playsightCourtId, durationMinutes, metadata);
      triggeredBookings.add(bookingId);
      console.log(
        `[Bridge] ✓ Triggered recording for booking ${bookingId} ` +
        `on court ${booking.resource_name || courtId} (${durationMinutes} min)`
      );
    } catch (err) {
      console.error(
        `[Bridge] ✗ Failed to trigger recording for ${bookingId}: ${err.message}`
      );
    }
  }
}

module.exports = { pollAndTrigger };
