const express = require('express');
const router = express.Router();
const {
  prescrire,
  confirmer,
  observance,
  rappelsDuJour
} = require('./medicament.controller');
const { verifierToken } = require('../../middlewares/auth.middleware');
const { verifierRole } = require('../../middlewares/role.middleware');

// Toutes les routes necessitent d etre connecte
router.use(verifierToken);

// POST /api/medicaments/prescrire
// Prescrire des medicaments (MEDECIN uniquement)
router.post('/prescrire', verifierRole('MEDECIN'), prescrire);

// POST /api/medicaments/confirmer-prise
// Confirmer une prise de medicament (PATIENT uniquement)
router.post('/confirmer-prise', verifierRole('PATIENT'), confirmer);

// GET /api/medicaments/rappels-du-jour
// Voir les rappels du jour (PATIENT uniquement)
router.get('/rappels-du-jour', verifierRole('PATIENT'), rappelsDuJour);

// GET /api/medicaments/observance/:patient_id
// Voir le taux d observance d un patient (MEDECIN uniquement)
router.get('/observance/:patient_id', verifierRole('MEDECIN'), observance);

module.exports = router;