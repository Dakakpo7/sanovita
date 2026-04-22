const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const verifierToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'Acces refuse. Vous devez etre connecte.'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, utilisateur) => {
    if (err) {
      return res.status(403).json({
        message: 'Token invalide ou expire. Reconnectez-vous.'
      });
    }
    req.utilisateur = utilisateur;
    next();
  });
};

module.exports = { verifierToken };