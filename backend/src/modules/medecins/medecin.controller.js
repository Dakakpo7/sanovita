const {
  obtenirProfil,
  mettreAJourProfil,
  obtenirStatistiques
} = require('./medecin.service');

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

// Obtenir ses statistiques
const getStats = async (req, res) => {
  try {
    const stats = await obtenirStatistiques(req.utilisateur.id);
    res.status(200).json({
      message: 'Statistiques recuperees',
      stats
    });
  } catch (erreur) {
    res.status(400).json({ message: erreur.message });
  }
};

module.exports = { getProfil, updateProfil, getStats };