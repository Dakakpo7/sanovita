const { listerMedecins, validerMedecin, suspendreMedecin, obtenirStats } = require('./admin.service');

const getMedecins = async (req, res) => {
  try {
    const medecins = await listerMedecins();
    res.status(200).json({ message: 'Medecins recuperes', medecins });
  } catch (erreur) {
    res.status(400).json({ message: erreur.message });
  }
};

const valider = async (req, res) => {
  try {
    const medecin = await validerMedecin(req.params.id);
    res.status(200).json({ message: 'Medecin valide', medecin });
  } catch (erreur) {
    res.status(400).json({ message: erreur.message });
  }
};

const suspendre = async (req, res) => {
  try {
    const medecin = await suspendreMedecin(req.params.id);
    res.status(200).json({ message: 'Medecin suspendu', medecin });
  } catch (erreur) {
    res.status(400).json({ message: erreur.message });
  }
};

const getStats = async (req, res) => {
  try {
    const stats = await obtenirStats();
    res.status(200).json({ message: 'Stats recuperees', stats });
  } catch (erreur) {
    res.status(400).json({ message: erreur.message });
  }
};

module.exports = { getMedecins, valider, suspendre, getStats };