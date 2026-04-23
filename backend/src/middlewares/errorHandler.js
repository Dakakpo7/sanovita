const logger = require('../utils/logger');

// =============================================
// GESTIONNAIRE D ERREURS GLOBAL
// =============================================
const errorHandler = (err, req, res, next) => {

  // Logger l erreur
  logger.error(`${err.message} - ${req.method} ${req.url}`);

  // Erreur de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Donnees invalides',
      erreurs: err.errors
    });
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Token invalide'
    });
  }

  // Erreur JWT expire
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expire. Reconnectez-vous.'
    });
  }

  // Erreur Multer (upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      message: 'Fichier trop volumineux. Maximum 5MB.'
    });
  }

  // Erreur par defaut
  res.status(err.status || 500).json({
    message: err.message || 'Erreur interne du serveur'
  });
};

module.exports = errorHandler;