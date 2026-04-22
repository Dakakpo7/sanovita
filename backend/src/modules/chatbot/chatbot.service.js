const { supabaseAdmin } = require('../../config/supabase');
const dotenv = require('dotenv');
dotenv.config();

// Prompt medical securise
const PROMPT_MEDICAL = `Tu es un assistant medical d urgence de la plateforme SanoVita. 
Tu fournis des conseils generaux de sante. 
Tu NE poses PAS de diagnostic medical. 
Tu NE prescris PAS de medicaments. 
En cas de situation grave ou d urgence, tu rediriges TOUJOURS vers les urgences ou un medecin. 
Tu restes bienveillant, clair et concis dans tes reponses. 
Tu reponds toujours en francais.`;

// Reponses simulees en attendant les credits OpenAI
const reponsesSimulees = [
  'Bonjour ! Je suis l assistant medical SanoVita. Pour un mal de tete leger, je vous conseille de vous reposer, de boire suffisamment d eau et de prendre un analgesique si necessaire. Si la douleur persiste plus de 48h, consultez un medecin.',
  'Je comprends votre inquietude. En cas de fievre superieure a 39 degres, consultez immediatement un medecin ou rendez-vous aux urgences. En attendant, hydratez-vous bien.',
  'Pour une douleur abdominale intense, je vous recommande de consulter un medecin rapidement. Evitez de manger et ne prenez pas de medicaments sans avis medical.',
  'Si vous ressentez des douleurs thoraciques ou des difficultes a respirer, appelez immediatement le 15 ou rendez-vous aux urgences. C est une situation qui necessite une prise en charge immediate.',
  'Pour une toux persistante depuis plus de 2 semaines, il est conseille de consulter un medecin. En attendant, evitez les environnements enfumes et restez bien hydrate.',
  'En cas de doute sur votre etat de sante, il vaut toujours mieux consulter un professionnel de sante. Je peux vous aider a prendre un rendez-vous avec un de nos medecins sur SanoVita.'
];

// Choisir une reponse simulee selon le message
const choisirReponse = (message) => {
  const msgMin = message.toLowerCase();

  if (msgMin.includes('tete') || msgMin.includes('migraine')) {
    return reponsesSimulees[0];
  } else if (msgMin.includes('fievre') || msgMin.includes('temperature')) {
    return reponsesSimulees[1];
  } else if (msgMin.includes('ventre') || msgMin.includes('abdomin')) {
    return reponsesSimulees[2];
  } else if (msgMin.includes('coeur') || msgMin.includes('respir') || msgMin.includes('thorax')) {
    return reponsesSimulees[3];
  } else if (msgMin.includes('toux') || msgMin.includes('gorge')) {
    return reponsesSimulees[4];
  } else {
    return reponsesSimulees[5];
  }
};

// =============================================
// ENVOYER UN MESSAGE AU CHATBOT
// =============================================
const envoyerMessage = async (userId, message, historiqueMessages) => {

  // Verifier que le message n est pas vide
  if (!message || message.trim() === '') {
    throw new Error('Le message ne peut pas etre vide');
  }

  // Choisir une reponse simulee intelligente
  const reponseBot = choisirReponse(message);

  // Sauvegarder le message de l utilisateur
  await supabaseAdmin
    .from('messages_chat')
    .insert([{
      sender_id: userId,
      receiver_id: null,
      contenu: message,
      type: 'TEXTE'
    }]);

  // Sauvegarder la reponse du chatbot
  await supabaseAdmin
    .from('messages_chat')
    .insert([{
      sender_id: null,
      receiver_id: userId,
      contenu: reponseBot,
      type: 'TEXTE'
    }]);

  return {
    message: reponseBot,
    tokens_utilises: 0
  };
};

// =============================================
// RECUPERER L HISTORIQUE DES CONVERSATIONS
// =============================================
const obtenirHistorique = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('messages_chat')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('timestamp', { ascending: true })
    .limit(50);

  if (error) {
    throw new Error('Erreur lors de la recuperation de l historique');
  }

  const historique = data.map(msg => ({
    role: msg.sender_id === userId ? 'user' : 'assistant',
    content: msg.contenu
  }));

  return historique;
};

module.exports = { envoyerMessage, obtenirHistorique };