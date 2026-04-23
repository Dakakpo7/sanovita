const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Creer le dossier uploads s il n existe pas
const creerDossier = (dossier) => {
  if (!fs.existsSync(dossier)) {
    fs.mkdirSync(dossier, { recursive: true });
  }
};

// =============================================
// CONFIGURATION STOCKAGE ORDONNANCES
// =============================================
const stockageOrdonnances = multer.diskStorage({
  destination: (req, file, cb) => {
    const dossier = 'uploads/ordonnances';
    creerDossier(dossier);
    cb(null, dossier);
  },
  filename: (req, file, cb) => {
    const nomUnique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'ordonnance-' + nomUnique + path.extname(file.originalname));
  }
});

// =============================================
// CONFIGURATION STOCKAGE PHOTOS PROFIL
// =============================================
const stockagePhotos = multer.diskStorage({
  destination: (req, file, cb) => {
    const dossier = 'uploads/photos';
    creerDossier(dossier);
    cb(null, dossier);
  },
  filename: (req, file, cb) => {
    const nomUnique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'photo-' + nomUnique + path.extname(file.originalname));
  }
});

// =============================================
// FILTRE FICHIERS AUTORISES
// =============================================
const filtrerDocuments = (req, file, cb) => {
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

const filtrerImages = (req, file, cb) => {
  const typesAutorises = /jpeg|jpg|png/;
  const extValide = typesAutorises.test(
    path.extname(file.originalname).toLowerCase()
  );
  if (extValide) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers JPEG et PNG sont autorises'));
  }
};

// =============================================
// EXPORTATION DES MIDDLEWARES
// =============================================
const uploadOrdonnance = multer({
  storage: stockageOrdonnances,
  fileFilter: filtrerDocuments,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).single('ordonnance');

const uploadPhoto = multer({
  storage: stockagePhotos,
  fileFilter: filtrerImages,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
}).single('photo');

module.exports = { uploadOrdonnance, uploadPhoto };