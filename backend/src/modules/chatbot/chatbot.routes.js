const express = require('express');
const router = express.Router();
const { chat, historique } = require('./chatbot.controller');
const { verifierToken } = require('../../middlewares/auth.middleware');

// Toutes les routes necessitent d etre connecte
router.use(verifierToken);

// POST /api/chatbot/message
// Envoyer un message au chatbot medical
router.post('/message', chat);

// GET /api/chatbot/historique
// Recuperer l historique des conversations
router.get('/historique', historique);

module.exports = router;