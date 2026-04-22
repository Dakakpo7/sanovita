const {
  demarrerConsultation,
  terminerConsultation,
  obtenirConsultation,
  listerConsultationsPatient,
  sauvegarderOrdonnance
} = require('./consultation.service');

// Demarrer une consultation
const demarrer = async (req, res) => {
  try {
    const { rdv_id } = req.body;
    const consultation = await demarrerConsultation(rdv_id, req.utilisateur.id);
    res.status(201).json({
      message: 'Consultation demarree avec succes',
      consultation
    });
  } catch (erreur) {
    res.status(400).json({ message: erreur.message });
  }
};

// Terminer une consultation
const terminer = async (req, res) => {
  try {
    const { id } = req.params;
    const donnees = req.body;
    const consultation = await terminerConsultation(id, donnees);
    res.status(200).json({
      message: 'Consultation terminee avec succes',
      consultation
    });
  } catch (erreur) {
    res.status(400).json({ message: erreur.message });
  }
};

// Obtenir une consultation
const obtenir = async (req, res) => {
  try {
    const { id } = req.params;
    const consultation = await obtenirConsultation(id);
    res.status(200).json({
      message: 'Consultation recuperee',
      consultation
    });
  } catch (erreur) {
    res.status(400).json({ message: erreur.message });
  }
};

// Lister les consultations d un patient
const listerPatient = async (req, res) => {
  try {
    const consultations = await listerConsultationsPatient(req.utilisateur.id);
    res.status(200).json({
      message: 'Consultations recuperees',
      consultations
    });
  } catch (erreur) {
    res.status(400).json({ message: erreur.message });
  }
};

// Uploader une ordonnance
const uploaderOrdonnance = async (req, res) => {
  try {
    const { id } = req.params;

    // Verifier qu un fichier a bien ete envoye
    if (!req.file) {
      return res.status(400).json({
        message: 'Aucun fichier envoye'
      });
    }

    // Construire l url du fichier uploade
    const ordonnanceUrl = `/uploads/${req.file.filename}`;

    const consultation = await sauvegarderOrdonnance(id, ordonnanceUrl);
    res.status(200).json({
      message: 'Ordonnance uploadee avec succes',
      ordonnance_url: ordonnanceUrl,
      consultation
    });
  } catch (erreur) {
    res.status(400).json({ message: erreur.message });
  }
};

module.exports = {
  demarrer,
  terminer,
  obtenir,
  listerPatient,
  uploaderOrdonnance
};