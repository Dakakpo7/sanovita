const { 
  reserverRdv,
  listerRdvPatient,
  listerRdvMedecin,
  changerStatutRdv,
  listerMedecins
} = require('./rdv.service');

// Creer un nouveau rendez-vous
const creerRendezVous = async (req, res) => {
  try {
    const rdv = await reserverRdv(req.utilisateur.id, req.body);
    res.status(201).json({
      message: 'Rendez-vous cree avec succes',
      rdv
    });
  } catch (erreur) {
    res.status(400).json({ message: erreur.message });
  }
};

// Obtenir les rendez-vous d'un patient
const obtenirRendezVousPatient = async (req, res) => {
  try {
    const rdvs = await listerRdvPatient(req.utilisateur.id);
    res.status(200).json({
      message: 'Rendez-vous recuperes',
      rdvs
    });
  } catch (erreur) {
    res.status(400).json({ message: erreur.message });
  }
};

// Obtenir les rendez-vous d'un medecin
const obtenirRendezVousMedecin = async (req, res) => {
  try {
    const rdvs = await listerRdvMedecin(req.utilisateur.id);
    res.status(200).json({
      message: 'Consultations recuperees',
      rdvs
    });
  } catch (erreur) {
    res.status(400).json({ message: erreur.message });
  }
};

// Annuler un rendez-vous
const annulerRendezVous = async (req, res) => {
  try {
    const rdv = await changerStatutRdv(req.params.id, 'ANNULE', req.utilisateur.id);
    res.status(200).json({
      message: 'Rendez-vous annule avec succes',
      rdv
    });
  } catch (erreur) {
    res.status(400).json({ message: erreur.message });
  }
};

// Confirmer un rendez-vous
const confirmerRendezVous = async (req, res) => {
  try {
    const rdv = await changerStatutRdv(req.params.id, 'CONFIRME', req.utilisateur.id);
    res.status(200).json({
      message: 'Rendez-vous confirme avec succes',
      rdv
    });
  } catch (erreur) {
    res.status(400).json({ message: erreur.message });
  }
};

// Lister tous les medecins disponibles
const obtenirMedecins = async (req, res) => {
  try {
    const medecins = await listerMedecins();
    res.status(200).json({
      message: 'Medecins recuperes',
      medecins
    });
  } catch (erreur) {
    res.status(400).json({ message: erreur.message });
  }
};

module.exports = { 
  creerRendezVous, 
  obtenirRendezVousPatient,
  obtenirRendezVousMedecin,
  annulerRendezVous,
  confirmerRendezVous,
  obtenirMedecins
};