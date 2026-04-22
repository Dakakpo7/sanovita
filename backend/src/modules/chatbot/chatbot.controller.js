const { envoyerMessage, obtenirHistorique } = require('./chatbot.service');

// Envoyer un message au chatbot
const chat = async (req, res) => {
  try {
    const { message, historique } = req.body;

    // Verifier que le message est present
    if (!message) {
      return res.status(400).json({
        message: 'Le message est obligatoire'
      });
    }

    // Utiliser l historique envoye par le frontend
    // ou un tableau vide si c est le premier message
    const historiqueMessages = historique || [];

    // Appeler le service chatbot
    const reponse = await envoyerMessage(
      req.utilisateur.id,
      message,
      historiqueMessages
    );

    res.status(200).json({
      message: 'Reponse du chatbot',
      reponse: reponse.message,
      tokens_utilises: reponse.tokens_utilises
    });

  } catch (erreur) {
    res.status(400).json({
      message: erreur.message
    });
  }
};

// Recuperer l historique des conversations
const historique = async (req, res) => {
  try {
    const hist = await obtenirHistorique(req.utilisateur.id);
    res.status(200).json({
      message: 'Historique recupere',
      historique: hist
    });
  } catch (erreur) {
    res.status(400).json({
      message: erreur.message
    });
  }
};

module.exports = { chat, historique };