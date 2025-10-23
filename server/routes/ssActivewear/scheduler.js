const cron = require('node-cron');
const config = require('./config');
const syncService = require('./services/syncService');
const logger = require('./services/loggerService');

class Scheduler {
  constructor() {
    this.task = null;
    this.isRunning = false;
  }

  start() {
    const schedule = config.sync.schedule;

    if (!cron.validate(schedule)) {
      logger.error(`Invalid cron schedule: ${schedule}`);
      throw new Error(`Invalid cron schedule: ${schedule}`);
    }

    logger.info(`Starting scheduler with schedule: ${schedule}`);

    this.task = cron.schedule(schedule, async () => {
      if (this.isRunning) {
        logger.warn('Previous sync still running, skipping this execution');
        return;
      }

      this.isRunning = true;
      logger.info('Scheduled sync triggered');

      try {
        await syncService.performSync();
      } catch (error) {
        logger.error('Scheduled sync failed', { error: error.message });
      } finally {
        this.isRunning = false;
      }
    });

    logger.info('Scheduler started successfully');
  }

  stop() {
    if (this.task) {
      this.task.stop();
      logger.info('Scheduler stopped');
    }
  }

  async runManualSync() {
    if (this.isRunning) {
      throw new Error('A sync is already in progress');
    }

    this.isRunning = true;
    logger.info('Manual sync triggered');

    try {
      const result = await syncService.performSync();
      return result;
    } finally {
      this.isRunning = false;
    }
  }

getSyncStatus() {
  return {
    isRunning: this.isRunning,
    schedule: config.sync.schedule,
    // nextRun: this.task ? this.task.nextDates().toString() : null
  };
}


  getSyncStats() {
    return syncService.getStats();
  }
}

module.exports = new Scheduler();