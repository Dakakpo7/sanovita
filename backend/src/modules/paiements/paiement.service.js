const { supabaseAdmin } = require('../../config/supabase');
const dotenv = require('dotenv');
dotenv.config();

// =============================================
// SIMULER UN PAIEMENT (sans Stripe pour l instant)
// =============================================
const initierPaiement = async (rdvId, patientUserId) => {

  // Verifier que le rendez-vous existe
  const { data: rdv, error: erreurRdv } = await supabaseAdmin
    .from('rendez_vous')
    .select(`
      id,
      statut,
      paiement_statut,
      medecins (
        tarif,
        users (
          nom,
          prenom
        )
      ),
      patients (
        user_id
      )
    `)
    .eq('id', rdvId)
    .single();

  if (erreurRdv || !rdv) {
    throw new Error('Rendez-vous introuvable');
  }

  // Verifier que le patient est bien celui connecte
  if (rdv.patients?.user_id !== patientUserId) {
    throw new Error('Vous n etes pas autorise a payer ce rendez-vous');
  }

  // Verifier que le paiement n est pas deja fait
  if (rdv.paiement_statut === 'PAYE') {
    throw new Error('Ce rendez-vous est deja paye');
  }

  const tarif = rdv.medecins?.tarif;
  const nomMedecin = `Dr ${rdv.medecins?.users?.nom} ${rdv.medecins?.users?.prenom}`;

  // Simuler un paiement reussi
  // En production on utiliserait Stripe ou FedaPay ici
  const paiementSimule = {
    id: 'PAY-' + Date.now(),
    montant: tarif,
    devise: 'FCFA',
    statut: 'SUCCES',
    medecin: nomMedecin,
    rdv_id: rdvId
  };

  // Mettre a jour le statut de paiement du rdv
  const { error: erreurMaj } = await supabaseAdmin
    .from('rendez_vous')
    .update({
      paiement_statut: 'PAYE',
      stripe_payment_id: paiementSimule.id
    })
    .eq('id', rdvId);

  if (erreurMaj) {
    throw new Error('Erreur lors de la mise a jour du paiement');
  }

  return paiementSimule;
};

// =============================================
// HISTORIQUE DES PAIEMENTS
// =============================================
const obtenirHistoriquePaiements = async (patientUserId) => {

  // Recuperer le patient
  const { data: patient } = await supabaseAdmin
    .from('patients')
    .select('id')
    .eq('user_id', patientUserId)
    .single();

  if (!patient) {
    throw new Error('Patient introuvable');
  }

  // Recuperer tous les rdvs payes
  const { data, error } = await supabaseAdmin
    .from('rendez_vous')
    .select(`
      id,
      date_heure,
      paiement_statut,
      stripe_payment_id,
      medecins (
        tarif,
        users (
          nom,
          prenom
        )
      )
    `)
    .eq('patient_id', patient.id)
    .eq('paiement_statut', 'PAYE')
    .order('date_heure', { ascending: false });

  if (error) {
    throw new Error('Erreur historique paiements : ' + error.message);
  }

  return data;
};

module.exports = { initierPaiement, obtenirHistoriquePaiements };