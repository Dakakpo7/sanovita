const { inscrireUtilisateur, connecterUtilisateur } = require('./auth.service');

const inscription = async (req, res) => {
  try {
    const donnees = req.body;
    const nouvelUtilisateur = await inscrireUtilisateur(donnees);
    res.status(201).json({
      message: 'Compte cree avec succes',
      utilisateur: nouvelUtilisateur
    });
  } catch (erreur) {
    res.status(400).json({
      message: erreur.message
    });
  }
};

const connexion = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;
    const resultat = await connecterUtilisateur(email, mot_de_passe);
    res.status(200).json({
      message: 'Connexion reussie',
      token: resultat.token,
      utilisateur: resultat.utilisateur
    });
  } catch (erreur) {
    res.status(400).json({
      message: erreur.message
    });
  }
};

const monProfil = async (req, res) => {
  try {
    res.status(200).json({
      message: 'Profil recupere',
      utilisateur: req.utilisateur
    });
  } catch (erreur) {
    res.status(400).json({
      message: erreur.message
    });
  }
};

module.exports = { inscription, connexion, monProfil };