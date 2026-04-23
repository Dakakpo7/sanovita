const dotenv = require('dotenv');
dotenv.config();

// =============================================
// ENVOYER UN SMS
// =============================================
const envoyerSMS = async (telephone, message) => {
  try {
    // Verifier que les credentials Twilio sont presents
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.log('SMS simule (Twilio non configure) :');
      console.log('Destinataire :', telephone);
      console.log('Message :', message);
      return true;
    }

    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: telephone
    });

    console.log('SMS envoye a :', telephone);
    return true;

  } catch (erreur) {
    console.error('Erreur SMS :', erreur.message);
    return false;
  }
};

// =============================================
// SMS RAPPEL MEDICAMENT
// =============================================
const envoyerSMSRappelMedicament = async (telephone, nomMedicament, dosage) => {
  const message = `SanoVita : Il est l heure de prendre votre ${nomMedicament} - ${dosage}. Connectez-vous pour confirmer la prise.`;
  return envoyerSMS(telephone, message);
};

// =============================================
// SMS CONFIRMATION RDV
// =============================================
const envoyerSMSConfirmationRdv = async (telephone, dateHeure, nomMedecin) => {
  const message = `SanoVita : Votre rendez-vous avec Dr ${nomMedecin} le ${dateHeure} est confirme.`;
  return envoyerSMS(telephone, message);
};

module.exports = {
  envoyerSMS,
  envoyerSMSRappelMedicament,
  envoyerSMSConfirmationRdv
};