const express = require('express');
const router = express.Router();
const { getProfil, updateProfil, getHistorique } = require('./patient.controller');
const { verifierToken } = require('../../middlewares/auth.middleware');
const { verifierRole } = require('../../middlewares/role.middleware');

router.use(verifierToken);
router.use(verifierRole('PATIENT'));

// GET /api/patients/profil
router.get('/profil', getProfil);

// PUT /api/patients/profil
router.put('/profil', updateProfil);

// GET /api/patients/historique
router.get('/historique', getHistorique);

module.exports = router;