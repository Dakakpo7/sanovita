const express = require('express');
const router = express.Router();
const {
  demarrer,
  terminer,
  obtenir,
  listerPatient,
  uploaderOrdonnance
} = require('./consultation.controller');
const { verifierToken } = require('../../middlewares/auth.middleware');
const { verifierRole } = require('../../middlewares/role.middleware');
const multer = require('multer');
const path = require('path');

// Configuration de multer pour les uploads de fichiers
const stockage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const nomUnique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, nomUnique + path.extname(file.originalname));
  }
});

// Filtrer les types de fichiers autorises
const filtrerFichiers = (req, file, cb) => {
  const typesAutorises = /pdf|jpeg|jpg|png/;
  const extValide = typesAutorises.test(
    path.extname(file.originalname).toLowerCase()
  );
  if (extValide) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers PDF, JPEG et PNG sont autorises'));
  }
};

const upload = multer({
  storage: stockage,
  fileFilter: filtrerFichiers,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB maximum
});

// Toutes les routes necessitent d etre connecte
router.use(verifierToken);

// POST /api/consultations/demarrer
// Demarrer une consultation (MEDECIN uniquement)
router.post('/demarrer', verifierRole('MEDECIN'), demarrer);

// PUT /api/consultations/:id/terminer
// Terminer une consultation (MEDECIN uniquement)
router.put('/:id/terminer', verifierRole('MEDECIN'), terminer);

// GET /api/consultations/:id
// Voir une consultation (MEDECIN et PATIENT)
router.get('/:id', obtenir);

// GET /api/consultations/mes-consultations
// Voir toutes ses consultations (PATIENT)
router.get('/mes-consultations', verifierRole('PATIENT'), listerPatient);

// POST /api/consultations/:id/ordonnance
// Uploader une ordonnance (MEDECIN uniquement)
router.post('/:id/ordonnance', verifierRole('MEDECIN'), upload.single('ordonnance'), uploaderOrdonnance);

module.exports = router;