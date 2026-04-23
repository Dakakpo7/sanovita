const { initierPaiement, obtenirHistoriquePaiements } = require('./paiement.service');

// Initier un paiement
const payer = async (req, res) => {
  try {
    const { rdv_id } = req.body;

    if (!rdv_id) {
      return res.status(400).json({
        message: 'L identifiant du rendez-vous est obligatoire'
      });
    }

    const paiement = await initierPaiement(rdv_id, req.utilisateur.id);

    res.status(200).json({
      message: 'Paiement effectue avec succes',
      paiement
    });

  } catch (erreur) {
    res.status(400).json({ message: erreur.message });
  }
};

// Historique des paiements
const historique = async (req, res) => {
  try {
    const paiements = await obtenirHistoriquePaiements(req.utilisateur.id);
    res.status(200).json({
      message: 'Historique recupere',
      paiements
    });
  } catch (erreur) {
    res.status(400).json({ message: erreur.message });
  }
};

module.exports = { payer, historique };