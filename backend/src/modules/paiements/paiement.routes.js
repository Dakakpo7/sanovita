const express = require('express');
const router = express.Router();
const { payer, historique } = require('./paiement.controller');
const { verifierToken } = require('../../middlewares/auth.middleware');
const { verifierRole } = require('../../middlewares/role.middleware');

router.use(verifierToken);

// POST /api/paiements/payer
// Payer un rendez-vous (PATIENT uniquement)
router.post('/payer', verifierRole('PATIENT'), payer);

// GET /api/paiements/historique
// Voir l historique des paiements (PATIENT uniquement)
router.get('/historique', verifierRole('PATIENT'), historique);

module.exports = router;