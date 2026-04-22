const express = require('express');
const router = express.Router();
const { 
  creerRendezVous, 
  obtenirRendezVousPatient,
  obtenirRendezVousMedecin,
  annulerRendezVous,
  confirmerRendezVous,
  obtenirMedecins
} = require('./rdv.controller');
const { verifierToken } = require('../../middlewares/auth.middleware');
const { verifierRole } = require('../../middlewares/role.middleware');

// Toutes les routes necessitent d'etre connecte
router.use(verifierToken);

// POST /api/rdv
// Creer un nouveau rendez-vous (PATIENT uniquement)
router.post('/', verifierRole('PATIENT'), creerRendezVous);

// GET /api/rdv/mes-rdv
// Voir ses propres rendez-vous (PATIENT)
router.get('/mes-rdv', verifierRole('PATIENT'), obtenirRendezVousPatient);

// GET /api/rdv/mes-consultations
// Voir ses rendez-vous (MEDECIN)
router.get('/mes-consultations', verifierRole('MEDECIN'), obtenirRendezVousMedecin);

// PUT /api/rdv/:id/annuler
// Annuler un rendez-vous
router.put('/:id/annuler', annulerRendezVous);

// GET /api/rdv/medecins
// Lister tous les medecins disponibles
router.get('/medecins', obtenirMedecins);

// PUT /api/rdv/:id/confirmer
// Confirmer un rendez-vous (MEDECIN uniquement)
router.put('/:id/confirmer', verifierRole('MEDECIN'), confirmerRendezVous);

module.exports = router;