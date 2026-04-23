const { supabaseAdmin } = require('../config/supabase');

// =============================================
// ENVOYER UNE NOTIFICATION PUSH
// =============================================
const envoyerNotification = async (userId, titre, corps, donnees = {}) => {
  try {
    // Recuperer le token FCM de l utilisateur
    const { data: utilisateur } = await supabaseAdmin
      .from('users')
      .select('fcm_token, nom, prenom')
      .eq('id', userId)
      .single();

    if (!utilisateur?.fcm_token) {
      console.log('Pas de token FCM pour cet utilisateur');
      return false;
    }

    // Pour l instant on simule l envoi
    // Quand Firebase sera configure on activera l envoi reel
    console.log('Notification simulee :');
    console.log('Destinataire :', utilisateur.nom, utilisateur.prenom);
    console.log('Titre :', titre);
    console.log('Corps :', corps);
    console.log('Donnees :', donnees);

    return true;

  } catch (erreur) {
    console.error('Erreur notification :', erreur.message);
    return false;
  }
};

// =============================================
// ENVOYER UN RAPPEL MEDICAMENT
// =============================================
const envoyerRappelMedicament = async (userId, nomMedicament, dosage) => {
  const titre = 'Rappel medicament SanoVita';
  const corps = `Il est l heure de prendre votre ${nomMedicament} - ${dosage}`;

  return envoyerNotification(userId, titre, corps, {
    type: 'RAPPEL_MEDICAMENT',
    medicament: nomMedicament,
    dosage
  });
};

// =============================================
// ENVOYER UNE CONFIRMATION DE RDV
// =============================================
const envoyerConfirmationRdv = async (userId, dateHeure, nomMedecin) => {
  const titre = 'Rendez-vous confirme';
  const corps = `Votre RDV avec Dr ${nomMedecin} le ${dateHeure} est confirme`;

  return envoyerNotification(userId, titre, corps, {
    type: 'CONFIRMATION_RDV'
  });
};

// =============================================
// ENVOYER UN RAPPEL DE RDV
// =============================================
const envoyerRappelRdv = async (userId, dateHeure, nomMedecin) => {
  const titre = 'Rappel rendez-vous dans 1h';
  const corps = `N oubliez pas votre RDV avec Dr ${nomMedecin} a ${dateHeure}`;

  return envoyerNotification(userId, titre, corps, {
    type: 'RAPPEL_RDV'
  });
};

module.exports = {
  envoyerNotification,
  envoyerRappelMedicament,
  envoyerConfirmationRdv,
  envoyerRappelRdv
};