const winston = require('winston');
const path = require('path');

// Format des logs
const formatLog = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${stack || message}`;
  })
);

// Creer le logger
const logger = winston.createLogger({
  level: 'info',
  format: formatLog,
  transports: [
    // Afficher dans la console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        formatLog
      )
    }),
    // Sauvegarder les erreurs dans un fichier
    new winston.transports.File({
      filename: path.join('logs', 'erreurs.log'),
      level: 'error'
    }),
    // Sauvegarder tous les logs dans un fichier
    new winston.transports.File({
      filename: path.join('logs', 'application.log')
    })
  ]
});

module.exports = logger;