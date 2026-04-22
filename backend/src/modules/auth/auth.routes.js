// Routes d'authentification
// Définit les adresses URL disponibles pour l'authentification

const express = require('express');
const router = express.Router();
const { inscription, connexion, monProfil } = require('./auth.controller');
const { verifierToken } = require('../../middlewares/auth.middleware');

// =============================================
// ROUTES PUBLIQUES (pas besoin d'être connecté)
// =============================================

// POST /api/auth/inscription
// Créer un nouveau compte
router.post('/inscription', inscription);

// POST /api/auth/connexion
// Se connecter et recevoir un token
router.post('/connexion', connexion);

// =============================================
// ROUTES PRIVÉES (il faut être connecté)
// =============================================

// GET /api/auth/profil
// Voir son profil (token obligatoire)
router.get('/profil', verifierToken, monProfil);

module.exports = router;