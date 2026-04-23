const {
  obtenirProfil,
  mettreAJourProfil,
  obtenirHistoriqueMedical
} = require('./patient.service');

// Obtenir son profil
const getProfil = async (req, res) => {
  try {
    const profil = await obtenirProfil(req.utilisateur.id);
    res.status(200).json({
      message: 'Profil recupere',
      profil
    });
  } catch (erreur) {
    res.status(400).json({ message: erreur.message });
  }
};

// Mettre a jour son profil
const updateProfil = async (req, res) => {
  try {
    const profil = await mettreAJourProfil(req.utilisateur.id, req.body);
    res.status(200).json({
      message: 'Profil mis a jour avec succes',
      profil
    });
  } catch (erreur) {
    res.status(400).json({ message: erreur.message });
  }
};

// Obtenir son historique medical
const getHistorique = async (req, res) => {
  try {
    const historique = await obtenirHistoriqueMedical(req.utilisateur.id);
    res.status(200).json({
      message: 'Historique recupere',
      historique
    });
  } catch (erreur) {
    res.status(400).json({ message: erreur.message });
  }
};

module.exports = { getProfil, updateProfil, getHistorique };