const express = require('express');
const router = express.Router();
const { getProfil, updateProfil, getStats } = require('./medecin.controller');
const { verifierToken } = require('../../middlewares/auth.middleware');
const { verifierRole } = require('../../middlewares/role.middleware');

router.use(verifierToken);
router.use(verifierRole('MEDECIN'));

// GET /api/medecins/profil
router.get('/profil', getProfil);

// PUT /api/medecins/profil
router.put('/profil', updateProfil);

// GET /api/medecins/stats
router.get('/stats', getStats);

module.exports = router;