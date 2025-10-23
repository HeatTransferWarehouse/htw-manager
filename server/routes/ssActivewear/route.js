const express = require('express');
const fs = require('fs');
const scheduler = require('./scheduler');
const logger = require('./services/loggerService');
const router = express.Router();

if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}


router.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'SS Activewear to BigCommerce Sync Service',
    endpoints: {
      '/': 'Service status',
      '/sync/status': 'Get sync status',
      '/sync/run': 'Manually trigger sync (POST)',
      '/health': 'Health check',
    },
  });
});


router.get('/sync/status', (req, res) => {
  const status = scheduler.getSyncStatus();
  res.json(status);
});


router.post('/sync/run', async (req, res) => {
  try {
    logger.info('Manual sync requested via API');
    const result = await scheduler.runManualSync();
    res.json({
      success: true,
      message: 'Sync completed',
      result,
    });
  } catch (error) {
    logger.error('Manual sync failed', { error: error.message });
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


router.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});


try {
  scheduler.start();
  logger.info('Scheduler started from route file');
} catch (error) {
  logger.error('Failed to start scheduler from route file', { error: error.message });
}

module.exports = router;
