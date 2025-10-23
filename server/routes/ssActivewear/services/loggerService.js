const winston = require('winston');
const { IncomingWebhook } = require('@slack/webhook');
const config = require('../config');

class LoggerService {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });

    this.slackWebhook = config.slack.enabled && config.slack.webhookUrl
      ? new IncomingWebhook(config.slack.webhookUrl)
      : null;

    this.syncLogs = [];
  }

  log(level, message, meta = {}) {
    this.logger.log(level, message, meta);
    this.syncLogs.push({
      timestamp: new Date(),
      level,
      message,
      ...meta
    });
  }

  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  error(message, meta = {}) {
    this.log('error', message, meta);
  }

  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }

  async sendSyncSummaryToSlack(summary) {
    if (!this.slackWebhook) {
      this.info('Slack notifications disabled');
      return;
    }

    try {
      const message = this.formatSyncSummary(summary);
      await this.slackWebhook.send({
        text: 'Product Sync Summary',
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: 'Product Sync Completed'
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: message
            }
          }
        ]
      });

      this.info('Sync summary sent to Slack');
    } catch (error) {
      this.error('Failed to send Slack notification', { error: error.message });
    }
  }

  formatSyncSummary(summary) {
    const {
      startTime,
      endTime,
      duration,
      totalProducts,
      created,
      updated,
      skipped,
      errors
    } = summary;

    let message = `*Sync Duration:* ${duration}ms\n`;
    message += `*Total Products Processed:* ${totalProducts}\n`;
    message += `*Created:* ${created}\n`;
    message += `*Updated:* ${updated}\n`;
    message += `*Skipped:* ${skipped}\n`;
    message += `*Errors:* ${errors.length}\n`;

    if (errors.length > 0) {
      message += '\n*Error Details:*\n';
      errors.slice(0, 5).forEach(err => {
        message += `• ${err.sku || 'Unknown'}: ${err.message}\n`;
      });
      if (errors.length > 5) {
        message += `... and ${errors.length - 5} more errors\n`;
      }
    }

    return message;
  }

  clearSyncLogs() {
    this.syncLogs = [];
  }

  getSyncLogs() {
    return this.syncLogs;
  }
}

module.exports = new LoggerService();
