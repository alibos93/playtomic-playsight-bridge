const cron = require('node-cron');
const config = require('./config');
const { pollAndTrigger } = require('./bridge');

console.log('===========================================');
console.log(' Playtomic → PlaySight Recording Bridge');
console.log('===========================================');
console.log(`Venue (tenant):       ${config.playtomic.tenantId}`);
console.log(`Poll interval:        Every ${config.pollIntervalMinutes} minute(s)`);
console.log(`Trigger window:       ${config.triggerAheadMinutes} minutes before match`);
console.log(`Court mappings:       ${Object.keys(config.courtMapping).length} configured`);
console.log(`PlaySight API key:    ${config.playsight.apiKey ? 'Configured' : 'NOT SET (dry-run mode)'}`);
console.log('===========================================\n');

if (Object.keys(config.courtMapping).length === 0) {
  console.warn(
    '[WARNING] No court mappings configured!\n' +
    'Set COURT_MAPPING in .env as a JSON object mapping\n' +
    'Playtomic resource_ids to PlaySight court IDs.\n' +
    'Example: COURT_MAPPING=\'{"abc-123":"court-1","def-456":"court-2"}\'\n'
  );
}

// Run once immediately on startup
pollAndTrigger();

// Then schedule recurring polls
const cronExpression = `*/${config.pollIntervalMinutes} * * * *`;
cron.schedule(cronExpression, () => {
  pollAndTrigger();
});

console.log(`[Scheduler] Running every ${config.pollIntervalMinutes} minute(s). Press Ctrl+C to stop.\n`);
